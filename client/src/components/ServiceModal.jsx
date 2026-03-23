import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Wrench } from 'lucide-react';

const ServiceModal = ({ isOpen, onClose, onSave, serviceToEdit }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name || '',
        description: serviceToEdit.description || '',
      });
      setPreview(`${import.meta.env.VITE_API_BASE_URL}${serviceToEdit.imageUrl}`);
    } else {
      setFormData({ name: '', description: '' });
      setPreview(null);
    }
    setImageFile(null);
  }, [serviceToEdit, isOpen]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg" role="dialog">
        <div className="flex items-center text-gray-800 mb-6">
          <Wrench size={24} className="mr-3 text-blue-500" />
          <h2 className="text-2xl font-bold">
            {serviceToEdit ? 'Edit Service' : 'Create a New Service'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Service Name" className="w-full p-3 border rounded-lg" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded-lg h-28" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
            {preview && <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2"/>}
            <input type="file" name="image" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!serviceToEdit} />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ServiceModal;