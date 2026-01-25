const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { uploadToS3, deleteFromS3, generateSignedUrl } = require('../config/s3');

const router = express.Router();

// Multer config for file upload
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to add signed URLs to user data
const addSignedUrlsToUsers = async (users) => {
    return Promise.all(users.map(async (user) => {
        const userData = user.toJSON();
        if (userData.photo) {
            try {
                userData.photo = await generateSignedUrl(userData.photo, 3600); // 1 hour expiry
            } catch (err) {
                console.error('Error generating signed URL:', err.message);
                // Keep original URL if signed URL generation fails
            }
        }
        return userData;
    }));
};

// Get all users
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        
        // Add signed URLs for photos
        const usersWithSignedUrls = await addSignedUrlsToUsers(users);
        
        res.json({
            message: 'Users retrieved successfully',
            count: usersWithSignedUrls.length,
            users: usersWithSignedUrls
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get current user profile
router.get('/profile/me', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userData = user.toJSON();
        
        // Add signed URL for photo
        if (userData.photo) {
            try {
                userData.photo = await generateSignedUrl(userData.photo, 3600); // 1 hour expiry
            } catch (err) {
                console.error('Error generating signed URL:', err.message);
            }
        }
        
        res.json({
            message: 'User profile retrieved',
            user: userData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const userData = user.toJSON();
        
        // Add signed URL for photo
        if (userData.photo) {
            try {
                userData.photo = await generateSignedUrl(userData.photo, 3600); // 1 hour expiry
            } catch (err) {
                console.error('Error generating signed URL:', err.message);
            }
        }
        
        res.json({
            message: 'User retrieved successfully',
            user: userData
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Delete user by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete photo from S3 if exists
        if (user.photo) {
            try {
                await deleteFromS3(user.photo);
            } catch (err) {
                console.error('Error deleting photo from S3:', err.message);
                // Continue with user deletion even if photo deletion fails
            }
        }

        // Delete user record
        await user.destroy();

        res.json({
            message: 'User deleted successfully',
            userId: req.params.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

// Update user by ID
router.put('/:id', auth, upload.single('photo'), [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('dob').optional().notEmpty().withMessage('Date of birth is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ message: 'User not found' });
        }

        const { firstName, lastName, dob, gender, hobbies } = req.body;

        // Update fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (dob) user.dob = new Date(dob);
        if (gender) user.gender = gender;
        if (hobbies) user.hobbies = Array.isArray(hobbies) ? hobbies : [hobbies];

        // Handle photo update
        if (req.file) {
            try {
                // Upload new photo to S3
                const fileBuffer = fs.readFileSync(req.file.path);
                const newPhotoUrl = await uploadToS3(fileBuffer, req.file.originalname, req.file.mimetype);
                
                // Delete old photo from S3
                if (user.photo) {
                    try {
                        await deleteFromS3(user.photo);
                    } catch (err) {
                        console.error('Error deleting old photo from S3:', err.message);
                    }
                }

                user.photo = newPhotoUrl;
                
                // Delete temporary file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (s3Error) {
                // Clean up temporary file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({ message: 'Error uploading photo to cloud storage', error: s3Error.message });
            }
        }

        await user.save();

        const userData = user.toJSON();
        
        // Add signed URL for photo
        if (userData.photo) {
            try {
                userData.photo = await generateSignedUrl(userData.photo, 3600); // 1 hour expiry
            } catch (err) {
                console.error('Error generating signed URL:', err.message);
            }
        }

        res.json({
            message: 'User updated successfully',
            user: userData
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error cleaning up file:', err.message);
            }
        }
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
});

module.exports = router;
