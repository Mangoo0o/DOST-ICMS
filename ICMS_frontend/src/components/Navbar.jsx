import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { RiUserLine, RiNotification3Line, RiCalendarLine } from 'react-icons/ri';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    // Fetch notifications based on user role
    const fetchNotifications = async () => {
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
              // Clients: show accepted reservations for themselves
              filtered = response.data.records.filter(
                (reservation) =>
                  reservation.status && reservation.status.toLowerCase() === 'in_progress' &&
                  reservation.client_id === user.client_id
              );
              setNotifications(
                filtered.map((reservation) => ({
                  id: reservation.id,
                  message: `Your reservation (Ref: ${reservation.reference_number}) has been accepted.`,
                  time: new Date(reservation.date_created).toLocaleString(),
                }))
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
        setNotifications([]);
      }
    };
    fetchNotifications();

    // Listen for reservation updates
    const handleReservationUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('reservation-updated', handleReservationUpdate);

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
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('reservation-updated', handleReservationUpdate);
    };
  }, [user, showModal]);

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
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        {/* Notification Dropdown */}
        {showModal && (
          <div ref={modalRef} className="absolute right-0 top-full w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg pl-4 pr-0 pt-4 pb-4 z-50 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Notifications</h2>
            </div>
            {notifications.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-300 text-sm">No new notifications.</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto pr-3">
                {notifications.map((notif) => (
                  <li key={notif.id} className="py-2 flex flex-col gap-1">
                    <div className="text-sm text-gray-700 dark:text-gray-200">{notif.message}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 dark:text-gray-300">{notif.time}</div>
                      <span
                        className="text-xs text-blue-600 hover:underline cursor-pointer ml-2"
                        onClick={() => navigate('/reservations')}
                      >
                        go to page
                      </span>
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