import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createServiceAPI, updateServiceAPI, deleteServiceAPI } from '../../api/admin';
import { getServicesAPI } from '../../api/services';
import ServiceModal from '../../components/ServiceModal';
import { PlusCircle } from 'lucide-react';

const ServiceListPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getServicesAPI();
      setServices(data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreateModal = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setServiceToEdit(null);
  };

  const handleSaveService = async (formData, imageFile) => {
    try {
      if (serviceToEdit) {
        await updateServiceAPI(serviceToEdit._id, formData, imageFile);
        toast.success('Service updated successfully');
      } else {
        await createServiceAPI(formData, imageFile);
        toast.success('Service created successfully');
      }
      handleCloseModal();
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this service?')) {
      try {
        await deleteServiceAPI(id);
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add, edit, or remove the services offered on the platform.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Create Service
        </button>
      </div>

      {/* Services Table */}
      <div className="card overflow-x-auto p-0">
        <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Service Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
            </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
                <tr><td colSpan="4" className="text-center p-8 text-gray-500">Loading services...</td></tr>
            ) : services.map((service) => (
              <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4">
                    <img 
                        src={`${import.meta.env.VITE_API_BASE_URL}${service.imageUrl}`} 
                        alt={service.name}
                        className="h-10 w-16 rounded object-cover"
                    />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{service.description.substring(0, 80)}...</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="bg-indigo-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        serviceToEdit={serviceToEdit}
      />
    </div>
  );
};

export default ServiceListPage;