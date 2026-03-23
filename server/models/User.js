import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
    googleId: { type: String },
    isBlocked: { type: Boolean, default: false },
    providerProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile' },
    profilePicture: { type: String, default: '/uploads/default-avatar.png' },
    age: { type: Number },
    contact: { type: String },
    address: { type: String },
    passwordResetToken: String,
    passwordResetExpires: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;