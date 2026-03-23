import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture, // Also include on register
                age: user.age,
                contact: user.contact,
                address: user.address,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            // --- THIS IS THE FIX ---
            // We now send back all the profile data, not just the basics.
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                age: user.age,
                contact: user.contact,
                address: user.address,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const googleAuth = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const { name, email, sub } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (user) {
            // This is an existing user. Link their Google ID.
            user.googleId = user.googleId || sub;
            await user.save();
        } else {
            // --- THIS IS THE FINAL FIX ---
            // When creating a new user via Google, we DO NOT save their Google picture.
            // This forces the database to use the default avatar we set in the User model.
            user = await User.create({ name, email, googleId: sub });
        }

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            profilePicture: user.profilePicture, age: user.age, contact: user.contact, address: user.address,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Google Auth Error:", error)
        res.status(400).json({ message: 'Google authentication failed' });
    }
};

export const registerAdmin = async (req, res) => {
    const { name, email, password, secret } = req.body;

    // Check if the provided secret matches the one in our .env file
    if (secret !== process.env.ADMIN_REGISTRATION_SECRET) {
        return res.status(401).json({ message: 'Not authorized to create an admin account.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Admin with this email already exists' });

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin', // Set role directly to admin
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};