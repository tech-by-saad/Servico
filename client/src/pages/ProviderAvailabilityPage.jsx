import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyProviderProfileAPI } from '../api/providers';
import AvailabilityTab from '../components/AvailabilityTab';

const ProviderAvailabilityPage = () => {
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

    if (loading) return <p className="text-center mt-10">Loading availability manager...</p>;
    if (!profile) return <p className="text-center mt-10">Could not find your provider profile.</p>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Manage Your Availability</h1>
            <AvailabilityTab profile={profile} onProfileUpdate={setProfile} />
        </div>
    );
};

export default ProviderAvailabilityPage;