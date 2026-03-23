import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';

// Provider Hub Pages
import ProviderHubPage from './pages/ProviderHubPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import BookingListPage from './pages/BookingListPage';
import ProviderProfileEditPage from './pages/ProviderProfileEditPage';
import ProviderAvailabilityPage from './pages/ProviderAvailabilityPage';
import ProviderServicesPage from './pages/ProviderServicesPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserListPage from './pages/admin/UserListPage';
import ServiceListPage from './pages/admin/ServiceListPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster />
      <main className="container mx-auto py-8 px-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/service/:id" element={<ServiceDetailPage />} />
          <Route path="/provider/:id" element={<ProviderProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Provider Hub Routes */}
            <Route path="/provider-hub" element={<ProviderHubPage />} />
            <Route path="/provider/requests" element={<ServiceRequestsPage />} />
            <Route path="/provider/requests/:serviceId" element={<BookingListPage />} />
            <Route path="/provider/profile" element={<ProviderProfileEditPage />} />
            <Route path="/provider/availability" element={<ProviderAvailabilityPage />} />
            <Route path="/provider/services" element={<ProviderServicesPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UserListPage />} />
            <Route path="/admin/services" element={<ServiceListPage />} />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}

export default App;