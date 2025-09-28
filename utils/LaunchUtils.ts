import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing first-time launch state
 */
export class LaunchUtils {
  /**
   * Clear the first-launch flag to reset the app to first-time state
   * Useful for testing the welcome screen flow
   */
  static async resetToFirstLaunch(): Promise<void> {
    try {
      await AsyncStorage.removeItem('hasLaunchedBefore');
      console.log('App reset to first-launch state');
    } catch (error) {
      console.error('Error resetting first-launch state:', error);
    }
  }

  /**
   * Check if this is the first launch
   */
  static async isFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      return hasLaunchedBefore === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  /**
   * Mark the app as having been launched before
   */
  static async markAsLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem('hasLaunchedBefore', 'true');
    } catch (error) {
      console.error('Error marking app as launched:', error);
    }
  }
}


