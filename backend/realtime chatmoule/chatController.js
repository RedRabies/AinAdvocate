// controllers/chatController.js
const Message = require('../models/chatModel');

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user._id;
    const message = await Message.create({ sender, receiver, content });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.userId;
    const conversation = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
