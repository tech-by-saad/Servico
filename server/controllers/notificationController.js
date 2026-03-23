import Notification from '../models/Notification.js';

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};