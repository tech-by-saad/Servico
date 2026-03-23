import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';
import { LogIn, Menu, X } from 'lucide-react';

const NavItem = ({ to, children, onClick }) => (
    <NavLink 
        to={to} 
        onClick={onClick}
        className={({ isActive }) => 
            `px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
        }
    >
        {children}
    </NavLink>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      navigate('/');
      setIsProfileMenuOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const getProfilePictureUrl = () => {
    const defaultAvatar = `${import.meta.env.VITE_API_BASE_URL}/uploads/default-avatar.png`;
    if (!user || !user.profilePicture) {
        return defaultAvatar;
    }
    if (user.profilePicture.startsWith('https://')) {
        return user.profilePicture;
    }
    return `${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}`;
  };

  return (
    <nav className="bg-white dark:bg-gray-800/90 backdrop-blur-md shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/'}>
              Servi<span className="text-blue-600">co.</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {user?.role === 'admin' ? (
              <>
                <NavItem to="/admin/dashboard">Dashboard</NavItem>
                <NavItem to="/admin/users">Manage Users</NavItem>
                <NavItem to="/admin/services">Manage Services</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/services">Services</NavItem>
                {user && <NavItem to="/provider-hub">Provider Hub</NavItem>}
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Notifications />
                <div className="relative">
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="block h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <img 
                      src={getProfilePictureUrl()} 
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200" onMouseLeave={() => setIsProfileMenuOpen(false)}>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:block">
                  <Link to="/login" className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-full overflow-hidden transition-all duration-300 ease-in-out hover:bg-gray-800">
                    <span className="absolute inset-0 w-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                    <span className="relative z-10 flex items-center">
                      <LogIn size={16} className="mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      Login / Sign Up
                    </span>
                  </Link>
              </div>
            )}
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100">
                    {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
            <div className="md:hidden pb-4">
                <div className="flex flex-col space-y-2 mt-2">
                    <NavItem to="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</NavItem>
                    {user && <NavItem to="/provider-hub" onClick={() => setIsMobileMenuOpen(false)}>Provider Hub</NavItem>}
                    {!user && (
                         <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary text-center mt-2">Login / Sign Up</Link>
                    )}
                </div>
            </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;