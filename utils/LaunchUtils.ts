import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionManager, STORAGE_KEYS } from './SessionManager';

/**
 * Utility functions for managing first-time launch state
 * Now integrated with SessionManager for comprehensive session handling
 */
export class LaunchUtils {
  /**
   * Clear the first-launch flag to reset the app to first-time state
   * Useful for testing the welcome screen flow
   */
  static async resetToFirstLaunch(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HAS_LAUNCHED_BEFORE);
      await AsyncStorage.removeItem(STORAGE_KEYS.HAS_SEEN_WELCOME);
      console.log('✅ App reset to first-launch state');
    } catch (error) {
      console.error('❌ Error resetting first-launch state:', error);
    }
  }

  /**
   * Check if this is the first launch
   */
  static async isFirstLaunch(): Promise<boolean> {
    try {
      return !(await SessionManager.hasLaunchedBefore());
    } catch (error) {
      console.error('❌ Error checking first launch:', error);
      return true;
    }
  }

  /**
   * Mark the app as having been launched before
   */
  static async markAsLaunched(): Promise<void> {
    try {
      await SessionManager.markAsLaunched();
    } catch (error) {
      console.error('❌ Error marking app as launched:', error);
    }
  }

  /**
   * Reset all app state (for debugging)
   */
  static async resetAllState(): Promise<void> {
    try {
      await SessionManager.clearSession();
      await this.resetToFirstLaunch();
      console.log('✅ All app state reset');
    } catch (error) {
      console.error('❌ Error resetting all state:', error);
    }
  }
}


