/**
 * Notification Engine - Smart Entry & CrowdFlow
 * 
 * Real-time notifications and smart alerts system
 * Manages all notifications for fans and operators
 */

export type NotificationType = 
  | 'gate-change' 
  | 'crowd-alert' 
  | 'time-warning' 
  | 'facility-alert' 
  | 'safety-alert' 
  | 'price-change' 
  | 'recommendation' 
  | 'system-update';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: Date;
  targetAudience: 'fan' | 'operator' | 'both';
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  fanId: string;
  enableGateChangeNotifications: boolean;
  enableCrowdAlerts: boolean;
  enableTimeWarnings: boolean;
  enableFacilityAlerts: boolean;
  enableSafetyAlerts: boolean;
  enablePriceChangeNotifications: boolean;
  enableRecommendations: boolean;
  quietHours: { start: number; end: number } | null;
  preferredChannels: ('in-app' | 'push' | 'sms' | 'email')[];
}

/**
 * Notification Engine
 * Manages real-time notifications and alerts
 */
export class NotificationEngine {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private notificationListeners: Set<(notification: Notification) => void> = new Set();
  private notificationHistory: Notification[] = [];

  constructor() {
    this.initializeDefaultPreferences();
  }

  /**
   * Initialize default preferences
   */
  private initializeDefaultPreferences(): void {
    const defaultPrefs: NotificationPreferences = {
      fanId: 'default',
      enableGateChangeNotifications: true,
      enableCrowdAlerts: true,
      enableTimeWarnings: true,
      enableFacilityAlerts: true,
      enableSafetyAlerts: true,
      enablePriceChangeNotifications: false,
      enableRecommendations: true,
      quietHours: null,
      preferredChannels: ['in-app'],
    };

    this.preferences.set('default', defaultPrefs);
  }

  /**
   * Send gate change notification
   */
  sendGateChangeNotification(
    fanId: string,
    oldGate: number,
    newGate: number,
    reason: string
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type: 'gate-change',
      priority: 'high',
      title: `تغيير البوابة`,
      message: `تم تحديث البوابة المخصصة من البوابة ${oldGate} إلى البوابة ${newGate}. السبب: ${reason}`,
      icon: '🚪',
      color: '#f59e0b',
      timestamp: new Date(),
      read: false,
      actionUrl: `/fan?gate=${newGate}`,
      actionLabel: 'اذهب إلى البوابة الجديدة',
      targetAudience: 'fan',
      metadata: { oldGate, newGate, reason },
    };

    this.addNotification(fanId, notification);
    return notification;
  }

  /**
   * Send crowd alert notification
   */
  sendCrowdAlert(
    targetAudience: 'fan' | 'operator' | 'both',
    crowdDensity: number,
    affectedGates: number[]
  ): Notification {
    let title = '';
    let message = '';
    let priority: NotificationPriority = 'medium';
    let icon = '';

    if (crowdDensity >= 85) {
      title = '⚠️ تحذير ازدحام حرج';
      message = `الكثافة البشرية وصلت إلى ${crowdDensity}% على البوابات ${affectedGates.join(', ')}. يرجى تجنب هذه البوابات`;
      priority = 'critical';
      icon = '🔴';
    } else if (crowdDensity >= 70) {
      title = '⚠️ ازدحام مرتفع';
      message = `الكثافة البشرية ${crowdDensity}% على البوابات ${affectedGates.join(', ')}. يوصى باستخدام بوابات بديلة`;
      priority = 'high';
      icon = '🟠';
    } else {
      title = '→ تحديث الازدحام';
      message = `الكثافة البشرية الحالية ${crowdDensity}% على البوابات ${affectedGates.join(', ')}`;
      priority = 'medium';
      icon = '🟡';
    }

    const notification: Notification = {
      id: this.generateId(),
      type: 'crowd-alert',
      priority,
      title,
      message,
      icon,
      color: priority === 'critical' ? '#ef4444' : priority === 'high' ? '#f97316' : '#eab308',
      timestamp: new Date(),
      read: false,
      targetAudience,
      metadata: { crowdDensity, affectedGates },
    };

    if (targetAudience === 'fan' || targetAudience === 'both') {
      this.broadcastNotification(notification);
    }

    return notification;
  }

  /**
   * Send time warning notification
   */
  sendTimeWarning(fanId: string, minutesUntilMatch: number): Notification {
    let title = '';
    let message = '';
    let priority: NotificationPriority = 'medium';

    if (minutesUntilMatch <= 5) {
      title = '🔔 دورك الآن!';
      message = `دورك للدخول الآن! توجه إلى البوابة المخصصة فوراً`;
      priority = 'critical';
    } else if (minutesUntilMatch <= 15) {
      title = '⏰ اقترب دورك';
      message = `سيكون دورك خلال ${minutesUntilMatch} دقائق. استعد للدخول`;
      priority = 'high';
    } else if (minutesUntilMatch <= 30) {
      title = '⏱️ تنبيه زمني';
      message = `المباراة ستبدأ خلال ${minutesUntilMatch} دقيقة. يوصى بالدخول الآن`;
      priority = 'medium';
    } else {
      title = '📅 تذكير';
      message = `المباراة ستبدأ خلال ${minutesUntilMatch} دقيقة`;
      priority = 'low';
    }

    const notification: Notification = {
      id: this.generateId(),
      type: 'time-warning',
      priority,
      title,
      message,
      icon: '⏰',
      color: priority === 'critical' ? '#ef4444' : '#3b82f6',
      timestamp: new Date(),
      read: false,
      targetAudience: 'fan',
      metadata: { minutesUntilMatch },
    };

    this.addNotification(fanId, notification);
    return notification;
  }

  /**
   * Send facility alert notification
   */
  sendFacilityAlert(
    fanId: string,
    facilityType: 'restroom' | 'food' | 'merchandise' | 'first-aid',
    location: string,
    waitTime: number
  ): Notification {
    const facilityNames: Record<string, string> = {
      restroom: 'دورات المياه',
      food: 'كشك الطعام',
      merchandise: 'متجر البضائع',
      'first-aid': 'الإسعافات الأولية',
    };

    const notification: Notification = {
      id: this.generateId(),
      type: 'facility-alert',
      priority: facilityType === 'first-aid' ? 'critical' : 'medium',
      title: `${facilityNames[facilityType]} متاحة`,
      message: `${facilityNames[facilityType]} في ${location} متاحة الآن. الانتظار المتوقع: ${waitTime} دقائق`,
      icon: facilityType === 'restroom' ? '🚻' : facilityType === 'food' ? '🍔' : '🛍️',
      color: '#10b981',
      timestamp: new Date(),
      read: false,
      actionUrl: `/fan-navigation?facility=${facilityType}`,
      actionLabel: 'اذهب إلى المرفق',
      targetAudience: 'fan',
      metadata: { facilityType, location, waitTime },
    };

    this.addNotification(fanId, notification);
    return notification;
  }

  /**
   * Send safety alert notification
   */
  sendSafetyAlert(
    targetAudience: 'fan' | 'operator' | 'both',
    alertType: string,
    location: string,
    action: string
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type: 'safety-alert',
      priority: 'critical',
      title: `🛡️ تنبيه أمني`,
      message: `${alertType} في ${location}. الإجراء المقترح: ${action}`,
      icon: '🛡️',
      color: '#ef4444',
      timestamp: new Date(),
      read: false,
      targetAudience,
      metadata: { alertType, location, action },
    };

    if (targetAudience === 'operator' || targetAudience === 'both') {
      this.broadcastNotification(notification);
    }

    return notification;
  }

  /**
   * Send price change notification
   */
  sendPriceChangeNotification(
    fanId: string,
    oldPrice: number,
    newPrice: number,
    reason: string
  ): Notification {
    const priceChange = newPrice - oldPrice;
    const percentChange = ((priceChange / oldPrice) * 100).toFixed(1);

    const notification: Notification = {
      id: this.generateId(),
      type: 'price-change',
      priority: priceChange > 0 ? 'medium' : 'low',
      title: `💰 تغيير السعر`,
      message: `سعر التذكرة ${priceChange > 0 ? 'ارتفع' : 'انخفض'} من ${oldPrice} إلى ${newPrice} (${percentChange}%). السبب: ${reason}`,
      icon: priceChange > 0 ? '📈' : '📉',
      color: priceChange > 0 ? '#f97316' : '#10b981',
      timestamp: new Date(),
      read: false,
      targetAudience: 'fan',
      metadata: { oldPrice, newPrice, reason, percentChange },
    };

    this.addNotification(fanId, notification);
    return notification;
  }

  /**
   * Send recommendation notification
   */
  sendRecommendation(
    fanId: string,
    recommendationType: string,
    title: string,
    message: string,
    actionUrl: string
  ): Notification {
    const notification: Notification = {
      id: this.generateId(),
      type: 'recommendation',
      priority: 'medium',
      title: `💡 ${title}`,
      message,
      icon: '💡',
      color: '#8b5cf6',
      timestamp: new Date(),
      read: false,
      actionUrl,
      actionLabel: 'عرض التفاصيل',
      targetAudience: 'fan',
      metadata: { recommendationType },
    };

    this.addNotification(fanId, notification);
    return notification;
  }

  /**
   * Add notification to user's queue
   */
  private addNotification(fanId: string, notification: Notification): void {
    if (!this.notifications.has(fanId)) {
      this.notifications.set(fanId, []);
    }

    this.notifications.get(fanId)!.push(notification);
    this.notificationHistory.push(notification);
    this.notifyListeners(notification);

    // Auto-expire notifications after 24 hours
    if (!notification.expiresAt) {
      notification.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Broadcast notification to all users
   */
  private broadcastNotification(notification: Notification): void {
    // In a real system, this would broadcast to all connected users
    this.notificationHistory.push(notification);
    this.notifyListeners(notification);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: Notification): void {
    this.notificationListeners.forEach(listener => {
      listener(notification);
    });
  }

  /**
   * Get user notifications
   */
  getUserNotifications(fanId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(fanId) || [];
    
    if (unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }

    return userNotifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    this.notificationHistory.forEach(n => {
      if (n.id === notificationId) {
        n.read = true;
      }
    });

    this.notifications.forEach(notifications => {
      notifications.forEach(n => {
        if (n.id === notificationId) {
          n.read = true;
        }
      });
    });
  }

  /**
   * Clear user notifications
   */
  clearUserNotifications(fanId: string): void {
    this.notifications.delete(fanId);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(fanId: string): NotificationPreferences {
    return this.preferences.get(fanId) || this.preferences.get('default')!;
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(fanId: string, preferences: Partial<NotificationPreferences>): void {
    const currentPrefs = this.getUserPreferences(fanId);
    this.preferences.set(fanId, { ...currentPrefs, ...preferences, fanId });
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: (notification: Notification) => void): () => void {
    this.notificationListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  /**
   * Get notification history
   */
  getNotificationHistory(limit: number = 50): Notification[] {
    return this.notificationHistory.slice(-limit);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get unread count
   */
  getUnreadCount(fanId: string): number {
    return this.getUserNotifications(fanId, true).length;
  }
}

// Export singleton instance
export const notificationEngine = new NotificationEngine();
