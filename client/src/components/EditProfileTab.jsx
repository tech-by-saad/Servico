import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { updateMyProviderProfileAPI } from '../api/providers';

const EditProfileTab = ({ profile, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    experience: profile.experience || '',
    contact: profile.contact || '',
    bio: profile.bio || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateMyProviderProfileAPI(formData);
      toast.success('Provider profile updated successfully!');
      onProfileUpdate(updatedProfile);
    } catch (error) {
      toast.error('Failed to update provider profile.');
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Edit Your Professional Profile</h2>
        <p className="text-sm text-gray-500 -mt-4">This information is shown to customers on your public profile page.</p>
        
        <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
            <input 
              type="number" 
              name="experience" 
              id="experience" 
              value={formData.experience} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg mt-1" 
              required 
            />
        </div>

        <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Professional Contact Number</label>
            <input 
              type="tel" 
              name="contact" 
              id="contact" 
              value={formData.contact} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg mt-1" 
            />
        </div>

        <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio / Professional Description</label>
            <textarea 
              name="bio" 
              id="bio" 
              placeholder="Tell customers about your skills and why they should choose you." 
              value={formData.bio} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg mt-1" 
              rows="5" 
              required 
            />
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Save Professional Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfileTab;