const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for now (adjust for prod)
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('join_case_room', (caseId) => {
            socket.join(caseId);
            console.log(`Socket ${socket.id} joined room: ${caseId}`);
        });

        socket.on('send_message', (data) => {
            // data should include: caseId, message, sender, etc.
            // We just forward it to others in the room
            // Ideally, the HTTP API saves to DB, then calls a function to emit this
            // But if we do purely socket, we handle DB here.
            // We will use the Hybrid approach: HTTP sends to DB, then Controller emits.
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIo };
