import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAllUsersAPI, toggleUserBlockStatusAPI } from '../../api/admin';
import { useDebounce } from '../../hooks/useDebounce';
import { Users, Search } from 'lucide-react';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsersAPI(debouncedSearchTerm, roleFilter);
        setUsers(data);
      } catch (error) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [debouncedSearchTerm, roleFilter]);

  const handleToggleBlock = async (userId) => {
    if (window.confirm('Are you sure you want to change this user\'s status?')) {
        try {
            const updatedUser = await toggleUserBlockStatusAPI(userId);
            setUsers(prevUsers => prevUsers.map(user => user._id === userId ? updatedUser : user));
            toast.success('User status updated successfully.');
        } catch (error) {
            toast.error('Failed to update user status.');
        }
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 animate-fade-in-up">
      {/* Page Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Oversee and manage all users on the platform.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                </div>
                <input 
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-9 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button onClick={() => setRoleFilter('all')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${roleFilter === 'all' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>All</button>
                <button onClick={() => setRoleFilter('customer')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${roleFilter === 'customer' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Customers</button>
                <button onClick={() => setRoleFilter('provider')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${roleFilter === 'provider' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>Providers</button>
            </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto p-0">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Loading users...</td></tr>
            ) : users.length > 0 ? users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                <td className="px-6 py-4">
                    <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.profilePicture.startsWith('https://') ? user.profilePicture : `${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}`} alt={user.name} />
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <button 
                        onClick={() => handleToggleBlock(user._id)}
                        className={`px-3 py-1 rounded-md text-white text-xs font-bold ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                </td>
              </tr>
            )) : (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No users found for this filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UserListPage;
