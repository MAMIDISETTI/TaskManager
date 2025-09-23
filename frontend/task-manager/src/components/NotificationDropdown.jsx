import React, { useState, useEffect, useRef } from 'react';
import { LuBell, LuX, LuChevronRight, LuClock, LuUser, LuUserCheck, LuCalendar, LuEye, LuCheck } from 'react-icons/lu';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import moment from 'moment';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS.UNREAD_COUNT);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_AS_READ(notificationId));
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'sign_in_notification':
        return <LuUserCheck className="w-5 h-5 text-green-600" />;
      case 'assignment':
        return <LuUser className="w-5 h-5 text-blue-600" />;
      case 'day_plan':
        return <LuCalendar className="w-5 h-5 text-purple-600" />;
      case 'observation_reminder':
        return <LuEye className="w-5 h-5 text-orange-600" />;
      case 'attendance_reminder':
        return <LuClock className="w-5 h-5 text-yellow-600" />;
      default:
        return <LuBell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'sign_in_notification':
        return 'bg-green-50 border-green-200';
      case 'assignment':
        return 'bg-blue-50 border-blue-200';
      case 'day_plan':
        return 'bg-purple-50 border-purple-200';
      case 'observation_reminder':
        return 'bg-orange-50 border-orange-200';
      case 'attendance_reminder':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = moment();
    const notificationTime = moment(date);
    const diffInMinutes = now.diff(notificationTime, 'minutes');
    const diffInHours = now.diff(notificationTime, 'hours');
    const diffInDays = now.diff(notificationTime, 'days');

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notificationTime.format('MMM DD');
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={onClose}
      />
      
      {/* Notification Dropdown */}
      <div 
        ref={dropdownRef}
        className="relative w-96 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <LuBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-white border-gray-200 hover:bg-gray-50' 
                      : `${getNotificationColor(notification.type)} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold ${
                          notification.isRead ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.requiresAction && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <LuChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              View All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
