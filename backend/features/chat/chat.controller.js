const Chat = require('./chat.model');
const { getIo } = require('./socket');
const Case = require('../cases/case.model');

// Get chat history
exports.getMessages = async (req, res) => {
    try {
        const { caseId } = req.params;
        const messages = await Chat.find({ caseId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { message, files } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role; // Assuming middleware populates this

        // Verify case access (Optional but good)
        // const kase = await Case.findById(caseId);
        // if (!kase) return res.status(404).json({ msg: 'Case not found' });
        // Check if user is lawyer or client of this case...

        const newChat = new Chat({
            caseId,
            sender: {
                id: senderId,
                role: senderRole,
                name: req.user.name
            },
            message,
            files: files || []
        });

        const savedChat = await newChat.save();

        // Emit via Socket.io
        try {
            const io = getIo();
            io.to(caseId).emit('receive_message', savedChat);
        } catch (socketErr) {
            console.error("Socket emit failed:", socketErr.message);
            // Don't fail the request if socket fails
        }

        res.json(savedChat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
