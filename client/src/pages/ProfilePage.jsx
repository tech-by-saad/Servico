import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateUserProfileAPI, changeUserPasswordAPI } from '../api/users';

const ProfilePage = () => {
    const { user, login } = useAuth();
    
    const [formData, setFormData] = useState({
        name: user.name || '',
        age: user.age || '',
        contact: user.contact?.replace('+91', '') || '',
        address: user.address || '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(user.profilePicture);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData, contact: `+91${formData.contact}` };
            const updatedUser = await updateUserProfileAPI(dataToSend, imageFile);
            login(updatedUser);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile.');
        }
    };
    
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('New passwords do not match.');
        }
        try {
            await changeUserPasswordAPI({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.');
        }
    };

    const handlePasswordInputChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Update Your Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="text-center mb-4">
                        {/* THIS IS THE FIX: We check if 'preview' is a valid string before using .startsWith() */}
                        <img 
                            src={preview && preview.startsWith('blob:') ? preview : `${import.meta.env.VITE_API_BASE_URL}${preview}`} 
                            alt="Profile Preview" 
                            className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200" 
                        />
                        <label htmlFor="profilePicture" className="cursor-pointer text-sm text-blue-600 hover:underline mt-2 inline-block">
                            Change Photo
                        </label>
                        <input 
                            type="file" 
                            id="profilePicture" 
                            name="profilePicture" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>

                    <div>
                        <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700">Email Address (cannot be changed)</label>
                        <input 
                            type="email" 
                            id="profile-email"
                            value={user.email} 
                            disabled 
                            className="w-full p-2 mt-1 border rounded bg-gray-100" 
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                            type="text" 
                            id="profile-name"
                            name="name" 
                            value={formData.name} 
                            onChange={handleFormChange} 
                            className="w-full p-2 mt-1 border rounded" 
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="profile-age" className="block text-sm font-medium text-gray-700">Age</label>
                            <input 
                                type="number" 
                                id="profile-age"
                                name="age" 
                                value={formData.age} 
                                onChange={handleFormChange} 
                                className="w-full p-2 mt-1 border rounded" 
                            />
                        </div>
                        <div>
                            <label htmlFor="profile-contact" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <div className="flex items-center mt-1">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                            <input 
                                type="tel" 
                                id="profile-contact"
                                name="contact" 
                                value={formData.contact} 
                                onChange={handleFormChange}
                                placeholder="9876543210"
                                pattern="[7-9][0-9]{9}" // Validates 10-digit Indian number
                                title="Please enter a valid 10-digit Indian mobile number."
                                className="w-full p-2 border rounded-r-lg" 
                            />
                        </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea 
                            id="profile-address"
                            name="address" 
                            value={formData.address} 
                            onChange={handleFormChange} 
                            className="w-full p-2 mt-1 border rounded" 
                            rows="3"
                        ></textarea>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input 
                            type="password" 
                            id="current-password"
                            name="currentPassword" 
                            value={passwordData.currentPassword} 
                            onChange={handlePasswordInputChange} 
                            placeholder="Current Password" 
                            className="w-full p-2 border rounded mt-1" 
                            required 
                            autoComplete="current-password"
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password-profile" className="block text-sm font-medium text-gray-700">New Password</label>
                        <input 
                            type="password" 
                            id="new-password-profile"
                            name="newPassword" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordInputChange} 
                            placeholder="New Password" 
                            className="w-full p-2 border rounded mt-1" 
                            required 
                            autoComplete="new-password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password-profile" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input 
                            type="password" 
                            id="confirm-password-profile"
                            name="confirmPassword" 
                            value={passwordData.confirmPassword} 
                            onChange={handlePasswordInputChange} 
                            placeholder="Confirm New Password" 
                            className="w-full p-2 border rounded mt-1" 
                            required 
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;