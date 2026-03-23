import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Checks if a user is blocked during the login attempt.
export const checkIfBlocked = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next();
    }
    const user = await User.findOne({ email });
    if (user && user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked.' });
    }
    next();
};

// Protects routes by verifying a user's JWT token.
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (req.user && req.user.isBlocked) {
                return res.status(403).json({ message: 'Access denied. Your account is blocked.' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Checks if the logged-in user has an 'admin' role.
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};