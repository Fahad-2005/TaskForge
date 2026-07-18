import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket';
import './NotificationCenter.css';

function NotificationCenter({ onWorkspaceUpdate, className = '' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const userId = currentUser.id || currentUser._id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await apiFetch(`/notifications/user/${userId}`);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId]);

  useWorkspaceSocket(null, {
    'notification:created': (notification) => {
      setNotifications((current) => {
        if (current.some((item) => item._id === notification._id)) return current;
        return [notification, ...current];
      });
    },
    connect: fetchNotifications,
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const handleAcceptInvite = async (notification) => {
    setLoading(true);
    try {
      await apiFetch(`/notifications/${notification._id}/accept-invite`, { method: 'POST' });

      await fetchNotifications();
      if (onWorkspaceUpdate) onWorkspaceUpdate();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineInvite = async (notification) => {
    setLoading(true);
    try {
      await apiFetch(`/notifications/${notification._id}/decline-invite`, { method: 'POST' });

      await fetchNotifications();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read && notification.type !== 'workspace_invite') {
      await markAsRead(notification._id);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'workspace_invite') return '🤝';
    if (type === 'task_assigned') return '📋';
    if (type === 'comment_mention') return '@';
    if (type === 'task_comment') return '💬';
    return '🔔';
  };

  const getNotificationLabel = (type) => {
    if (type === 'workspace_invite') return 'Invite';
    if (type === 'task_assigned') return 'Assignment';
    if (type === 'comment_mention') return 'Mention';
    if (type === 'task_comment') return 'Comment';
    return 'Alert';
  };

  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    try {
      await apiFetch(`/notifications/user/${userId}/read-all`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`notification-center ${className}`} ref={panelRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <span className="notification-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h4>Notifications</h4>
            <div className="notification-header-actions">
              {unreadCount > 0 && <span className="notification-unread-pill">{unreadCount} unread</span>}
              {unreadCount > 0 && (
                <button type="button" className="notification-mark-all" onClick={markAllAsRead}>
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">You&apos;re all caught up — no alerts yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={[
                    'notification-item',
                    !notification.read && 'notification-item--unread',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-item-body">
                    <span className={`notification-type-chip notification-type-chip--${notification.type}`}>
                      {getNotificationLabel(notification.type)}
                    </span>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>

                    {notification.type === 'workspace_invite' && notification.inviteStatus === 'pending' && (
                      <div className="notification-actions">
                        <button
                          type="button"
                          className="notification-btn notification-btn--accept"
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptInvite(notification);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="notification-btn notification-btn--decline"
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeclineInvite(notification);
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {notification.type === 'workspace_invite' && notification.inviteStatus === 'accepted' && (
                      <span className="notification-status notification-status--accepted">Accepted</span>
                    )}
                    {notification.type === 'workspace_invite' && notification.inviteStatus === 'declined' && (
                      <span className="notification-status notification-status--declined">Declined</span>
                    )}
                  </div>

                  {!notification.read && notification.type !== 'workspace_invite' && (
                    <span className="notification-dot" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
