import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getProviderBookingsAPI, updateBookingStatusAPI } from '../api/providers';
import { confirmCancellationAPI } from '../api/bookings';
import EditProfileTab from './EditProfileTab';
import AvailabilityTab from './AvailabilityTab';
import ServiceManagementTab from './ServiceManagementTab';
import ChatModal from './ChatModal';

const ProviderDashboard = ({ profile: initialProfile }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profile, setProfile] = useState(initialProfile);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  const handleProfileUpdate = (updatedProfile) => { setProfile(updatedProfile); };
  const handleOpenChatModal = (booking) => { setCurrentBooking(booking); setIsChatModalOpen(true); };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
        const data = await getProviderBookingsAPI();
        setBookings(data);
    } catch (error) {
        console.error('Could not fetch service requests:', error);
    } finally {
        setLoadingBookings(false);
    }
  };

  useEffect(() => { if (activeTab === 'requests') { fetchBookings(); } }, [activeTab]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const message = newStatus === 'completed' 
      ? 'This will send a completion request to the customer. Proceed?'
      : 'Are you sure you want to perform this action?';
    if (window.confirm(message)) {
      try {
        const updatedBooking = await updateBookingStatusAPI(bookingId, newStatus);
        if (newStatus === 'cancelled' && updatedBooking.status === 'cancelled') {
            toast.success('Booking declined successfully!');
            setBookings(prevBookings => prevBookings.filter(b => b._id !== bookingId));
        } else {
            toast.success('Booking status updated!');
            setBookings(prevBookings => prevBookings.map(b => (b._id === bookingId ? updatedBooking : b)));
        }
      } catch (error) {
        toast.error('Failed to update status.');
      }
    }
  };

  const handleConfirmCancellation = async (bookingId) => {
    if (window.confirm('The customer has requested to cancel. Confirm to finalize.')) {
      try {
        await confirmCancellationAPI(bookingId);
        toast.success('Cancellation confirmed.');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to confirm.');
      }
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-4">Provider Dashboard</h1>
        <p className="mb-8 text-gray-600">Manage your services and bookings all in one place.</p>
        <div className="border-b mb-6">
          <nav className="flex flex-wrap -mb-px space-x-8">
            <button onClick={() => setActiveTab('requests')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'requests' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Service Requests</button>
            <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>My Profile</button>
            <button onClick={() => setActiveTab('services')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'services' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Service Management</button>
            <button onClick={() => setActiveTab('availability')} className={`py-4 px-1 border-b-2 font-medium ${activeTab === 'availability' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>My Availability</button>
          </nav>
        </div>
        <div>
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Current Service Requests</h2>
              {loadingBookings ? ( <p>Loading requests...</p> ) : bookings.length === 0 ? ( <p className="text-gray-600">You have no new service requests yet.</p> ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="card p-4 flex justify-between items-center">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div>
                          <p className="font-semibold">{booking.customer?.name}</p>
                          <p className="text-sm text-gray-500">{booking.service?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">Address: {booking.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 ml-4 text-sm">
                        {booking.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateStatus(booking._id, 'confirmed')} className="bg-green-500 ...">Confirm</button>
                            <button onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="bg-red-500 ...">Decline</button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button onClick={() => handleOpenChatModal(booking)} className="bg-purple-500 ...">Chat</button>
                            <button onClick={() => handleUpdateStatus(booking._id, 'completed')} className="bg-blue-500 ...">Mark as Done</button>
                            <button onClick={() => handleUpdateStatus(booking._id, 'cancelled')} className="bg-red-500 ...">Request Cancellation</button>
                          </>
                        )}
                        {booking.status === 'cancellation_pending' && booking.cancellationRequester === 'customer' && (
                             <button onClick={() => handleConfirmCancellation(booking._id)} className="bg-orange-500 ...">Confirm Cancellation</button>
                        )}
                        {['completion_pending', 'completed', 'cancelled'].includes(booking.status) && (<span className="font-semibold uppercase">{booking.status.replace('_', ' ')}</span>)}
                        {booking.status === 'cancellation_pending' && booking.cancellationRequester === 'provider' && (<span className="font-semibold text-orange-600">AWAITING CUSTOMER</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'profile' && (<EditProfileTab profile={profile} onProfileUpdate={handleProfileUpdate} />)}
          {activeTab === 'services' && (<ServiceManagementTab profile={profile} onProfileUpdate={handleProfileUpdate} />)}
          {activeTab === 'availability' && (<AvailabilityTab profile={profile} onProfileUpdate={handleProfileUpdate} />)}
        </div>
      </div>
      {isChatModalOpen && (<ChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} booking={currentBooking} />)}
    </>
  );
};
export default ProviderDashboard;