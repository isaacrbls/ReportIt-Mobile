import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationPermissionResponse {
  granted: boolean;
  status?: Location.PermissionStatus;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationCoords | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestLocationPermission(): Promise<LocationPermissionResponse> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return {
        granted: status === Location.PermissionStatus.GRANTED,
        status: status,
      };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { granted: false };
    }
  }

  async isLocationEnabled(): Promise<boolean> {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      return enabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Prompts user to enable location services in device settings
   */
  private promptEnableLocationServices(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your device settings to use location features.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Prompts user to grant location permission in device settings
   */
  private promptGrantLocationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Location Permission Required',
        'ReportIt needs location access to provide accurate risk assessments. Please allow location access in your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      // First check if location services are enabled
      const servicesEnabled = await this.isLocationEnabled();
      if (!servicesEnabled) {
        console.warn('⚠️ Location services are disabled');
        await this.promptEnableLocationServices();
        return null;
      }

      const permissionResult = await this.requestLocationPermission();
      if (!permissionResult.granted) {
        console.warn('⚠️ Location permission not granted:', permissionResult.status);
        await this.promptGrantLocationPermission();
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
        altitude: location.coords.altitude ?? undefined,
        altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
        heading: location.coords.heading ?? undefined,
        speed: location.coords.speed ?? undefined,
      };

      console.log('✅ Location retrieved successfully:', this.currentLocation.latitude, this.currentLocation.longitude);
      return this.currentLocation;
    } catch (error: any) {
      console.error('❌ Error getting current location:', error.message || error);
      
      // Show a generic error alert for unexpected errors
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again.',
        [{ text: 'OK' }]
      );
      
      return null;
    }
  }

  async watchPosition(
    callback: (location: LocationCoords) => void,
    errorCallback?: (error: Error) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const permissionResult = await this.requestLocationPermission();
      if (!permissionResult.granted) {
        throw new Error('Location permission not granted');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const coords: LocationCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
          };
          this.currentLocation = coords;
          callback(coords);
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching position:', error);
      if (errorCallback) {
        errorCallback(error as Error);
      }
      return null;
    }
  }

  getCachedLocation(): LocationCoords | null {
    return this.currentLocation;
  }
}

export default LocationService;