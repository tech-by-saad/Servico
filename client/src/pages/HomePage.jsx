import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPopularServicesAPI } from '../api/services';
import ServiceCard from '../components/ServiceCard';
import { Link } from 'react-router-dom';
import { Users, Calendar, Award, ShieldCheck, Heart, Search } from 'lucide-react';

// The "How it Works" guide component
const HowItWorks = () => {
    const [activeTab, setActiveTab] = useState('customer');
    const customerSteps = [
        { icon: <Search size={28}/>, title: "Find Your Pro", description: "Browse services and view detailed provider profiles with real reviews." },
        { icon: <Calendar size={28}/>, title: "Book with Confidence", description: "Select an available time slot that fits your schedule perfectly." },
        { icon: <Award size={28}/>, title: "Job Done, Rate Well", description: "Once the service is complete, confirm and leave a review to help others." },
    ];
    const providerSteps = [
        { icon: <Users size={28}/>, title: "Build Your Profile", description: "Showcase your skills, set your services, prices, and availability." },
        { icon: <ShieldCheck size={28}/>, title: "Accept Requests", description: "Receive booking requests from customers in your service area." },
        { icon: <Heart size={28}/>, title: "Earn & Grow", description: "Deliver great service, get paid, and build your reputation with customer reviews." },
    ];

    const steps = activeTab === 'customer' ? customerSteps : providerSteps;

    return (
        <section className="py-20 bg-white dark:bg-gray-800/50 rounded-lg">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Effortless From Start to Finish</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Whether you're booking a service or offering one, our process is simple.</p>
                    <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1 rounded-full mt-6">
                        <button onClick={() => setActiveTab('customer')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'customer' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>For Customers</button>
                        <button onClick={() => setActiveTab('provider')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'provider' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>For Providers</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto mt-12">
                  {steps.map((step, index) => (
                      <div key={index} className="p-4 transform transition-transform duration-300 hover:scale-105">
                          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 mx-auto mb-4">{step.icon}</div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{step.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                      </div>
                  ))}
                </div>
            </div>
        </section>
    );
};

const HomePage = () => {
  const [popularServices, setPopularServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularServices = async () => {
      try {
        const data = await getPopularServicesAPI();
        setPopularServices(data);
      } catch (error) {
        toast.error('Could not fetch popular services');
      } finally {
        setLoading(false);
      }
    };
    fetchPopularServices();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white rounded-xl overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop" alt="Professional cleaner providing a service" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 p-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Reliable Home Services, <br/> On Demand.
            </h1>
            <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">
              Your search for trusted local professionals ends here. Find, book, and manage any service with total peace of mind.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <Link to="/services" className="btn-primary text-lg px-8 py-3">
                  Explore Services
                </Link>
                <Link to="/provider-hub" className="bg-white/20 backdrop-blur-md text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/30 transition-all duration-300">
                  Become a Provider
                </Link>
            </div>
        </div>
      </section>

      <HowItWorks />

      {/* Popular Services Section */}
      <section>
         <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Most Popular Services</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-12">Join thousands of satisfied customers. Here's what's trending.</p>
         </div>
        {loading ? (
          <p className="text-center dark:text-gray-400">Loading services...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
        <div className="text-center mt-12">
            <Link to="/services" className="font-semibold text-blue-600 hover:underline text-lg">
                Browse All Services &rarr;
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;