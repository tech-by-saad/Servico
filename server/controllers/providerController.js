import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import generateToken from '../utils/generateToken.js';

export const applyToBeProvider = async (req, res) => {
    try {
        const userId = req.user._id;
        const existingProfile = await ProviderProfile.findOne({ user: userId });
        if (existingProfile) {
            return res.status(400).json({ message: 'You already have a provider profile.' });
        }
        
        // --- THIS IS THE FIX ---
        // We now expect 'serviceRates' (which includes price) instead of just 'servicesOffered'
        const { experience, contact, bio, serviceRates, serviceRegions } = req.body;

        // Derive the list of offered services from the rates array
        const servicesOffered = serviceRates.map(rate => rate.service);

        const newProfile = new ProviderProfile({
            user: userId,
            experience,
            contact,
            bio,
            servicesOffered,
            serviceRates, // Save the rates with prices
            serviceRegions,
            status: 'approved',
        });

        const savedProfile = await newProfile.save();
        const user = await User.findById(userId);
        user.providerProfile = savedProfile._id;
        user.role = 'provider';
        await user.save();

        // --- THIS IS THE FIX ---
        // Ensure we send back ALL user fields, including the existing profile picture.
        res.status(201).json({
            message: 'Congratulations! You are now a service provider.',
            profile: savedProfile,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture, // This line was missing
            age: user.age,
            contact: user.contact,
            address: user.address,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Apply provider error:", error);
        res.status(500).json({ message: 'Server error during application process.', error: error.message });
    }
};

export const getMyProviderProfile = async (req, res) => {
    try {
        const profile = await ProviderProfile.findOne({ user: req.user._id }).populate('servicesOffered', 'name');
        if (!profile) return res.json(null);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching profile.', error: error.message });
    }
};

export const updateMyProviderProfile = async (req, res) => {
    try {
        const profile = await ProviderProfile.findOne({ user: req.user._id });
        if (!profile) return res.status(404).json({ message: 'Provider profile not found.' });
        
        const { 
            experience, bio, serviceRates, serviceRegions,
            morningStartTime, morningEndTime, eveningStartTime, eveningEndTime,
            morningCapacity, eveningCapacity, halfDayOff, unavailableDates
        } = req.body;

        if (experience !== undefined) profile.experience = experience;
        if (bio !== undefined) profile.bio = bio;
        if (serviceRates !== undefined) {
            profile.serviceRates = serviceRates;
            profile.servicesOffered = serviceRates.map(rate => rate.service);
        }
        if (serviceRegions !== undefined) profile.serviceRegions = serviceRegions;
        if (morningStartTime !== undefined) profile.morningStartTime = morningStartTime;
        if (morningEndTime !== undefined) profile.morningEndTime = morningEndTime;
        if (eveningStartTime !== undefined) profile.eveningStartTime = eveningStartTime;
        if (eveningEndTime !== undefined) profile.eveningEndTime = eveningEndTime;
        if (morningCapacity !== undefined) profile.morningCapacity = morningCapacity;
        if (eveningCapacity !== undefined) profile.eveningCapacity = eveningCapacity;
        if (halfDayOff !== undefined) profile.halfDayOff = halfDayOff;
        if (unavailableDates !== undefined) profile.unavailableDates = unavailableDates;
        
        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server Error while updating profile.', error: error.message });
    }
};

export const getProvidersForService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { city } = req.query;
        const query = {
            servicesOffered: serviceId,
            status: 'approved',
        };
        if (city) {
            query.serviceRegions = city;
        }

        const profiles = await ProviderProfile.find(query).populate('user', 'name _id profilePicture');
        
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching providers.' });
    }
};

export const getProviderPublicProfile = async (req, res) => {
    try {
        const providerId = req.params.id;
        const profile = await ProviderProfile.findOne({ user: providerId }).populate('user', 'name profilePicture').populate('servicesOffered', 'name');
        if (!profile || profile.status !== 'approved') {
            return res.status(404).json({ message: 'Provider not found or not approved.' });
        }
        const reviews = await Review.find({ provider: providerId }).populate('customer', 'name').populate({ path: 'booking', select: 'service', populate: { path: 'service', select: 'name' } }).sort({ createdAt: -1 });
        res.json({ profile, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getProviderAvailability = async (req, res) => {
    try {
        const { providerId } = req.params;
        const { date } = req.query;
        if (!providerId || !date) {
            return res.status(400).json({ message: "Provider ID and date are required." });
        }

        const profile = await ProviderProfile.findOne({ user: providerId });
        if (!profile) return res.status(404).json({ message: 'Provider not found' });
        
        if (profile.unavailableDates.includes(date)) {
            return res.json({ morningAvailable: false, eveningAvailable: false });
        }
        
        const halfDay = profile.halfDayOff.find(d => d.date === date);

        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        const bookingsOnDay = await Booking.find({
            provider: providerId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'confirmed'] }
        });

        const { morningStartTime, morningEndTime, eveningStartTime, eveningEndTime, morningCapacity, eveningCapacity } = profile;
        const timeToMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
        
        const morningStartMins = timeToMinutes(morningStartTime);
        const morningEndMins = timeToMinutes(morningEndTime);
        const eveningStartMins = timeToMinutes(eveningStartTime);
        const eveningEndMins = timeToMinutes(eveningEndTime);

        let morningBookingCount = 0;
        let eveningBookingCount = 0;
        for (const booking of bookingsOnDay) {
            const bookingDate = new Date(booking.bookingDate);
            const bookingMins = bookingDate.getUTCHours() * 60 + bookingDate.getUTCMinutes();
            if (bookingMins >= morningStartMins && bookingMins < morningEndMins) {
                morningBookingCount++;
            }
            if (bookingMins >= eveningStartMins && bookingMins < eveningEndMins) {
                eveningBookingCount++;
            }
        }
        
        res.json({
            morningAvailable: halfDay?.slot !== 'morning' && morningBookingCount < morningCapacity,
            eveningAvailable: halfDay?.slot !== 'evening' && eveningBookingCount < eveningCapacity
        });

    } catch (error) {
        console.error("Error fetching availability:", error);
        res.status(500).json({ message: 'Server error while fetching availability' });
    }
};