import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUserAPI, googleAuthAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUserAPI(formData);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleAuthAPI(credentialResponse.credential);
      login(data);
      toast.success(`Welcome, ${data.name}!`);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Google login failed.');
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Sign In to Your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" required placeholder="Email Address"/>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" required placeholder="Password"/>
          <div className="text-sm text-right">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Sign In</button>
        </form>
        <div className="my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 flex-shrink text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => { toast.error('Google Login Failed'); }}/>
        </div>
        <div className="text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;