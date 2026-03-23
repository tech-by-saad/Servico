import Message from '../models/Message.js';
import Booking from '../models/Booking.js';

export const getMessagesForBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        const isCustomer = booking.customer.toString() === userId.toString();
        const isProvider = booking.provider.toString() === userId.toString();
        if (!isCustomer && !isProvider) {
            return res.status(403).json({ message: 'Not authorized to view this chat.' });
        }
        const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 'asc' });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};