import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
export const STORAGE_KEYS = {
  IS_GUEST: 'isGuest',
  GUEST_SESSION_ID: 'guestSessionId',
  REGISTERED_SESSION_ID: 'registeredSessionId',
  USER_DATA: 'userData',
  HAS_SEEN_WELCOME: 'hasSeenWelcome',
  HAS_LAUNCHED_BEFORE: 'hasLaunchedBefore',
  GUEST_TOKEN: 'guestToken',
  HAS_SHOWN_LOGIN_TOAST: 'hasShownLoginToast',
} as const;

export interface UserSessionData {
  uid: string;
  email: string;
  displayName?: string;
  [key: string]: any;
}

export class SessionManager {
  /**
   * Initialize session for registered user
   */
  static async setRegisteredUserSession(userData: UserSessionData): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.IS_GUEST, 'false'],
        [STORAGE_KEYS.REGISTERED_SESSION_ID, userData.uid],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      ]);
      
      // Clear guest session data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.GUEST_SESSION_ID,
        STORAGE_KEYS.GUEST_TOKEN,
      ]);
      
      console.log('✅ Registered user session initialized');
    } catch (error) {
      console.error('❌ Error setting registered user session:', error);
    }
  }

  /**
   * Initialize session for guest user
   */
  static async setGuestSession(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.IS_GUEST, 'true'],
        [STORAGE_KEYS.GUEST_SESSION_ID, sessionId],
      ]);
      console.log('✅ Guest session initialized');
    } catch (error) {
      console.error('❌ Error setting guest session:', error);
    }
  }

  /**
   * Check if user is guest
   */
  static async isGuest(): Promise<boolean> {
    try {
      const isGuest = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST);
      return isGuest === 'true';
    } catch (error) {
      console.error('❌ Error checking guest status:', error);
      return false;
    }
  }

  /**
   * Get stored user data
   */
  static async getUserData(): Promise<UserSessionData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  /**
   * Update stored user data
   */
  static async updateUserData(userData: Partial<UserSessionData>): Promise<void> {
    try {
      const currentData = await this.getUserData();
      const updatedData = { ...currentData, ...userData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedData));
      console.log('✅ User data updated');
    } catch (error) {
      console.error('❌ Error updating user data:', error);
    }
  }

  /**
   * Get registered session ID
   */
  static async getRegisteredSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_SESSION_ID);
    } catch (error) {
      console.error('❌ Error getting registered session ID:', error);
      return null;
    }
  }

  /**
   * Get guest session ID
   */
  static async getGuestSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
    } catch (error) {
      console.error('❌ Error getting guest session ID:', error);
      return null;
    }
  }

  /**
   * Check if user has seen welcome screen
   */
  static async hasSeenWelcome(): Promise<boolean> {
    try {
      const hasSeen = await AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_WELCOME);
      return hasSeen === 'true';
    } catch (error) {
      console.error('❌ Error checking welcome status:', error);
      return false;
    }
  }

  /**
   * Mark welcome screen as seen
   */
  static async markWelcomeAsSeen(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_WELCOME, 'true');
      console.log('✅ Welcome screen marked as seen');
    } catch (error) {
      console.error('❌ Error marking welcome as seen:', error);
    }
  }

  /**
   * Check if app has been launched before
   */
  static async hasLaunchedBefore(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED_BEFORE);
      return hasLaunched === 'true';
    } catch (error) {
      console.error('❌ Error checking launch status:', error);
      return false;
    }
  }

  /**
   * Mark app as launched
   */
  static async markAsLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED_BEFORE, 'true');
      console.log('✅ App marked as launched');
    } catch (error) {
      console.error('❌ Error marking app as launched:', error);
    }
  }

  /**
   * Clear all session data (logout)
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.IS_GUEST,
        STORAGE_KEYS.GUEST_SESSION_ID,
        STORAGE_KEYS.REGISTERED_SESSION_ID,
        STORAGE_KEYS.GUEST_TOKEN,
        STORAGE_KEYS.HAS_SHOWN_LOGIN_TOAST,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log('✅ Session cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing session:', error);
    }
  }

  /**
   * Check if user has active session
   */
  static async hasActiveSession(): Promise<boolean> {
    try {
      const isGuest = await AsyncStorage.getItem(STORAGE_KEYS.IS_GUEST);
      const registeredSessionId = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_SESSION_ID);
      const guestSessionId = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_SESSION_ID);
      
      // Has session if either registered or guest session exists
      return (isGuest === 'false' && !!registeredSessionId) || (isGuest === 'true' && !!guestSessionId);
    } catch (error) {
      console.error('❌ Error checking active session:', error);
      return false;
    }
  }

  /**
   * Get all session data for debugging
   */
  static async getSessionDebugInfo(): Promise<Record<string, string | null>> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      return Object.fromEntries(values);
    } catch (error) {
      console.error('❌ Error getting session debug info:', error);
      return {};
    }
  }
}
