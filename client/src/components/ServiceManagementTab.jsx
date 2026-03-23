import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getServicesAPI } from '../api/services';
import { updateMyProviderProfileAPI } from '../api/providers';

const availableRegions = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"];

const ServiceManagementTab = ({ profile, onProfileUpdate }) => {
  const [allServices, setAllServices] = useState([]);
  const [serviceRates, setServiceRates] = useState(profile.serviceRates || []);
  const [selectedRegions, setSelectedRegions] = useState(profile.serviceRegions || []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
        try {
            const data = await getServicesAPI();
            setAllServices(data);
        } catch (error) {
            toast.error('Could not load available services.');
        } finally {
            setLoading(false);
        }
    };
    fetchServices();
  }, []);

  const handleServiceSelectionChange = (serviceId, isChecked) => {
    if (isChecked) {
      setServiceRates([...serviceRates, { service: serviceId, price: 0 }]);
    } else {
      setServiceRates(serviceRates.filter(rate => rate.service !== serviceId));
    }
  };

  const handlePriceChange = (serviceId, price) => {
    setServiceRates(serviceRates.map(rate => 
      rate.service === serviceId ? { ...rate, price: Number(price) } : rate
    ));
  };
  
  const handleRegionChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedRegions([...selectedRegions, value]);
    } else {
      setSelectedRegions(selectedRegions.filter((region) => region !== value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasZeroPrice = serviceRates.some(rate => rate.price <= 0);
    if (hasZeroPrice) {
        return toast.error('Please set a valid price (greater than 0) for all selected services.');
    }
    
    // --- THIS IS THE FIX ---
    // The variable name is 'selectedRegions', not 'serviceRegions'
    const updatedData = { serviceRates, serviceRegions: selectedRegions };
    
    try {
      const updatedProfile = await updateMyProviderProfileAPI(updatedData);
      toast.success('Service settings updated!');
      onProfileUpdate(updatedProfile);
    } catch (error) {
      toast.error('Failed to update settings.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-2xl font-semibold">Manage Your Service Offerings</h2>
        
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-3">Services & Prices</h3>
          <div className="space-y-4">
            {allServices.map(service => {
              const currentRate = serviceRates.find(r => r.service === service._id);
              const isChecked = !!currentRate;
              return (
                <div key={service._id} className="flex flex-col md:flex-row items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                  <label className="flex items-center space-x-3 flex-grow">
                    <input type="checkbox" checked={isChecked} onChange={(e) => handleServiceSelectionChange(service._id, e.target.checked)} className="h-5 w-5"/>
                    <span>{service.name}</span>
                  </label>
                  {isChecked && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">₹</span>
                        <input 
                            type="number" 
                            value={currentRate.price || ''} 
                            onChange={(e) => handlePriceChange(service._id, e.target.value)} 
                            className="p-2 border rounded w-32"
                            placeholder="Price"
                            required
                            min="1"
                        />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-3">Service Regions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableRegions.map(region => (
              <label key={region} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                <input type="checkbox" value={region} checked={selectedRegions.includes(region)} onChange={handleRegionChange} className="h-5 w-5"/>
                <span>{region}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button type="submit" className="btn-primary w-full">
          Save Service Settings
        </button>
      </form>
    </div>
  );
};

export default ServiceManagementTab;