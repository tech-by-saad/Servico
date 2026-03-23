import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getProviderBookingsAPI, updateBookingStatusAPI, getMyProviderProfileAPI } from '../api/providers';
import { confirmCancellationAPI } from '../api/bookings';
import ChatModal from './ChatModal';
import { User, Calendar, MapPin, Clock, MessageSquare, CheckCircle, XCircle, Phone } from 'lucide-react';

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

const ProviderBookingsList = ({ serviceIdFilter }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [allBookings, providerProfile] = await Promise.all([
                getProviderBookingsAPI(),
                getMyProviderProfileAPI()
            ]);
            setProfile(providerProfile);
            const filtered = allBookings.filter(b => b.service._id === serviceIdFilter);
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(filtered);
        } catch (error) {
            toast.error("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [serviceIdFilter]);

    const handleUpdateStatus = async (bookingId, newStatus) => {
        if (window.confirm('Are you sure you want to perform this action?')) {
            try {
                const updatedBooking = await updateBookingStatusAPI(bookingId, newStatus);
                toast.success('Status updated!');
                if (updatedBooking.status === 'cancelled' && newStatus === 'cancelled') {
                    setBookings(prev => prev.filter(b => b._id !== bookingId));
                } else {
                    setBookings(prev => prev.map(b => b._id === bookingId ? updatedBooking : b));
                }
            } catch (error) {
                toast.error('Failed to update status.');
            }
        }
    };

    const handleConfirmCancellation = async (bookingId) => {
        if (window.confirm('Confirm this cancellation?')) {
            try {
                await confirmCancellationAPI(bookingId);
                toast.success('Cancellation confirmed.');
                fetchAllData();
            } catch (error) {
                toast.error('Failed to confirm.');
            }
        }
    };
    
    const handleOpenChatModal = (booking) => {
        setCurrentBooking(booking);
        setIsChatModalOpen(true);
    };

    const getTimeSlotDisplay = (booking) => {
        if (!profile) return new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bookingTime = new Date(booking.bookingDate).getUTCHours();
        const morningEnd = parseInt(profile.morningEndTime.split(':')[0]);
        if (bookingTime < morningEnd) {
            return `Morning (${profile.morningStartTime} - ${profile.morningEndTime})`;
        }
        return `Evening (${profile.eveningStartTime} - ${profile.eveningEndTime})`;
    };

    if (loading) return <p>Loading bookings...</p>;
    
    return (
      <>
        <div>
            <h2 className="text-2xl font-semibold mb-6">Requests for this Service</h2>
            {bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="card p-0 overflow-hidden">
                            <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 border-b">
                                <div className="mb-2 sm:mb-0">
                                    <h2 className="font-bold text-lg text-gray-800">{booking.customer?.name || 'N/A'}</h2>
                                    <p className="text-sm text-gray-500">Booking ID: #{booking._id.toString().slice(-6)}</p>
                                </div>
                                <StatusBadge status={booking.status} />
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div className="flex items-center text-gray-700">
                                    <Calendar size={14} className="mr-2"/> Date: <span className="font-semibold ml-1">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock size={14} className="mr-2"/> Time Slot: <span className="font-semibold ml-1">{getTimeSlotDisplay(booking)}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <MapPin size={14} className="mr-2"/> Address: <span className="font-semibold ml-1">{booking.address}</span>
                                </div>
                                {booking.contactNumber && (
                                    <div className="flex items-center text-blue-600">
                                        <Phone size={14} className="mr-2"/> Contact: <span className="font-semibold ml-1">{booking.contactNumber}</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gray-50 p-3 flex justify-end items-center space-x-3">
                                {booking.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="btn-primary text-sm py-1 px-3">Confirm</button>
                                        <button onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-red-600">Decline</button>
                                    </>
                                )}
                                {booking.status === 'confirmed' && (
                                    <>
                                        <button onClick={() => handleOpenChatModal(booking)} className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-900"><MessageSquare size={14}/> Chat</button>
                                        <button onClick={() => handleUpdateStatus(booking._id, 'completed')} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-900"><CheckCircle size={14}/> Mark as Done</button>
                                        <button onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-900"><XCircle size={14}/> Request Cancellation</button>
                                    </>
                                )}
                                {booking.status === 'cancellation_pending' && booking.cancellationRequester === 'customer' && (
                                    <button onClick={() => handleConfirmCancellation(booking._id)} className="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-orange-600">Confirm Cancellation</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="card p-8 text-center text-gray-500">No requests found for this service.</p>
            )}
        </div>
        {isChatModalOpen && <ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} booking={currentBooking} />}
      </>
    );
};
export default ProviderBookingsList;