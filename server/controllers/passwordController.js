import crypto from 'crypto';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No user with that email address exists.' });
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, secure: false, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });
        const mailOptions = {
            from: `Servico <${process.env.EMAIL_USER}>`, to: user.email, subject: 'Password Reset Request', text: `Please click on the following link to reset your password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.\n`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'An email has been sent with password reset instructions.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email. Please try again later.' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ message: 'Token is invalid or has expired.' });
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been successfully reset.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};