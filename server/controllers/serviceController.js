import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';

export const getPopularServices = async (req, res) => {
    try {
        const popularServices = await Booking.aggregate([
            { $group: { _id: '$service', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
            { 
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'serviceDetails'
                }
            },
            { $unwind: '$serviceDetails' },
            { $replaceRoot: { newRoot: "$serviceDetails" } }
        ]);
        res.json(popularServices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createService = async (req, res) => {
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/sample.jpg';
    const service = new Service({ name, description, imageUrl });
    const createdService = await service.save();
    res.status(201).json(createdService);
};

export const getServices = async (req, res) => {
    try {
        const { keyword } = req.query; // City filter is removed from here
        const query = keyword ? { name: { $regex: keyword, $options: 'i' } } : {};
        const services = await Service.find(query);
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getServiceById = async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (service) {
        res.json(service);
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
};

export const updateService = async (req, res) => {
    const { name, description } = req.body;
    const service = await Service.findById(req.params.id);
    if (service) {
        service.name = name;
        service.description = description;
        if (req.file) {
            service.imageUrl = `/uploads/${req.file.filename}`;
        }
        const updatedService = await service.save();
        res.json(updatedService);
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
};

export const deleteService = async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (service) {
        res.json({ message: 'Service removed' });
    } else {
        res.status(404).json({ message: 'Service not found' });
    }
};