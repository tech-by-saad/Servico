import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyNotificationsAPI, markNotificationsAsReadAPI } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, X } from 'lucide-react'; // Using more icons

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        if (!user) return;
        const fetchNotifications = async () => {
            try {
                const data = await getMyNotificationsAPI();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications");
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [user]);

    const handleToggle = async () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen && unreadCount > 0) {
            try {
                await markNotificationsAsReadAPI();
                // Optimistically update the UI
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error("Failed to mark notifications as read");
            }
        }
    };
    
    const markAllAsRead = async () => {
        if (unreadCount > 0) {
            try {
                await markNotificationsAsReadAPI();
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                toast.success("All notifications marked as read!"); // Provide user feedback
            } catch (error) {
                console.error("Failed to mark all notifications as read:", error);
                toast.error("Failed to mark all as read.");
            }
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button onClick={handleToggle} className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            
            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div 
                    className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transform origin-top-right transition-all duration-200 ease-out" 
                    // Optional: Close on click outside, but onMouseLeave is often sufficient for dropdowns
                    // onMouseLeave={() => setIsOpen(false)} // This can be tricky with fast mouse movements
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead} 
                                    className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
                                >
                                    <CheckCheck size={14} /> Mark all as read
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class for styling */}
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link 
                                    to={notif.link} 
                                    onClick={() => setIsOpen(false)} 
                                    key={notif._id} 
                                    className={`flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${!notif.isRead ? 'bg-blue-50 font-medium' : 'bg-white'}`}
                                >
                                    {/* Read/Unread Indicator */}
                                    <div className="flex-shrink-0">
                                        <span className={`h-2.5 w-2.5 rounded-full block ${!notif.isRead ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
                                    </div>
                                    
                                    {/* Notification Content */}
                                    <div className="flex-grow">
                                        <p className={`text-gray-800 leading-snug ${!notif.isRead ? 'text-blue-800' : ''}`}>{notif.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-8 text-center text-sm text-gray-500">
                                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="font-medium">You're all caught up!</p>
                                <p>No new notifications at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;