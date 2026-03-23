import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getServicesAPI } from '../api/services';
import { applyToBeProviderAPI } from '../api/providers';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, MapPin, Send } from 'lucide-react';

const availableRegions = ["Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"];

const ProviderApplicationForm = ({ onSuccess, existingProfile }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ experience: '', contact: '', bio: '' });
  const [allServices, setAllServices] = useState([]);
  const [serviceRates, setServiceRates] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!existingProfile) {
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
    } else {
      setLoading(false);
    }
  }, [existingProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleServiceSelectionChange = (serviceId, isChecked) => {
    if (isChecked) {
      setServiceRates([...serviceRates, { service: serviceId, price: '' }]);
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
    const hasInvalidPrice = serviceRates.some(rate => !rate.price || rate.price <= 0);
    if (serviceRates.length === 0 || selectedRegions.length === 0) {
      return toast.error('Please select at least one service and one region.');
    }
    if (hasInvalidPrice) {
        return toast.error('Please set a valid price for all selected services.');
    }
    setIsSubmitting(true);
    
    // --- THIS IS THE FIX ---
    // We now use 'serviceRates' which contains the services and their prices.
    const applicationData = { ...formData, serviceRates: serviceRates, serviceRegions: selectedRegions };

    try {
      const data = await applyToBeProviderAPI(applicationData);
      toast.success('Congratulations! You are now a provider.');
      login(data);
      onSuccess(data.profile);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading Form...</p>;

  if (existingProfile) {
    return (
      <div className="card text-center p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold">Application Status</h1>
        <p className="mt-4">Your application status is: <span className="font-bold uppercase text-blue-600">{existingProfile.status}</span></p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Join Our Professional Network</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Start earning by offering your expert services to our community.</p>
      </div>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-2 rounded-full"><User size={20}/></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" name="experience" placeholder="Years of Experience" onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                <div className="flex items-center">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-full dark:bg-gray-800 dark:border-gray-600">+91</span>
                    <input 
                        type="tel" 
                        name="contact" 
                        placeholder="9876543210" 
                        value={formData.contact} 
                        onChange={handleChange}
                        pattern="[7-9][0-9]{9}"
                        title="Please enter a valid 10-digit Indian mobile number."
                        className="w-full p-3 border rounded-r-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
            </div>
            <textarea name="bio" placeholder="Tell us about yourself and your skills..." onChange={handleChange} className="w-full p-3 border rounded-lg mt-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600" rows="4" required />
          </div>

          <div className="border-t pt-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 p-2 rounded-full"><Briefcase size={20}/></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Services & Prices</h2>
            </div>
            <div className="space-y-4">
                {allServices.map(service => {
                    const currentRate = serviceRates.find(r => r.service === service._id);
                    const isChecked = !!currentRate;
                    return (
                        <div key={service._id} className="flex flex-col md:flex-row items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border dark:border-gray-700">
                            <label className="flex items-center space-x-3 flex-grow">
                                <input type="checkbox" checked={isChecked} onChange={(e) => handleServiceSelectionChange(service._id, e.target.checked)} className="h-5 w-5"/>
                                <span>{service.name}</span>
                            </label>
                            {isChecked && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">₹</span>
                                    <input 
                                        type="number" 
                                        value={currentRate.price} 
                                        onChange={(e) => handlePriceChange(service._id, e.target.value)} 
                                        className="p-2 border rounded-lg w-32 bg-white dark:bg-gray-800 dark:border-gray-600"
                                        placeholder="Your Price"
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
          
          <div className="border-t pt-8 animate-fade-in-up" style={{animationDelay: '200ms'}}>
             <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 p-2 rounded-full"><MapPin size={20}/></div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Service Regions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableRegions.map(region => (
                    <label key={region} className="block relative">
                        <input type="checkbox" value={region} onChange={handleRegionChange} className="peer hidden" />
                        <div className="p-3 border rounded-lg text-center cursor-pointer font-semibold text-sm text-gray-600 dark:text-gray-300 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/50 peer-checked:border-blue-500 peer-checked:text-blue-600 transition-colors">
                            {region}
                        </div>
                    </label>
                ))}
            </div>
          </div>
          
          <div className="pt-6 border-t animate-fade-in-up" style={{animationDelay: '300ms'}}>
            <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2" disabled={isSubmitting}>
              <Send size={18}/>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderApplicationForm;