import mongoose from 'mongoose';

const providerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  experience: { type: Number, required: true },
  contact: { type: String, required: false },
  bio: { type: String, required: true },
  servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  serviceRates: [{
      service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
      price: { type: Number, required: true }
  }],
  serviceRegions: [{ type: String, required: true }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  averageRating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  morningStartTime: { type: String, default: '09:00' },
  morningEndTime: { type: String, default: '12:00' },
  eveningStartTime: { type: String, default: '14:00' },
  eveningEndTime: { type: String, default: '17:00' },
  morningCapacity: { type: Number, default: 1 },
  eveningCapacity: { type: Number, default: 1 },
  halfDayOff: [{
      date: String,
      slot: String
  }],
  unavailableDates: { type: [String], default: [] },
}, { timestamps: true });

const ProviderProfile = mongoose.model('ProviderProfile', providerProfileSchema);
export default ProviderProfile;