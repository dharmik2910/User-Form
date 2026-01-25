const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');

dotenv.config();

// Validate AWS credentials
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('WARNING: AWS credentials not found in environment variables.');
    console.warn('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    console.warn('S3 file uploads will fail until credentials are configured.');
}

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'user_images';

/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - The file name
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} The S3 URL of the uploaded file
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    const key = `user-photos/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'private'
    });

    try {
        await s3Client.send(command);
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - The S3 URL of the file
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl) return;

    try {
        // Extract the key from the S3 URL
        const key = fileUrl.split('.amazonaws.com/').pop();
        
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        await s3Client.send(command);
        console.log('File deleted from S3:', key);
    } catch (error) {
        console.error('Error deleting from S3:', error);
        throw new Error('Failed to delete file from S3');
    }
};

/**
 * Generate a signed URL for accessing a private S3 file
 * @param {string} fileUrl - The S3 URL of the file
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<string>} The signed URL
 */
const generateSignedUrl = async (fileUrl, expiresIn = 3600) => {
    if (!fileUrl) return null;

    try {
        const key = fileUrl.split('.amazonaws.com/').pop();
        
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return null;
    }
};

module.exports = {
    s3Client,
    uploadToS3,
    deleteFromS3,
    generateSignedUrl,
    BUCKET_NAME
};
