import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getServiceByIdAPI } from '../api/services';
import { getProvidersForServiceAPI } from '../api/providers';
import { createBookingAPI } from '../api/bookings';
import BookingModal from '../components/BookingModal';
import StarRating from '../components/StarRating';
import ProviderCard from '../components/ProviderCard';
import { useAuth } from '../context/AuthContext';

const availableRegions = ["All Cities", "Mumbai", "Pune", "Delhi", "Bangalore", "Chennai"];

const ServiceDetailPage = () => {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const cityQuery = selectedCity === 'All Cities' ? '' : selectedCity;
        const [serviceData, providersData] = await Promise.all([
          getServiceByIdAPI(serviceId),
          getProvidersForServiceAPI(serviceId, cityQuery)
        ]);
        setService(serviceData);
        setProviders(providersData);
      } catch (error) {
        toast.error('Could not fetch page details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [serviceId, selectedCity]);

  const handleSelectProvider = (provider) => {
    if (!user) {
      toast.error('You must be logged in to book a service.');
      return navigate('/login');
    }
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };
  
  const handleConfirmBooking = async (bookingData) => {
    if (isSubmitting) return;
    if (!selectedProvider || !selectedProvider.user || !selectedProvider.user._id) {
      toast.error("Provider details are missing. Please try again.");
      setIsModalOpen(false);
      return;
    }
    try {
      setIsSubmitting(true);
      const finalBookingData = { ...bookingData, providerId: selectedProvider.user._id };
      await createBookingAPI(finalBookingData);
      toast.success('Booking created successfully! The provider has been notified.');
      setIsModalOpen(false);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const providersWithPrice = providers.map(p => {
    const rateInfo = p.serviceRates.find(r => r.service === serviceId);
    return { ...p, price: rateInfo ? rateInfo.price : Infinity };
  });

  const sortedProviders = [...providersWithPrice].sort((a, b) => {
      if (sortBy === 'rating') return b.averageRating - a.averageRating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
  });

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!service) return <div className="text-center mt-10">Service not found.</div>;

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-28">
              <img src={`${import.meta.env.VITE_API_BASE_URL}${service.imageUrl}`} alt={service.name} className="w-full h-48 rounded-lg object-cover mb-4"/>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{service.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{service.description}</p>
            </div>
          </div>
          <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                  <h2 className="text-3xl font-bold">Available Providers</h2>
                  <div className="flex gap-4">
                      <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                          {availableRegions.map(city => (<option key={city} value={city}>{city}</option>))}
                      </select>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                          <option value="rating">Sort by Highest Rating</option>
                          <option value="experience">Sort by Most Experience</option>
                          <option value="price_asc">Sort by Price: Low to High</option>
                          <option value="price_desc">Sort by Price: High to Low</option>
                      </select>
                  </div>
              </div>
            {sortedProviders.length > 0 ? (
              <div className="space-y-4">
                {sortedProviders.map((profile) => (
                  <ProviderCard 
                    key={profile._id} 
                    profile={profile}
                    onBook={handleSelectProvider}
                    isCurrentUser={user && user._id === profile.user?._id}
                  />
                ))}
              </div>
            ) : (
              <p className="card text-center p-8">No providers are currently available for this service in the selected city.</p>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && selectedProvider && (<BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmBooking} service={service} provider={selectedProvider} isSubmitting={isSubmitting} />)}
    </>
  );
};
export default ServiceDetailPage;