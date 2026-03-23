import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getServicesAPI } from '../api/services';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { Search } from 'lucide-react';

const ServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await getServicesAPI(debouncedSearchTerm);
        setServices(data);
      } catch (error) {
        toast.error('Could not fetch services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [debouncedSearchTerm]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Explore Our Services</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Find the right professional for any job, big or small.</p>
          </div>
          {user && (
              <Link to="/my-bookings" className="btn-primary flex-shrink-0">
                  My Bookings
              </Link>
          )}
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Search for a service by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      
      {/* Services Grid with Animation */}
      {loading ? (
        <div className="text-center py-10">
            <p className="dark:text-gray-400">Loading services...</p>
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div 
              key={service._id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in-up"
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 card">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">No Services Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">We couldn't find any services matching your search for "{searchTerm}".<br/>Try a different keyword.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;