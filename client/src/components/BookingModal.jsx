import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import { getProviderAvailabilityAPI } from '../api/providers';
import { useAuth } from '../context/AuthContext';

const toDateString = (date) => new Date(date).toLocaleDateString('en-CA');

const BookingModal = ({ isOpen, onClose, onConfirm, service, provider, bookingToEdit, isSubmitting }) => {
  const { user } = useAuth();
  const [bookingDate, setBookingDate] = useState(null);
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.contact?.replace('+91', '') || '');
  const [availability, setAvailability] = useState({ morning: false, evening: false });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (bookingToEdit) {
      setBookingDate(new Date(bookingToEdit.bookingDate));
      setAddress(bookingToEdit.address);
      setContactNumber(bookingToEdit.contactNumber.replace('+91', ''));
    } else {
      setBookingDate(null);
      setAddress('');
      setContactNumber(user?.contact?.replace('+91', '') || '');
      setAvailability({ morning: false, evening: false });
      setSelectedSlot('');
    }
  }, [bookingToEdit, isOpen, user]);

  const handleDateChange = async (date) => {
      setBookingDate(date);
      setSelectedSlot('');
      setLoadingSlots(true);
      try {
          const dateString = toDateString(date);
          const data = await getProviderAvailabilityAPI(provider.user._id, dateString);
          setAvailability({ morning: data.morningAvailable, evening: data.eveningAvailable });
      } catch (error) {
          toast.error("Could not fetch availability.");
          setAvailability({ morning: false, evening: false });
      } finally {
          setLoadingSlots(false);
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookingDate || !address || !selectedSlot || !contactNumber) {
      return toast.error('Please fill out all fields, including your contact number.');
    }
    const time = selectedSlot === 'morning' ? provider.morningStartTime : provider.eveningStartTime;
    const finalBookingDate = new Date(`${toDateString(bookingDate)}T${time}:00.000Z`);
    
    const data = bookingToEdit 
      ? { bookingDate: finalBookingDate, address, contactNumber: `+91${contactNumber}` } 
      : { serviceId: service._id, bookingDate: finalBookingDate, address, contactNumber: `+91${contactNumber}` };
    onConfirm(data);
  };
  
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;
      if (provider?.unavailableDates?.includes(toDateString(date))) return true;
    }
    return false;
  };
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (provider?.unavailableDates?.includes(toDateString(date))) {
        return 'unavailable-date';
      }
      const halfDay = provider?.halfDayOff?.find(d => d.date === toDateString(date));
      if (halfDay) {
          return 'half-day-off';
      }
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Book Service</h2>
                    <p className="text-gray-500 text-sm">You are booking '{service.name}' with {provider.user.name}</p>
                </div>
                <button onClick={onClose} className="text-3xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="flex-grow overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-md font-semibold text-gray-700 mb-2">1. Select a Date</label>
                <div className="p-2 border rounded-lg bg-gray-50">
                    <Calendar onChange={handleDateChange} value={bookingDate} tileDisabled={tileDisabled} tileClassName={tileClassName} className="mx-auto" />
                </div>
              </div>
              
              {bookingDate && (
                <div>
                    <label className="block text-md font-semibold text-gray-700 mb-2">2. Select an Available Slot</label>
                    {loadingSlots ? <p>Checking availability...</p> : 
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setSelectedSlot('morning')} disabled={!availability.morning} className={`w-full p-3 border rounded-lg text-center ${selectedSlot === 'morning' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}>
                            <p className="font-semibold">Morning</p>
                            <p className="text-xs">({provider.morningStartTime} - {provider.morningEndTime})</p>
                        </button>
                        <button type="button" onClick={() => setSelectedSlot('evening')} disabled={!availability.evening} className={`w-full p-3 border rounded-lg text-center ${selectedSlot === 'evening' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white'} disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}>
                            <p className="font-semibold">Evening</p>
                            <p className="text-xs">({provider.eveningStartTime} - {provider.eveningEndTime})</p>
                        </button>
                    </div>}
                </div>
              )}

              <div>
                <label htmlFor="address" className="block text-md font-semibold text-gray-700">3. Service Address</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full address" className="w-full p-2 mt-1 border rounded-lg" rows="3" required />
              </div>

              <div>
                  <label htmlFor="contactNumber" className="block text-md font-semibold text-gray-700">4. Your Contact Number</label>
                  <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-11">+91</span>
                      <input id="contactNumber" name="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="9876543210" pattern="[7-9][0-9]{9}" title="Please enter a valid 10-digit Indian mobile number." className="w-full p-2 border rounded-r-lg" required />
                  </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !selectedSlot}>
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
            </div>
        </form>
        </div>
        <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>Cancel</button>
            <button type="button" onClick={handleSubmit} className="btn-primary" disabled={isSubmitting || !selectedSlot}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;