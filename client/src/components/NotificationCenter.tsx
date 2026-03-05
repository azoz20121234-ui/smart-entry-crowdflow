/**
 * Notification Center Component - Smart Entry & CrowdFlow
 * 
 * Displays and manages notifications for users
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { notificationEngine, Notification } from '@/lib/notificationEngine';

interface NotificationCenterProps {
  fanId: string;
  maxNotifications?: number;
}

export function NotificationCenter({ fanId, maxNotifications = 5 }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load initial notifications
    const userNotifications = notificationEngine.getUserNotifications(fanId);
    setNotifications(userNotifications.slice(-maxNotifications));
    setUnreadCount(notificationEngine.getUnreadCount(fanId));

    // Subscribe to new notifications
    const unsubscribe = notificationEngine.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, maxNotifications));
      setUnreadCount(notificationEngine.getUnreadCount(fanId));
    });

    return unsubscribe;
  }, [fanId, maxNotifications]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationEngine.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(notificationEngine.getUnreadCount(fanId));
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getIconComponent = (icon: string) => {
    switch (icon) {
      case '🚪':
        return '🚪';
      case '🔴':
        return '🔴';
      case '🟠':
        return '🟠';
      case '🟡':
        return '🟡';
      case '⏰':
        return '⏰';
      case '🛡️':
        return '🛡️';
      case '💰':
        return '💰';
      case '💡':
        return '💡';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">الإشعارات</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-2 p-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {getIconComponent(notification.icon)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">
                          {new Date(notification.timestamp).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            {notification.actionLabel || 'عرض'}
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismiss(notification.id)}
                      className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      ✓ وضع علامة كمقروء
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">لا توجد إشعارات جديدة</p>
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 p-3 text-center">
              <button className="text-xs text-slate-600 hover:text-slate-900 font-semibold">
                عرض جميع الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline Notification Component
 * For displaying notifications as toast-like messages
 */
export function InlineNotification({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.priority === 'critical') {
      // Keep critical notifications visible longer
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border-l-4 max-w-md animate-in slide-in-from-bottom-5 ${
        notification.priority === 'critical'
          ? 'bg-red-50 border-red-500'
          : notification.priority === 'high'
            ? 'bg-orange-50 border-orange-500'
            : notification.priority === 'medium'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{notification.icon}</span>

        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{notification.title}</h4>
          <p className="text-sm text-slate-700 mt-1">{notification.message}</p>

          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
            >
              {notification.actionLabel || 'عرض التفاصيل'} →
            </a>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss();
          }}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Notification History Component
 */
export function NotificationHistory({ fanId }: { fanId: string }) {
  const [history, setHistory] = useState<Notification[]>([]);

  useEffect(() => {
    const allNotifications = notificationEngine.getNotificationHistory(100);
    setHistory(allNotifications);
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          سجل الإشعارات
        </CardTitle>
        <CardDescription>آخر {history.length} إشعار</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map(notification => (
              <div
                key={notification.id}
                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{notification.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{notification.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">لا توجد إشعارات</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
