import Notification from '../models/Notification.js';

const createNotification = async (userId, message, link) => {
    try {
        if (!userId) {
            console.error('Notification creation failed: userId is missing.');
            return;
        }
        const notification = new Notification({
            user: userId,
            message,
            link,
        });
        await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export default createNotification;