import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import LocationService, { LocationCoords } from '../services/LocationService';

const LocationIcon = ({ size = 20, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="2"
    />
    <Path
      d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface LocationButtonProps {
  onLocationUpdate?: (location: LocationCoords) => void;
  style?: any;
  size?: number;
  color?: string;
  showLoading?: boolean;
}

const LocationButton: React.FC<LocationButtonProps> = ({
  onLocationUpdate,
  style,
  size = 20,
  color = "#6B7280",
  showLoading = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const locationService = LocationService.getInstance();

  const handlePress = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const location = await locationService.getCurrentLocation();
      
      if (location) {
        onLocationUpdate?.(location);
        Alert.alert(
          'Location Updated',
          `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check location permissions and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'An error occurred while getting your location.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading && showLoading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <LocationIcon size={size} color={color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default LocationButton;