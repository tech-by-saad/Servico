import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyProviderProfileAPI } from '../api/providers';
import EditProfileTab from '../components/EditProfileTab';
import ServiceManagementTab from '../components/ServiceManagementTab';

const ProviderSettingsPage = () => {
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

    if (loading) return <p className="text-center mt-10">Loading settings...</p>;
    if (!profile) return <p className="text-center mt-10">Could not find your provider profile.</p>;

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Provider Settings</h1>
                <p className="text-gray-600 mt-2">Update your professional details and service offerings.</p>
            </div>
            <EditProfileTab profile={profile} onProfileUpdate={setProfile} />
            <ServiceManagementTab profile={profile} onProfileUpdate={setProfile} />
        </div>
    );
};

export default ProviderSettingsPage;