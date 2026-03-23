import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDashboardStatsAPI } from '../../api/admin';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStatsAPI();
        setStats(data);
      } catch (error) {
        toast.error('Could not fetch dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Could not load data.</p>;
  
  const bookingsChartData = {
    labels: stats.bookingsByDay.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Bookings per Day (Last 7 Days)',
      data: stats.bookingsByDay.map(d => d.count),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl text-gray-600">Total Users</h2>
          <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl text-gray-600">Total Providers</h2>
          <p className="text-4xl font-bold mt-2">{stats.totalProviders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl text-gray-600">Total Bookings</h2>
          <p className="text-4xl font-bold mt-2">{stats.totalBookings}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Recent Booking Activity</h2>
            <Bar data={bookingsChartData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Most Popular Services</h2>
            <ul className="space-y-3">
                {stats.popularServices.map((service, index) => (
                    <li key={index} className="flex justify-between items-center">
                        <span className="font-medium">{service.name}</span>
                        <span className="font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{service.count} bookings</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;