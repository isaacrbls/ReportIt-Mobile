import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if running in Expo Go (push notifications not supported in Expo Go SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class NotificationService {
  private static PERMISSION_KEY = 'notificationPermissionAsked';
  private static TOKEN_KEY = 'pushNotificationToken';

  /**
   * Check if notification permissions have been requested before
   */
  static async hasAskedForPermission(): Promise<boolean> {
    try {
      const asked = await AsyncStorage.getItem(this.PERMISSION_KEY);
      return asked === 'true';
    } catch (error) {
      console.error('Error checking notification permission status:', error);
      return false;
    }
  }

  /**
   * Mark that we've asked for notification permission
   */
  private static async markPermissionAsked(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PERMISSION_KEY, 'true');
    } catch (error) {
      console.error('Error marking notification permission as asked:', error);
    }
  }

  /**
   * Request notification permissions from the user
   */
  static async requestPermissions(): Promise<NotificationPermissionResult> {
    try {
      console.log('🔔 Requesting notification permissions...');

      // Check if running in Expo Go
      if (isExpoGo) {
        console.warn('⚠️ Push notifications are not supported in Expo Go (SDK 53+)');
        console.log('ℹ️ For push notifications, build a development or production build');
        return {
          granted: false,
          canAskAgain: false,
          status: 'expo-go-limitation',
        };
      }

      // Check if this is a real device
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return {
          granted: false,
          canAskAgain: false,
          status: 'unavailable',
        };
      }

      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('🔔 Current notification status:', existingStatus);

      let finalStatus = existingStatus;

      // If permission not determined, ask user
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        await this.markPermissionAsked();
        console.log('🔔 New notification status after request:', finalStatus);
      }

      // Handle permission result
      if (finalStatus === 'granted') {
        console.log('✅ Notification permissions granted!');
        
        // Register for push notifications and get token
        const token = await this.registerForPushNotifications();
        if (token) {
          console.log('📱 Push notification token:', token);
        }

        return {
          granted: true,
          canAskAgain: false,
          status: finalStatus,
        };
      } else if (finalStatus === 'denied') {
        console.warn('❌ Notification permissions denied');
        return {
          granted: false,
          canAskAgain: false,
          status: finalStatus,
        };
      } else {
        console.warn('⚠️ Notification permission status:', finalStatus);
        return {
          granted: false,
          canAskAgain: true,
          status: finalStatus,
        };
      }
    } catch (error: any) {
      console.error('❌ Error requesting notification permissions:', error);
      return {
        granted: false,
        canAskAgain: true,
        status: 'error',
      };
    }
  }

  /**
   * Register device for push notifications and get push token
   */
  private static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (isExpoGo) {
        console.warn('⚠️ Cannot register for push notifications in Expo Go');
        return null;
      }

      if (!Device.isDevice) {
        return null;
      }

      // Get push notification token
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('📱 Expo push token:', token);

      // Store token locally
      await AsyncStorage.setItem(this.TOKEN_KEY, token);

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EF4444',
        });

        // Create specific channel for verified reports
        await Notifications.setNotificationChannelAsync('verified-reports', {
          name: 'Verified Reports',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#EF4444',
          sound: 'default',
          description: 'Notifications for newly verified incident reports in your area',
        });
      }

      return token;
    } catch (error) {
      console.error('❌ Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Get stored push notification token
   */
  static async getPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Check current notification permission status
   */
  static async getPermissionStatus(): Promise<string> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting notification permission status:', error);
      return 'unknown';
    }
  }

  /**
   * Show an alert prompting user to enable notifications in settings
   */
  static showPermissionDeniedAlert(): void {
    Alert.alert(
      'Notifications Disabled',
      'Push notifications are currently disabled. You can enable them in your device settings to receive alerts about verified incident reports in your area.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  }

  /**
   * Schedule a local notification (works even when app is closed)
   */
  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    delaySeconds: number = 0
  ): Promise<string | null> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Cannot schedule notification - permission not granted');
        return null;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          badge: 1,
        },
        trigger: delaySeconds > 0 ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds, repeats: false } : null,
      });

      console.log('✅ Notification scheduled with ID:', identifier);
      return identifier;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Send notification for a newly verified report
   */
  static async notifyNewVerifiedReport(
    incidentType: string,
    barangay: string,
    reportId: string
  ): Promise<void> {
    try {
      await this.scheduleLocalNotification(
        '🚨 New Verified Report',
        `${incidentType} reported in ${barangay}. Tap to view details.`,
        {
          type: 'verified-report',
          reportId: reportId,
          incidentType: incidentType,
          barangay: barangay,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('❌ Error sending verified report notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('✅ Notification cancelled:', identifier);
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  }

  /**
   * Clear notification badge (iOS)
   */
  static async clearBadge(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('❌ Error clearing badge:', error);
    }
  }

  /**
   * Add notification received listener (app in foreground)
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (user tapped notification)
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Get all scheduled notifications
   */
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Error getting scheduled notifications:', error);
      return [];
    }
  }
}
