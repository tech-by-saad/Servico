import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUserAPI } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { name, email, password } = formData;

  const handleChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error('All fields are required');
    }
    try {
      const data = await registerUserAPI({ name, email, password });
      login(data);
      toast.success('Registration successful! Welcome.');
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block">Name</label>
            <input type="text" id="name" name="name" value={name} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">Email Address</label>
            <input type="email" id="email" name="email" value={email} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Password</label>
            <input type="password" id="password" name="password" value={password} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Sign Up</button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default RegisterPage;