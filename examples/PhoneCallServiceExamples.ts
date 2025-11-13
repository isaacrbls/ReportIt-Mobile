/**
 * PhoneCallService Usage Examples
 * 
 * This file demonstrates all the different ways to use the PhoneCallService
 * for automatic phone calling with permission handling and error management.
 */

import { Alert } from 'react-native';
import { PhoneCallService } from '../services/PhoneCallService';

// ============================================================================
// Example 1: Basic Automatic Call (Recommended for most use cases)
// ============================================================================
export const makeBasicCall = async () => {
  const phoneNumber = '791-0257'; // Malolos PNP
  
  const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
  
  if (result.success) {
    console.log('Call initiated successfully!');
  } else {
    Alert.alert('Call Failed', result.error || 'Unable to make call');
  }
};

// ============================================================================
// Example 2: Call with User Confirmation Dialog
// ============================================================================
export const makeCallWithConfirmation = async () => {
  const phoneNumber = '791-0257';
  const contactName = 'Malolos PNP';
  
  // This will show a confirmation alert before calling
  const result = await PhoneCallService.makePhoneCallWithConfirmation(
    phoneNumber,
    contactName
  );
  
  if (result.success) {
    console.log('✅ Call completed');
  } else if (result.error === 'Call cancelled by user') {
    console.log('User cancelled the call');
  } else {
    Alert.alert('Error', result.error || 'Call failed');
  }
};

// ============================================================================
// Example 3: Emergency Call (No prompt on Android)
// ============================================================================
export const makeEmergencyCall = async () => {
  // For emergency numbers like 911, PNP hotlines, etc.
  // This attempts to dial immediately without prompts (Android only)
  // iOS will always show system confirmation for security
  
  const result = await PhoneCallService.makeEmergencyCall('791-0257');
  
  if (!result.success) {
    Alert.alert('Emergency Call Failed', result.error || 'Please dial manually');
  }
};

// ============================================================================
// Example 4: Call with Full Error Handling and Fallback
// ============================================================================
export const makeCallWithFallback = async (phoneNumber: string, label: string) => {
  console.log(`Attempting to call ${label}...`);
  
  // First attempt: Auto-dial
  const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
  
  if (result.success) {
    console.log('Call initiated successfully');
    return;
  }
  
  // If auto-dial failed, offer fallback options
  Alert.alert(
    'Unable to Make Call',
    result.error || 'Failed to initiate call',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Dialer',
        onPress: async () => {
          // Fallback: Open dialer with pre-filled number
          const dialerResult = await PhoneCallService.openDialer(phoneNumber);
          
          if (!dialerResult.success) {
            // Last resort: Show number to user
            Alert.alert(
              'Phone Number',
              `Please dial manually:\n\n${phoneNumber}`,
              [{ text: 'OK' }]
            );
          }
        }
      }
    ]
  );
};

// ============================================================================
// Example 5: Validate Phone Numbers Before Calling
// ============================================================================
export const validateAndCall = async (phoneNumber: string) => {
  // Create an array of numbers to validate
  const numbers = [phoneNumber];
  
  // Validate all numbers
  const validationResults = PhoneCallService.validateMultipleNumbers(numbers);
  
  if (validationResults[phoneNumber]) {
    console.log('✅ Phone number is valid');
    
    // Proceed with the call
    const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
    
    if (result.success) {
      console.log('Call initiated');
    } else {
      Alert.alert('Call Failed', result.error || 'Unknown error');
    }
  } else {
    Alert.alert(
      'Invalid Number',
      'The phone number format is invalid. Please check and try again.'
    );
  }
};

// ============================================================================
// Example 6: Call List of Authorities (From Emergency Modal)
// ============================================================================
export const callFromEmergencyList = async (
  authority: 'pnp' | 'barangay',
  barangayName?: string
) => {
  const emergencyNumbers = {
    pnp: { number: '791-0257', label: 'Malolos PNP' },
    mojon: { number: '816-7602', label: 'Barangay Mojon' },
    pinagbakahan: { number: '790-6090', label: 'Barangay Pinagbakahan' },
    bulihan: { number: '893-9529', label: 'Barangay Bulihan' },
    dakila: { number: '794-4569', label: 'Barangay Dakila' },
    look1st: { number: '662-2464', label: 'Barangay Look 1st' },
  };
  
  let contact;
  
  if (authority === 'pnp') {
    contact = emergencyNumbers.pnp;
  } else if (barangayName) {
    const key = barangayName.toLowerCase().replace(/\s+/g, '') as keyof typeof emergencyNumbers;
    contact = emergencyNumbers[key];
  }
  
  if (!contact) {
    Alert.alert('Error', 'Emergency contact not found');
    return;
  }
  
  console.log(`📞 Calling ${contact.label}...`);
  
  const result = await PhoneCallService.makePhoneCall(contact.number, false);
  
  if (!result.success) {
    // Show error with copy number option
    Alert.alert(
      'Call Failed',
      `${result.error}\n\nPhone: ${contact.number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Try Again',
          onPress: () => PhoneCallService.openDialer(contact.number)
        }
      ]
    );
  }
};

// ============================================================================
// Example 7: Handle Call in React Native Component
// ============================================================================
export const ComponentExample = () => {
  /*
  import React from 'react';
  import { TouchableOpacity, Text, Alert } from 'react-native';
  import { PhoneCallService } from '../services/PhoneCallService';
  
  const EmergencyButton = () => {
    const handleEmergencyCall = async () => {
      const result = await PhoneCallService.makePhoneCall('791-0257', false);
      
      if (!result.success) {
        Alert.alert('Call Error', result.error || 'Failed to make call');
      }
    };
    
    return (
      <TouchableOpacity onPress={handleEmergencyCall}>
        <Text>Call Emergency Services</Text>
      </TouchableOpacity>
    );
  };
  */
};

// ============================================================================
// Example 8: International Numbers
// ============================================================================
export const makeInternationalCall = async () => {
  // International format with country code
  const phoneNumber = '+639171234567'; // Philippine mobile number
  
  const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
  
  if (result.success) {
    console.log('International call initiated');
  } else {
    Alert.alert('Call Failed', result.error || 'Unable to make call');
  }
};

// ============================================================================
// Example 9: Batch Validate Multiple Numbers
// ============================================================================
export const validateEmergencyNumbers = () => {
  const emergencyContacts = [
    '791-0257',      // Malolos PNP
    '816-7602',      // Barangay Mojon
    '790-6090',      // Barangay Pinagbakahan
    '911',           // Emergency
    '+639171234567', // Mobile
  ];
  
  const results = PhoneCallService.validateMultipleNumbers(emergencyContacts);
  
  console.log('Validation Results:');
  Object.entries(results).forEach(([number, isValid]) => {
    console.log(`${number}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
  });
  
  return results;
};

// ============================================================================
// Example 10: Handle Different Error Types
// ============================================================================
export const handleCallErrors = async (phoneNumber: string) => {
  const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
  
  if (!result.success) {
    // Get user-friendly error message
    const errorMessage = PhoneCallService.getErrorMessage(result.error);
    
    // Handle different error scenarios
    if (errorMessage.includes('permission')) {
      Alert.alert(
        'Permission Required',
        'Please enable phone permissions in Settings to make calls.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {
            // Open device settings (implement based on platform)
            console.log('Opening device settings...');
          }}
        ]
      );
    } else if (errorMessage.includes('not supported')) {
      Alert.alert(
        'Not Supported',
        'Your device cannot make phone calls. Please use a device with calling capability.'
      );
    } else if (errorMessage.includes('invalid')) {
      Alert.alert(
        'Invalid Number',
        'Please check the phone number format and try again.'
      );
    } else {
      Alert.alert('Error', errorMessage);
    }
  }
};

// ============================================================================
// Example 11: Integration with MapScreen Emergency Modal
// ============================================================================
export const mapScreenIntegration = async (phoneNumber: string, label: string) => {
  console.log(`📞 Initiating call to ${label} (${phoneNumber})`);
  
  const result = await PhoneCallService.makePhoneCall(phoneNumber, false);
  
  if (result.success) {
    console.log('✅ Call initiated successfully');
    // Close modal after successful call initiation
    // setIsEmergencyCallModalVisible(false);
    return true;
  } else {
    console.error('❌ Call failed:', result.error);
    
    Alert.alert(
      'Unable to Make Call',
      result.error || 'Failed to initiate call. Would you like to open the dialer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Dialer',
          onPress: async () => {
            const dialerResult = await PhoneCallService.openDialer(phoneNumber);
            if (dialerResult.success) {
              // setIsEmergencyCallModalVisible(false);
              return true;
            }
            return false;
          }
        }
      ]
    );
    return false;
  }
};

// ============================================================================
// Export all examples
// ============================================================================
export const PhoneCallExamples = {
  makeBasicCall,
  makeCallWithConfirmation,
  makeEmergencyCall,
  makeCallWithFallback,
  validateAndCall,
  callFromEmergencyList,
  makeInternationalCall,
  validateEmergencyNumbers,
  handleCallErrors,
  mapScreenIntegration,
};
