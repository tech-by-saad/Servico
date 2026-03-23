import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';

export const getAllUsers = async (req, res) => {
    const { keyword, role } = req.query;

    const query = {
        role: { $ne: 'admin' } // Always exclude admins
    };

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
        ];
    }

    if (role && (role === 'customer' || role === 'provider')) {
        query.role = role;
    }

    try {
        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const toggleUserBlockStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isBlocked = !user.isBlocked;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isBlocked: updatedUser.isBlocked,
                profilePicture: updatedUser.profilePicture // Ensure profile pic is returned
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const totalProviders = await ProviderProfile.countDocuments({ status: 'approved' });
        const totalBookings = await Booking.countDocuments({});
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const bookingsByDay = await Booking.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        
        const popularServices = await Booking.aggregate([
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'serviceDetails' } },
            { $unwind: '$serviceDetails' },
            { $project: { name: '$serviceDetails.name', count: 1, _id: 0 } }
        ]);

        res.json({
            totalUsers,
            totalProviders,
            totalBookings,
            bookingsByDay,
            popularServices
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
