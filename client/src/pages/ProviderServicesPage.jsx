import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyProviderProfileAPI } from '../api/providers';
import ServiceManagementTab from '../components/ServiceManagementTab';

const ProviderServicesPage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const data = await getMyProviderProfileAPI();
            setProfile(data);
        } catch (error) {
            toast.error("Could not load your profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!profile) return <p className="text-center mt-10">Could not find your provider profile.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Manage Your Services & Schedule</h1>
            <ServiceManagementTab profile={profile} onProfileUpdate={setProfile} />
        </div>
    );
};

export default ProviderServicesPage;