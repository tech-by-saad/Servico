import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyBookingsAPI, deleteBookingAPI, confirmCancellationAPI } from '../api/bookings';
import { getProviderPublicProfileAPI } from '../api/providers';
import { createReviewAPI } from '../api/reviews';
import ReviewModal from '../components/ReviewModal';
import ChatModal from '../components/ChatModal';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, MapPin, MessageSquare, Star, XCircle, Clock, Phone } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancellation_pending: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-800',
    completion_pending: 'bg-indigo-100 text-indigo-800',
  };
  return (<span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>{status.replace(/_/g, ' ')}</span>);
};

const BookingCard = ({ booking, providerProfile, handlers }) => {
  const style = {
    pending: { border: 'border-l-4 border-yellow-400' },
    confirmed: { border: 'border-l-4 border-green-400' },
    completed: { border: 'border-l-4 border-blue-400' },
    cancellation_pending: { border: 'border-l-4 border-orange-400' },
    cancelled: { border: 'border-l-4 border-red-400' },
    completion_pending: { border: 'border-l-4 border-indigo-400' },
  }[booking.status] || { border: 'border-l-4 border-gray-400' };

  const getTimeSlotDisplay = () => {
    if (!providerProfile) return new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bookingTime = new Date(booking.bookingDate).getUTCHours();
    // Use optional chaining and provide defaults to prevent crashes
    const morningEnd = parseInt((providerProfile.morningEndTime || '12:00').split(':')[0]);

    if (bookingTime < morningEnd) {
      return `Morning (${providerProfile.morningStartTime || 'N/A'} - ${providerProfile.morningEndTime || 'N/A'})`;
    }
    return `Evening (${providerProfile.eveningStartTime || 'N/A'} - ${providerProfile.eveningEndTime || 'N/A'})`;
  };

  return (
    <div className={`card p-0 overflow-hidden ${style.border}`}>
      <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 border-b">
        <div className="mb-2 sm:mb-0">
          <h2 className="font-bold text-lg text-gray-800">{booking.service.name}</h2>
          <p className="text-sm text-gray-500">Booking ID: #{booking._id.toString().slice(-6)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="flex items-center text-gray-700">
          <User size={16} className="mr-2 flex-shrink-0" /> Provider: <span className="font-semibold ml-1">{booking.provider?.name || 'N/A'}</span>
        </div>
        {booking.status === 'confirmed' && providerProfile?.contact && (
             <div className="flex items-center text-blue-600">
                <Phone size={16} className="mr-2"/> Provider Contact: <span className="font-semibold ml-1">{providerProfile.contact}</span>
            </div>
        )}
        <div className="flex items-center text-gray-700">
          <Calendar size={16} className="mr-2 flex-shrink-0" /> Date: <span className="font-semibold ml-1">{new Date(booking.bookingDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock size={16} className="mr-2 flex-shrink-0" /> Time Slot: <span className="font-semibold ml-1">{getTimeSlotDisplay()}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <MapPin size={16} className="mr-2 flex-shrink-0" /> Address: <span className="font-semibold ml-1">{booking.address}</span>
        </div>
      </div>
      <div className="bg-gray-50 p-3 flex justify-end items-center space-x-4">
        {booking.status === 'confirmed' && (
          <>
            <button onClick={() => handlers.onOpenChat(booking)} className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-900"><MessageSquare size={14}/> Chat</button>
            <button onClick={() => handlers.onCancelRequest(booking._id)} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-900"><XCircle size={14}/> Request Cancellation</button>
          </>
        )}
        {booking.status === 'completion_pending' && (<button onClick={() => handlers.onOpenReview(booking)} className="btn-primary text-sm py-1 px-3">Confirm & Review</button>)}
        {booking.status === 'cancellation_pending' && booking.cancellationRequester === 'provider' && (<button onClick={() => handlers.onConfirmCancel(booking._id)} className="bg-orange-500 text-white font-bold py-1 px-3 rounded-lg text-sm">Confirm Cancellation</button>)}
      </div>
    </div>
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [providerProfiles, setProviderProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const fetchBookingsAndProfiles = async () => {
    try {
      setLoading(true);
      const bookingsData = await getMyBookingsAPI();
      setBookings(bookingsData);
      
      const providerIds = [...new Set(bookingsData.map(b => b.provider?._id).filter(Boolean))];
      if (providerIds.length > 0) {
          const profilePromises = providerIds.map(id => getProviderPublicProfileAPI(id));
          const profilesResults = await Promise.all(profilePromises);
          const profileMap = profilesResults.reduce((acc, data) => {
              if (data && data.profile) acc[data.profile.user._id] = data.profile;
              return acc;
          }, {});
          setProviderProfiles(profileMap);
      }
    } catch (error) {
      toast.error('Could not fetch your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndProfiles();
  }, []);
  
  const handlers = {
      onOpenChat: (booking) => { setCurrentBooking(booking); setIsChatModalOpen(true); },
      onOpenReview: (booking) => { setCurrentBooking(booking); setIsReviewModalOpen(true); },
      onCancelRequest: async (bookingId) => {
          if (window.confirm('Are you sure you want to request cancellation?')) {
            try { await deleteBookingAPI(bookingId); toast.success('Cancellation request sent.'); fetchBookingsAndProfiles(); } 
            catch (error) { toast.error('Failed to send request.'); }
          }
      },
      onConfirmCancel: async (bookingId) => {
          if (window.confirm('The provider has requested to cancel. Confirm?')) {
            try { await confirmCancellationAPI(bookingId); toast.success('Booking cancellation confirmed.'); fetchBookingsAndProfiles(); } 
            catch (error) { toast.error('Failed to confirm cancellation.'); }
          }
      },
  };

  const handleReviewSubmit = async (reviewData) => {
      try { await createReviewAPI(reviewData); toast.success('Review submitted. Thank you!'); setIsReviewModalOpen(false); fetchBookingsAndProfiles(); } 
      catch (error) { toast.error(error.response?.data?.message || 'Failed to submit review.'); }
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        {loading ? <p>Loading...</p> : bookings.length === 0 ? (
          <div className="card text-center p-12">
            <p className="text-gray-600">You have no bookings yet. Explore our services to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                providerProfile={providerProfiles[booking.provider?._id]}
                handlers={handlers}
              />
            ))}
          </div>
        )}
      </div>
      {isChatModalOpen && (<ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} booking={currentBooking} />)}
      {isReviewModalOpen && (<ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={handleReviewSubmit} booking={currentBooking} />)}
    </>
  );
};

export default MyBookingsPage;