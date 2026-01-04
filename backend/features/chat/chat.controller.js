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

const Notification = require('../notifications/notification.model');

// ...

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { message, files } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        // Verify case access & Identify Recipient
        const caseItem = await Case.findById(caseId);
        if (!caseItem) return res.status(404).json({ msg: 'Case not found' });

        // Determine recipient
        let recipientId;
        if (senderRole === 'client') {
            recipientId = caseItem.assignedLawyerId;
        } else if (senderRole === 'lawyer') {
            recipientId = caseItem.clientId;
        }

        // Only allow if involved
        const isClient = caseItem.clientId.toString() === senderId;
        const isLawyer = caseItem.assignedLawyerId && caseItem.assignedLawyerId.toString() === senderId;

        if (!isClient && !isLawyer && senderRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

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

            // Send Notification to Recipient
            if (recipientId) {
                await Notification.create({
                    userId: recipientId,
                    type: 'INFO',
                    message: `New message from ${req.user.name}`,
                    relatedId: caseId,
                    link: `/cases/${caseId}/communicate`
                });
            }
        } catch (socketErr) {
            console.error("Socket/Notification failed:", socketErr.message);
        }

        res.json(savedChat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
