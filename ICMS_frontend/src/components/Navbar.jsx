import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { RiUserLine, RiNotification3Line, RiCalendarLine } from 'react-icons/ri';
import { apiService } from '../services/api';
import { notificationService } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(new Set());
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Fetch notifications based on user role
  const fetchNotifications = useCallback(async () => {
    try {
      let response;
      if (user && user.role && user.role.toLowerCase() === 'client') {
        response = await apiService.getRequestsByClientId(user.client_id);
      } else {
        response = await apiService.getRequests();
      }
      if (response.data && response.data.records) {
        let filtered = [];
        if (user && user.role) {
          if (user.role.toLowerCase() === 'client') {
            // Clients: show various status updates for their requests
            filtered = response.data.records.filter(
              (reservation) => {
                // Show notifications for various statuses
                const status = reservation.status ? reservation.status.toLowerCase() : '';
                return (
                  (status === 'in_progress' || 
                   status === 'completed' || 
                   status === 'rejected' ||
                   status === 'pending_payment' ||
                   status === 'ready_for_pickup') &&
                  reservation.client_id === user.client_id
                );
              }
            );
            setNotifications(
              filtered.map((reservation) => {
                let message = '';
                let notificationType = 'info';
                
                switch (reservation.status.toLowerCase()) {
                  case 'in_progress':
                    message = `Your request (Ref: ${reservation.reference_number}) is now in progress.`;
                    notificationType = 'success';
                    break;
                  case 'completed':
                    message = `Your request (Ref: ${reservation.reference_number}) has been completed!`;
                    notificationType = 'success';
                    break;
                  case 'rejected':
                    message = `Your request (Ref: ${reservation.reference_number}) was rejected. Please contact us for more information.`;
                    notificationType = 'error';
                    break;
                  case 'pending_payment':
                    message = `Payment is pending for your request (Ref: ${reservation.reference_number}).`;
                    notificationType = 'warning';
                    break;
                  case 'ready_for_pickup':
                    message = `Your request (Ref: ${reservation.reference_number}) is ready for pickup!`;
                    notificationType = 'success';
                    break;
                  default:
                    message = `Update for your request (Ref: ${reservation.reference_number}).`;
                }
                
                return {
                  id: reservation.id,
                  message,
                  time: new Date(reservation.date_created).toLocaleString(),
                  type: notificationType,
                  status: reservation.status,
                  referenceNumber: reservation.reference_number
                };
              })
            );
          } else {
            // Employees: show all pending reservations
            filtered = response.data.records.filter(
              (reservation) =>
                reservation.status && reservation.status.toLowerCase() === 'pending'
            );
            setNotifications(
              filtered.map((reservation) => ({
                id: reservation.id,
                message: `Reservation (Ref: ${reservation.reference_number}) is pending approval.`,
                time: new Date(reservation.date_created).toLocaleString(),
                type: 'warning',
                status: reservation.status,
                referenceNumber: reservation.reference_number
              }))
            );
          }
        } else {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  }, [user]);

  // Mark all notifications as read
  const markAllAsRead = () => {
    const allNotificationIds = notifications.map(notif => notif.id);
    setReadNotifications(new Set(allNotificationIds));
  };

  // Get unread notifications count
  const getUnreadCount = () => {
    return notifications.filter(notif => !readNotifications.has(notif.id)).length;
  };

  // Mark individual notification as read
  const markAsRead = (notificationId) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    // Auto-refresh notifications every 30 seconds
    const notificationTimer = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Initial fetch
    fetchNotifications();

    // Listen for various update events using notification service
    const handleReservationUpdate = () => {
      fetchNotifications();
    };
    
    const handleCalibrationUpdate = () => {
      fetchNotifications();
    };
    
    const handleStatusUpdate = () => {
      fetchNotifications();
    };
    
    const handleRequestComplete = () => {
      fetchNotifications();
    };
    
    const handlePaymentUpdate = () => {
      fetchNotifications();
    };
    
    const handleNewRequest = () => {
      fetchNotifications();
    };
    
    const handleRequestRejection = () => {
      fetchNotifications();
    };
    
    const handleReadyForPickup = () => {
      fetchNotifications();
    };
    
    // Add multiple event listeners for different types of updates
    notificationService.listen('reservation-updated', handleReservationUpdate);
    notificationService.listen('calibration-completed', handleCalibrationUpdate);
    notificationService.listen('status-updated', handleStatusUpdate);
    notificationService.listen('request-completed', handleRequestComplete);
    notificationService.listen('payment-updated', handlePaymentUpdate);
    notificationService.listen('new-request', handleNewRequest);
    notificationService.listen('request-rejected', handleRequestRejection);
    notificationService.listen('ready-for-pickup', handleReadyForPickup);

    // Add click outside logic for modal
    const handleClickOutside = (event) => {
      if (showModal && modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      clearInterval(timer);
      clearInterval(notificationTimer);
      document.removeEventListener('mousedown', handleClickOutside);
      
      // Remove notification service listeners
      notificationService.removeListener('reservation-updated', handleReservationUpdate);
      notificationService.removeListener('calibration-completed', handleCalibrationUpdate);
      notificationService.removeListener('status-updated', handleStatusUpdate);
      notificationService.removeListener('request-completed', handleRequestComplete);
      notificationService.removeListener('payment-updated', handlePaymentUpdate);
      notificationService.removeListener('new-request', handleNewRequest);
      notificationService.removeListener('request-rejected', handleRequestRejection);
      notificationService.removeListener('ready-for-pickup', handleReadyForPickup);
    };
  }, [user, showModal, fetchNotifications]);

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getUserLevel = () => {
    if (isLoading || !user) return '';
    if (user.role) {
      if (user.role === 'calibration_engineers') return 'Calibration Engineer';
      return user.role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return '';
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 dark:text-gray-200">
          <RiUserLine className="w-5 h-5" />
          Welcome, {user?.first_name || user?.full_name?.split(' ')[0] || 'User'}
          {user?.role && (
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 ml-2">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-300">
          <RiCalendarLine className="w-4 h-4" />
          Today is {formatDate(currentDate)}
        </div>
      </div>
      <div className="flex items-center gap-3 relative">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
          onClick={() => setShowModal((prev) => !prev)}
        >
          <RiNotification3Line className="w-5 h-5 text-gray-600 dark:text-gray-200" />
          {getUnreadCount() > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
            </span>
          )}
        </button>
        {/* Notification Dropdown */}
        {showModal && (
          <div ref={modalRef} className="absolute right-0 top-full w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg pl-4 pr-0 pt-4 pb-4 z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Notifications</h2>
              <div className="flex gap-2">
                {getUnreadCount() > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    Mark All Read
                  </button>
                )}
                <button
                  onClick={fetchNotifications}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Refresh
                </button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-300 text-sm">No new notifications.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto pr-3">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    className={`py-3 flex flex-col gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!readNotifications.has(notif.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-2">
                      {/* Notification Icon */}
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notif.type === 'success' ? 'bg-green-500' :
                        notif.type === 'error' ? 'bg-red-500' :
                        notif.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm leading-relaxed ${
                          !readNotifications.has(notif.id) 
                            ? 'text-gray-900 dark:text-gray-100 font-medium' 
                            : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {notif.message}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400 dark:text-gray-300">
                            {notif.time}
                          </div>
                          
                           <div className="flex items-center gap-2">
                             {/* Status Badge */}
                             <span className={`px-2 py-1 text-xs rounded-full ${
                               notif.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                               notif.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                               notif.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                               notif.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                               notif.status === 'ready_for_pickup' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                               'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                             }`}>
                               {notif.status.replace('_', ' ').toUpperCase()}
                             </span>
                             
                             {/* Only show View Details for non-client users */}
                             {user && user.role && user.role.toLowerCase() !== 'client' && (
                               <span
                                 className="text-xs text-blue-600 hover:underline cursor-pointer"
                                 onClick={() => navigate('/reservations?tab=pending')}
                               >
                                 View Details
                               </span>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar; 