import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProviderProfileAPI } from '../api/providers';
import ProviderApplicationForm from '../components/ProviderApplicationForm';
import { ShieldCheck, UserCircle, Calendar, Wrench } from 'lucide-react';

const HubCard = ({ to, icon, title, description, colors, delay }) => {
  const IconComponent = icon;
  return (
    <Link 
      to={to} 
      className="group block rounded-xl p-6 text-white transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      style={{ 
        animationDelay: `${delay}ms`, 
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` 
      }}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/20 mb-4 transform transition-transform duration-300 group-hover:scale-110">
        <IconComponent size={32} />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-white/80">{description}</p>
    </Link>
  );
};

const ProviderHubPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const onApplicationSuccess = (newProfile) => { setProfile(newProfile); };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const fetchProfile = async () => {
        try {
          const data = await getMyProviderProfileAPI();
          setProfile(data);
        } catch (error) { console.error("Error fetching provider profile:", error); } 
        finally { setLoading(false); }
      };
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="text-center mt-10">Loading Provider Hub...</div>;

  if (profile && user.role === 'provider') {
    const hubItems = [
      { to: "/provider/requests", icon: ShieldCheck, title: "Service Requests", description: "View and manage your incoming booking requests.", colors: { from: '#3b82f6', to: '#60a5fa' }, delay: 100 },
      { to: "/provider/profile", icon: UserCircle, title: "My Provider Profile", description: "Update your professional bio, experience, and details.", colors: { from: '#10b981', to: '#34d399' }, delay: 200 },
      { to: "/provider/availability", icon: Calendar, title: "My Availability", description: "Set your work hours and mark days you're unavailable.", colors: { from: '#f97316', to: '#fb923c' }, delay: 300 },
      { to: "/provider/services", icon: Wrench, title: "Service Management", description: "Manage the services you offer, your prices, and regions.", colors: { from: '#8b5cf6', to: '#a78bfa' }, delay: 400 }
    ];

    return (
      <div className="animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome to Your Provider Hub</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">This is your command center for success. Let's get to work.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {hubItems.map(item => (
            <div key={item.to} className="animate-fade-in-up" style={{ animationDelay: `${item.delay}ms`}}>
              <HubCard {...item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <ProviderApplicationForm onSuccess={onApplicationSuccess} existingProfile={profile} />;
};
export default ProviderHubPage;