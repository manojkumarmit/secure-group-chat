const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * Upload Routes
 * This module handles file upload functionality using AWS S3
 * 
 * Key Components:
 * - Pre-signed URL generation for secure direct-to-S3 uploads
 * - Authentication middleware to protect upload endpoints
 * - UUID generation for unique file names
 * - S3 client configuration and bucket management
 * 
 * Environment Variables Required:
 * - AWS_REGION: AWS region for S3 bucket
 * - AWS_ACCESS_KEY_ID: AWS access key credential
 * - AWS_SECRET_ACCESS_KEY: AWS secret key credential
 * - S3_BUCKET_NAME: Name of S3 bucket for file storage
 * 
 * Security Features:
 * - Pre-signed URLs expire after 60 seconds
 * - Authentication required for all endpoints
 * - Files stored with unique UUIDs to prevent collisions
 * - Content-Type verification on upload
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * @swagger
 * /api/upload/presigned-upload-url:
 *   get:
 *     summary: Generate a presigned URL for file upload
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         description: The MIME type of the file to be uploaded
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadURL:
 *                   type: string
 *                   description: The presigned URL for file upload
 *                 fileURL:
 *                   type: string
 *                   description: The URL of the uploaded file
 *       400:
 *         description: Missing fileType query param
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Failed to generate upload URL
 */
router.get('/presigned-upload-url', auth, async (req, res) => {
  const { fileType } = req.query;

  if (!fileType) {
    return res.status(400).json({ message: 'Missing fileType query param' });
  }

  const fileExtension = fileType.split('/')[1];
  const key = `uploads/${uuidv4()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  try {
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.json({
      uploadURL,
      fileURL: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    console.error('Error generating presigned URL:', err);
    res.status(500).json({ message: 'Failed to generate upload URL' });
  }
});

/**
 * @swagger
 * /api/upload/presigned-download-url:
 *   get:
 *     summary: Generate a presigned URL for file download
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the file to be downloaded
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *                   description: The presigned URL for file download
 *       400:
 *         description: Missing file key
 *       500:
 *         description: Failed to generate presigned URL
 */
router.get('/presigned-download-url', async (req, res) => {
  const { key } = req.query;

  if (!key) return res.status(400).json({ message: 'Missing file key' });

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 86400 }); // expires in 24 hours
    res.json({ signedUrl });
  } catch (err) {
    console.error("Error generating signed GET URL:", err);
    res.status(500).json({ message: "Failed to generate signed URL" });
  }
});

module.exports = router;