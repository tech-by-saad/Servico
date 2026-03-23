import { Server } from 'socket.io';

let io;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // Your frontend URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Join a room based on user ID to send private notifications/messages
        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room.`);
        });

        // Listen for chat messages
        socket.on('sendMessage', ({ senderId, receiverId, message }) => {
            // Emit the message to the receiver's room
            io.to(receiverId).emit('receiveMessage', {
                sender: senderId,
                message: message,
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};