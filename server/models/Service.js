import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;