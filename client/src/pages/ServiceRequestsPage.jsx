import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getProviderBookingsAPI } from '../api/providers';

const ServiceRequestsPage = () => {
  const [bookingsByService, setBookingsByService] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const bookings = await getProviderBookingsAPI();
        
        // Group bookings by service name
        const grouped = bookings.reduce((acc, booking) => {
          const serviceName = booking.service?.name || 'Unknown Service';
          if (!acc[serviceName]) {
            acc[serviceName] = { list: [], pendingCount: 0, serviceId: booking.service?._id };
          }
          acc[serviceName].list.push(booking);
          if (booking.status === 'pending') {
            acc[serviceName].pendingCount++;
          }
          return acc;
        }, {});
        setBookingsByService(grouped);
      } catch (error) {
        toast.error("Could not fetch service requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Service Requests</h1>
      {Object.keys(bookingsByService).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(bookingsByService).map(([serviceName, data]) => (
            <Link key={data.serviceId} to={`/provider/requests/${data.serviceId}`} className="card block p-4 hover:border-blue-500 border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{serviceName}</h2>
                {data.pendingCount > 0 && (
                  <span className="flex items-center gap-2 text-sm font-semibold text-red-600">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    {data.pendingCount} New Request(s)
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="card text-center p-8">You have no service requests.</p>
      )}
    </div>
  );
};

export default ServiceRequestsPage;