import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';

async function updateProviderRating(providerId) {
    const reviews = await Review.find({ provider: providerId });
    const numReviews = reviews.length;
    const averageRating = numReviews > 0 
        ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
        : 0;
    await ProviderProfile.findOneAndUpdate({ user: providerId }, { averageRating: averageRating.toFixed(1), numReviews });
}

export const createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user._id;
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.customer.toString() !== customerId.toString()) {
            return res.status(403).json({ message: 'You can only review your own bookings.' });
        }
        if (booking.status !== 'completion_pending') {
            return res.status(400).json({ message: 'You can only review services pending completion.' });
        }
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ message: 'This booking has already been reviewed.' });
        }
        const review = new Review({
            booking: bookingId, provider: booking.provider, customer: customerId, rating, comment,
        });
        await review.save();
        booking.status = 'completed';
        await booking.save();
        await updateProviderRating(booking.provider);
        res.status(201).json({ message: 'Review submitted and booking completed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate('customer', 'name'); // This ensures the customer's name is always included
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};