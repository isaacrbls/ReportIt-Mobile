import { Platform, Linking, Alert, PermissionsAndroid } from 'react-native';
import RNImmediatePhoneCall from 'react-native-phone-call';

export interface PhoneCallResult {
  success: boolean;
  error?: string;
  message?: string;
}

export class PhoneCallService {
  
  /**
   * Requests CALL_PHONE permission on Android
   * @returns true if permission granted, false otherwise
   */
  private static async requestCallPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need explicit permission
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: 'Phone Call Permission',
          message: 'ReportIt needs permission to make phone calls to local authorities.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error requesting call permission:', error);
      return false;
    }
  }

  /**
   * Checks if CALL_PHONE permission is already granted
   */
  private static async hasCallPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE
      );
      return hasPermission;
    } catch (error) {
      console.error('Error checking call permission:', error);
      return false;
    }
  }
  
  /**
   * Validates a phone number format
   * Accepts various formats: +63XXXXXXXXXX, 0XXXXXXXXXX, XXX-XXXX, etc.
   */
  private static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digit characters for validation
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if number has at least 7 digits (minimum for most phone numbers)
    if (cleanNumber.length < 7) {
      return false;
    }
    
    // Philippine number validation (can be extended for international)
    // Accepts:
    // - 11 digits starting with 09 (mobile)
    // - 10 digits (landline)
    // - International format with country code
    if (cleanNumber.length >= 7 && cleanNumber.length <= 15) {
      return true;
    }
    
    return false;
  }

  /**
   * Formats phone number to dialable format
   * Ensures proper formatting for tel: URI
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all spaces, dashes, and parentheses
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure it starts with + for international format if it's a country code
    if (!formatted.startsWith('+') && formatted.startsWith('63') && formatted.length === 12) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }

  /**
   * Automatically initiates a phone call to the specified number
   * Opens dialer with pre-filled number - user presses call button manually
   * @param phoneNumber - The phone number to call
   * @param prompt - Deprecated parameter (kept for API compatibility)
   * @returns PhoneCallResult with success status and any error messages
   */
  static async makePhoneCall(
    phoneNumber: string, 
    prompt: boolean = false
  ): Promise<PhoneCallResult> {
    try {
      console.log('📞 Attempting to call:', phoneNumber);

      // Step 1: Validate phone number
      if (!phoneNumber || phoneNumber.trim() === '') {
        return {
          success: false,
          error: 'Phone number is required',
        };
      }

      const trimmedNumber = phoneNumber.trim();
      
      if (!this.validatePhoneNumber(trimmedNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Please provide a valid phone number.',
        };
      }

      // Step 2: Format the phone number
      const formattedNumber = this.formatPhoneNumber(trimmedNumber);
      console.log('📞 Formatted number:', formattedNumber);

      // Step 3: Open dialer with number (more reliable approach)
      // This opens the phone's dialer with the number pre-filled
      // User just needs to press the call button
      const url = `tel:${formattedNumber}`;
      
      console.log('📞 Opening dialer with number...');
      await Linking.openURL(url);

      console.log('📞 Dialer opened successfully');
      
      return {
        success: true,
        message: 'Dialer opened successfully',
      };

    } catch (error: any) {
      console.error('📞 Error opening dialer:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to open phone dialer';
      
      if (error.message) {
        if (error.message.includes('not supported')) {
          errorMessage = 'Phone calls are not supported on this device.';
        } else {
          errorMessage = `Failed to open dialer: ${error.message}`;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Makes a phone call with user confirmation dialog
   * Shows a custom alert before opening the dialer
   * @param phoneNumber - The phone number to call
   * @param contactName - Optional name to display in confirmation
   * @returns Promise that resolves to PhoneCallResult
   */
  static async makePhoneCallWithConfirmation(
    phoneNumber: string,
    contactName?: string
  ): Promise<PhoneCallResult> {
    return new Promise((resolve) => {
      const displayName = contactName || phoneNumber;
      
      Alert.alert(
        'Call Local Authorities',
        `Do you want to call ${displayName}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              resolve({
                success: false,
                error: 'Call cancelled by user',
              });
            },
          },
          {
            text: 'Call',
            onPress: async () => {
              const result = await this.makePhoneCall(phoneNumber);
              resolve(result);
            },
          },
        ],
        { cancelable: true }
      );
    });
  }

  /**
   * Attempts auto-dial with permission (Android only)
   * This tries to make the call automatically but may not work on all devices
   * Falls back to dialer if it fails
   * @param phoneNumber - Emergency number to call
   * @returns PhoneCallResult
   */
  static async makeAutoDialCall(phoneNumber: string): Promise<PhoneCallResult> {
    console.log('🚨 Attempting auto-dial');
    
    try {
      // Only attempt auto-dial on Android
      if (Platform.OS !== 'android') {
        console.log('📞 iOS detected, using dialer');
        return await this.makePhoneCall(phoneNumber);
      }

      // Check and request permission
      const hasPermission = await this.hasCallPermission();
      
      if (!hasPermission) {
        console.log('📞 Requesting call permission for auto-dial...');
        const granted = await this.requestCallPermission();
        
        if (!granted) {
          console.log('📞 Permission denied, falling back to dialer');
          return await this.makePhoneCall(phoneNumber);
        }
      }

      // Validate and format
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('📞 Auto-dialing:', formattedNumber);

      // Try auto-dial
      RNImmediatePhoneCall({
        number: formattedNumber,
        prompt: false,
      });

      return {
        success: true,
        message: 'Auto-dial initiated',
      };
    } catch (error: any) {
      console.error('📞 Auto-dial failed, falling back to dialer:', error);
      // If auto-dial fails, fall back to regular dialer
      return await this.makePhoneCall(phoneNumber);
    }
  }

  /**
   * Emergency call function - opens dialer immediately
   * Use this for emergency numbers (PNP, Barangay hotlines)
   * @param phoneNumber - Emergency number to call
   * @returns PhoneCallResult
   */
  static async makeEmergencyCall(phoneNumber: string): Promise<PhoneCallResult> {
    console.log('🚨 Emergency call initiated');
    return this.makePhoneCall(phoneNumber);
  }

  /**
   * Validates multiple phone numbers at once
   * Useful for validating a list of contacts
   * @param phoneNumbers - Array of phone numbers to validate
   * @returns Object with validation results for each number
   */
  static validateMultipleNumbers(phoneNumbers: string[]): Record<string, boolean> {
    const results: Record<string, boolean> = {};
    
    phoneNumbers.forEach((number) => {
      results[number] = this.validatePhoneNumber(number);
    });
    
    return results;
  }

  /**
   * Opens phone dialer with pre-filled number (doesn't auto-dial)
   * User still needs to press call button
   * @param phoneNumber - The phone number to pre-fill
   * @returns PhoneCallResult
   */
  static async openDialer(phoneNumber: string): Promise<PhoneCallResult> {
    try {
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format',
        };
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const url = `tel:${formattedNumber}`;
      
      // Try to open the dialer directly - let it fail naturally if not supported
      await Linking.openURL(url);
      
      return {
        success: true,
        message: 'Dialer opened successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to open dialer',
      };
    }
  }

  /**
   * Gets the appropriate error message for display to users
   * @param error - The error object or message
   * @returns User-friendly error message
   */
  static getErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('permission')) {
        return 'Phone permission denied. Please enable phone permissions in Settings.';
      }
      if (message.includes('not supported') || message.includes('cannot')) {
        return 'Phone calls are not available on this device.';
      }
      if (message.includes('invalid')) {
        return 'The phone number format is invalid.';
      }
      
      return error.message;
    }
    
    return 'An unexpected error occurred while making the call.';
  }
}
