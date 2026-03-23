import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { forgotPasswordAPI } from '../api/password';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const data = await forgotPasswordAPI(email);
            toast.success(data.message);
            setMessage(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Forgot Your Password?</h1>
                <p className="text-center text-gray-600">No problem. Enter your email and we'll send you a link to reset your password.</p>
                
                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="w-full p-3 border rounded-lg" required />
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <p className="text-center text-green-600 mt-4 p-4 bg-green-50 rounded-lg">{message}</p>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;