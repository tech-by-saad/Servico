import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProviderPublicProfileAPI } from '../api/providers';
import { createBookingAPI } from '../api/bookings';
import StarRating from '../components/StarRating';
import BookingModal from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';

const ProviderProfilePage = () => {
  const { id: providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [expandedService, setExpandedService] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProviderPublicProfileAPI(providerId);
        setProfileData(data);
        if (data && data.reviews.length > 0) {
            const firstServiceWithReviews = data.reviews[0]?.booking?.service?.name;
            setExpandedService(firstServiceWithReviews || 'General Feedback');
        }
      } catch (error) {
        toast.error('Could not load provider profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [providerId]);

  const handleSelectServiceToBook = (service) => {
    if (!user) {
      toast.error('You must be logged in to book a service.');
      return navigate('/login');
    }
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (bookingData) => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const finalBookingData = { ...bookingData, providerId: profileData.profile.user._id };
      await createBookingAPI(finalBookingData);
      toast.success('Booking created successfully!');
      setIsModalOpen(false);
      navigate('/my-bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReviews = (serviceName) => {
    setExpandedService(prev => (prev === serviceName ? null : serviceName));
  };

  if (loading) return <div className="text-center mt-10">Loading profile...</div>;
  if (!profileData) return <div className="text-center mt-10">Provider not found.</div>;

  const { profile, reviews } = profileData;

  const reviewsByService = reviews.reduce((acc, review) => {
    const serviceName = review.booking?.service?.name || 'General Feedback';
    if (!acc[serviceName]) acc[serviceName] = [];
    acc[serviceName].push(review);
    return acc;
  }, {});

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Provider Info & Services */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card text-center">
                <img src={`${import.meta.env.VITE_API_BASE_URL}${profile.user.profilePicture}`} alt={profile.user.name} className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"/>
                <h1 className="text-2xl font-bold mt-4">{profile.user.name}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
                    <StarRating rating={profile.averageRating} />
                    <span>({profile.numReviews} reviews)</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">{profile.bio}</p>
            </div>
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Services Offered</h2>
                <div className="space-y-4">
                    {profile.servicesOffered.map(service => {
                        const rateInfo = profile.serviceRates.find(r => r.service === service._id);
                        return (
                            <div key={service._id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{service.name}</p>
                                    <p className="text-sm text-gray-500">₹{rateInfo?.price || 'N/A'}</p>
                                </div>
                                {/* --- THIS IS THE FIX --- */}
                                {user && user._id === providerId ? (
                                    <button className="bg-gray-300 text-gray-500 text-sm px-4 py-1 rounded-lg cursor-not-allowed" disabled>
                                        Your Service
                                    </button>
                                ) : (
                                    <button onClick={() => handleSelectServiceToBook(service)} className="btn-primary text-sm px-4 py-1">
                                        Book
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>
          {/* Right Column: Reviews */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(reviewsByService).map(([serviceName, serviceReviews]) => (
                        <div key={serviceName} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <button onClick={() => handleToggleReviews(serviceName)} className="w-full p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100">
                                <span className="font-bold text-lg text-gray-800">{serviceName}</span>
                                <span className="font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{serviceReviews.length} Reviews</span>
                            </button>
                            {expandedService === serviceName && (
                                <div className="p-4 space-y-4 border-t">
                                    {serviceReviews.map(review => (
                                        <div key={review._id} className="border-b pb-3 last:border-b-0">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800">{review.customer?.name || 'Anonymous'}</h4>
                                                <StarRating rating={review.rating} />
                                            </div>
                                            <p className="text-gray-600 mt-2 text-sm">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center p-8">
                  <p>This provider has no reviews yet.</p>
                </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && selectedService && (
        <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmBooking} service={selectedService} provider={profile} isSubmitting={isSubmitting} />
      )}
    </>
  );
};

export default ProviderProfilePage;