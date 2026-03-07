const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { verifyToken: auth } = require('../../shared/middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images, pdfs, docs
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports images, pdfs, and docs!'));
    }
});

// Get messages for a case
router.get('/:caseId', auth, chatController.getMessages);

// Send a message to a case
router.post('/:caseId/message', auth, chatController.sendMessage);

// Upload a file
router.post('/upload', auth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Return file metadata so frontend can attach it to a message
    res.json({
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
    });
});

module.exports = router;
