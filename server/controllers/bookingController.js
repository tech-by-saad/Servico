import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import createNotification from '../utils/createNotification.js';

export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, address, providerId, contactNumber } = req.body;
        const customerId = req.user._id;
        if (!serviceId || !bookingDate || !address || !providerId || !contactNumber) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const bookingDateTime = new Date(bookingDate);
        const providerProfile = await ProviderProfile.findOne({ user: providerId });
        if (!providerProfile) return res.status(404).json({ message: 'Provider not found.' });

        const timeToMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
        const bookingMins = bookingDateTime.getUTCHours() * 60 + bookingDateTime.getUTCMinutes();
        
        let slotCapacity = 0;
        let slotStartMins = 0;
        let slotEndMins = 0;

        if (bookingMins >= timeToMinutes(providerProfile.morningStartTime) && bookingMins < timeToMinutes(providerProfile.morningEndTime)) {
            slotCapacity = providerProfile.morningCapacity;
            slotStartMins = timeToMinutes(providerProfile.morningStartTime);
            slotEndMins = timeToMinutes(providerProfile.morningEndTime);
        } else if (bookingMins >= timeToMinutes(providerProfile.eveningStartTime) && bookingMins < timeToMinutes(providerProfile.eveningEndTime)) {
            slotCapacity = providerProfile.eveningCapacity;
            slotStartMins = timeToMinutes(providerProfile.eveningStartTime);
            slotEndMins = timeToMinutes(providerProfile.eveningEndTime);
        } else {
            return res.status(400).json({ message: 'The selected time is outside the provider\'s working hours.' });
        }

        const dayOfBooking = new Date(bookingDateTime).toLocaleDateString('en-CA');
        const startOfDay = new Date(`${dayOfBooking}T00:00:00.000Z`);
        const endOfDay = new Date(`${dayOfBooking}T23:59:59.999Z`);
        
        const bookingsOnDay = await Booking.find({
            provider: providerId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: 'confirmed' 
        });

        let existingConfirmedBookingsInSlot = 0;
        for (const booking of bookingsOnDay) {
            const existingBookingMins = new Date(booking.bookingDate).getUTCHours() * 60 + new Date(booking.bookingDate).getUTCMinutes();
            if (existingBookingMins >= slotStartMins && existingBookingMins < slotEndMins) {
                existingConfirmedBookingsInSlot++;
            }
        }

        if (existingConfirmedBookingsInSlot >= slotCapacity) {
            return res.status(400).json({ message: 'Sorry, the provider has already confirmed their maximum number of jobs for this time slot.' });
        }
        
        const existingBookingForUser = await Booking.findOne({ customer: customerId, service: serviceId, status: { $in: ['pending', 'confirmed'] } });
        if (existingBookingForUser) {
            return res.status(400).json({ message: 'You have already booked this service.' });
        }
        
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        
        const booking = new Booking({
            customer: customerId, service: serviceId, provider: providerId,
            bookingDate, address, contactNumber,
            totalPrice: providerProfile.serviceRates.find(r => r.service.toString() === serviceId)?.price || 0,
        });
        const createdBooking = await booking.save();
        await createNotification(providerId, `You have a new service request from ${req.user.name} for "${service.name}".`, `/provider-hub`);
        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error while creating booking.' });
    }
};

export const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ customer: req.user._id }).populate('service', 'name imageUrl').populate('provider', 'name').sort({ createdAt: -1 });
    res.json(bookings);
};

export const getProviderBookings = async (req, res) => {
    if (req.user.role !== 'provider') {
        return res.status(403).json({ message: 'User is not a provider' });
    }
    const bookings = await Booking.find({ provider: req.user._id }).populate('customer', 'name email').populate('service', 'name').sort({ createdAt: -1 });
    const sanitizedBookings = bookings.map(booking => {
        const bookingObject = booking.toObject();
        if (bookingObject.status === 'pending') {
            delete bookingObject.contactNumber;
        }
        return bookingObject;
    });
    res.json(sanitizedBookings);
};

export const updateBookingStatus = async (req, res) => {
    try {
        let { status } = req.body;
        const bookingToUpdate = await Booking.findById(req.params.id).populate('service', 'name').populate('customer', 'name');
        if (!bookingToUpdate) return res.status(404).json({ message: 'Booking not found' });
        if (bookingToUpdate.provider.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const originalStatus = bookingToUpdate.status;
        let notificationMessage = '';
        
        if (status === 'cancelled' && originalStatus === 'pending') {
            await Booking.findByIdAndDelete(req.params.id);
            notificationMessage = `Your booking for "${bookingToUpdate.service.name}" was declined.`;
            await createNotification(bookingToUpdate.customer, notificationMessage, '/my-bookings');
            return res.json({ _id: req.params.id, status: 'cancelled' });
        }

        if (status === 'confirmed' && originalStatus === 'pending') {
            bookingToUpdate.status = 'confirmed';
            notificationMessage = `Your booking for "${bookingToUpdate.service.name}" has been confirmed.`;
            
            // --- THIS IS THE CORRECTED AUTO-DECLINE LOGIC ---
            const providerProfile = await ProviderProfile.findOne({ user: bookingToUpdate.provider });
            const bookingDateTime = new Date(bookingToUpdate.bookingDate);
            const timeToMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
            const bookingMins = bookingDateTime.getUTCHours() * 60 + bookingDateTime.getUTCMinutes();
            
            const isMorning = bookingMins >= timeToMinutes(providerProfile.morningStartTime) && bookingMins < timeToMinutes(providerProfile.morningEndTime);
            const slotCapacity = isMorning ? providerProfile.morningCapacity : providerProfile.eveningCapacity;
            
            const dayOfBooking = new Date(bookingDateTime).toLocaleDateString('en-CA');
            const slotStart = new Date(`${dayOfBooking}T${isMorning ? providerProfile.morningStartTime : providerProfile.eveningStartTime}:00.000Z`);
            const slotEnd = new Date(`${dayOfBooking}T${isMorning ? providerProfile.morningEndTime : providerProfile.eveningEndTime}:00.000Z`);

            const confirmedBookingsCount = await Booking.countDocuments({
                provider: bookingToUpdate.provider,
                bookingDate: { $gte: slotStart, $lt: slotEnd },
                status: 'confirmed'
            });

            if (confirmedBookingsCount >= slotCapacity) {
                const otherPendingBookings = await Booking.find({
                    _id: { $ne: bookingToUpdate._id },
                    provider: bookingToUpdate.provider,
                    bookingDate: { $gte: slotStart, $lt: slotEnd },
                    status: 'pending'
                }).populate('service', 'name');

                for (const booking of otherPendingBookings) {
                    await Booking.findByIdAndDelete(booking._id);
                    await createNotification(booking.customer, `The slot for your "${booking.service.name}" request was taken. It has been declined.`, '/my-bookings');
                }
            }
        } else if (status === 'cancelled' && originalStatus === 'confirmed') {
            bookingToUpdate.status = 'cancellation_pending';
            bookingToUpdate.cancellationRequester = 'provider';
            notificationMessage = `The provider has requested to cancel your booking for "${bookingToUpdate.service.name}".`;
        } else if (status === 'completed' && originalStatus === 'confirmed') {
            bookingToUpdate.status = 'completion_pending';
            notificationMessage = `The provider has marked your booking for "${bookingToUpdate.service.name}" as complete. Please confirm.`;
        } else {
            return res.status(400).json({ message: `Action not allowed for booking status: ${originalStatus}` });
        }
        
        const updatedBooking = await bookingToUpdate.save();
        if (notificationMessage) {
            await createNotification(bookingToUpdate.customer, notificationMessage, '/my-bookings');
        }
        res.json(updatedBooking);
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { bookingDate, address } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be updated.' });
        }
        booking.bookingDate = bookingDate || booking.bookingDate;
        booking.address = address || booking.address;
        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating booking.' });
    }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'pending') {
        await Booking.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Booking successfully cancelled.' });
    }
    if (booking.status === 'confirmed') {
        booking.status = 'cancellation_pending';
        booking.cancellationRequester = 'customer';
        await booking.save();
        await createNotification(
            booking.provider,
            `A cancellation has been requested for booking #${booking._id.toString().slice(-6)}.`,
            `/provider-hub`
        );
        return res.json({ message: 'Cancellation request sent to provider.' });
    }
    res.status(400).json({ message: 'Booking cannot be cancelled at this stage.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const confirmMutualCancellation = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('service', 'name');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        const isCustomer = booking.customer.toString() === req.user._id.toString();
        const isProvider = booking.provider.toString() === req.user._id.toString();

        if ((isCustomer && booking.cancellationRequester === 'customer') || (isProvider && booking.cancellationRequester === 'provider')) {
            return res.status(400).json({ message: 'You cannot confirm your own cancellation request.' });
        }
        if (!isCustomer && !isProvider) {
            return res.status(403).json({ message: 'Not authorized for this booking.' });
        }
        
        booking.status = 'cancelled';
        await booking.save();
        const recipient = isCustomer ? booking.provider : booking.customer;
        const link = isCustomer ? '/provider-hub' : '/my-bookings';
        await createNotification(recipient, `The cancellation for booking #${booking._id.toString().slice(-6)} has been confirmed.`, link);
        res.json({ message: 'Cancellation confirmed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
