import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
// We can reuse the ProviderDashboard's logic by turning it into a component
import ProviderBookingsList from '../components/ProviderBookingsList';

const BookingListPage = () => {
    const { serviceId } = useParams();

    return (
        <div>
            {/* We can add a service name title here if needed */}
            <ProviderBookingsList serviceIdFilter={serviceId} />
        </div>
    );
};

export default BookingListPage;