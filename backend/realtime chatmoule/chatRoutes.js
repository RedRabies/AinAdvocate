// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt');
const chatController = require('../controllers/chatController');

router.post('/send', verifyToken, chatController.sendMessage);
router.get('/:userId', verifyToken, chatController.getConversation);

module.exports = router;
