import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import Message from './models/Message.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } });

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/notifications', notificationRoutes);

io.on('connection', (socket) => {
    console.log('🔌 A user connected:', socket.id);
    socket.on('join_chat', (bookingId) => socket.join(bookingId));
    socket.on('send_message', async (data) => {
        const message = new Message(data);
        await message.save();
        io.to(data.booking).emit('receive_message', data);
    });
    socket.on('disconnect', () => {
        console.log('🔥 A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server with Socket.IO running on port ${PORT}`));