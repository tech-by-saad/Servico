import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    service: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Service' },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingDate: { type: Date, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'cancellation_pending', 'completion_pending'], default: 'pending' },
    totalPrice: { type: Number, required: true },
    cancellationRequester: { type: String, enum: ['customer', 'provider'] },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;