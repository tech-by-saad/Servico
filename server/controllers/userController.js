import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            profilePicture: user.profilePicture, age: user.age, contact: user.contact, address: user.address,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.age = req.body.age || user.age;
        user.contact = req.body.contact || user.contact;
        user.address = req.body.address || user.address;

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }
        
        const updatedUser = await user.save();
        
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            age: updatedUser.age,
            contact: updatedUser.contact,
            address: updatedUser.address,
            token: req.headers.authorization.split(' ')[1],
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } else {
        res.status(401).json({ message: 'Invalid current password' });
    }
};