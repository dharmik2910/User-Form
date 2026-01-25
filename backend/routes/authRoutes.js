const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../config/email');
const { uploadToS3, deleteFromS3 } = require('../config/s3');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Create uploads directory if it doesn't exist (for temporary storage)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for file upload (temporary storage before S3 upload)
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

// Register endpoint
router.post('/register', upload.single('photo'), [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('dob').notEmpty().withMessage('Date of birth is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
], async (req, res) => {
    try {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if photo is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Photo is required' });
        }

        const { firstName, lastName, email, password, dob, gender, hobbies } = req.body;

        // Check if user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            // Delete uploaded file if user exists
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Upload photo to S3
        let photoUrl = null;
        try {
            const fileBuffer = fs.readFileSync(req.file.path);
            photoUrl = await uploadToS3(fileBuffer, req.file.originalname, req.file.mimetype);
            // Delete temporary file
            fs.unlinkSync(req.file.path);
        } catch (s3Error) {
            // Clean up temporary file
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({ message: 'Error uploading photo to cloud storage', error: s3Error.message });
        }

        // Create new user
        user = await User.create({
            firstName,
            lastName,
            email,
            password,
            dob: new Date(dob),
            gender,
            hobbies: hobbies ? (Array.isArray(hobbies) ? hobbies : [hobbies]) : [],
            photo: photoUrl
        });

        // Send welcome email
        await sendWelcomeEmail(email, firstName);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully. Welcome email sent.',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login endpoint
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

module.exports = router;
