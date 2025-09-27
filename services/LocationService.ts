import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationCoords | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  public async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      
      if (existingStatus === 'granted') {
        return {
          granted: true,
          canAskAgain: true,
          status: existingStatus
        };
      }

      // Request permission if not granted
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      
      const result: LocationPermissionStatus = {
        granted: status === 'granted',
        canAskAgain,
        status
      };

      // Show appropriate message based on result
      if (!result.granted) {
        this.showPermissionDeniedAlert(result.canAskAgain);
      }

      return result;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Get current location with permission check
   */
  public async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      // First check/request permissions
      const permissionResult = await this.requestLocationPermission();
      
      if (!permissionResult.granted) {
        console.log('Location permission not granted');
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 1,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings and try again.',
        [{ text: 'OK' }]
      );
      return null;
    }
  }

  /**
   * Watch location changes (for real-time tracking)
   */
  public async watchLocation(
    callback: (location: LocationCoords) => void
  ): Promise<Location.LocationSubscription | null> {
    try {
      const permissionResult = await this.requestLocationPermission();
      
      if (!permissionResult.granted) {
        return null;
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
            accuracy: location.coords.accuracy || undefined,
          };
          this.currentLocation = coords;
          callback(coords);
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  /**
   * Get cached location (if available)
   */
  public getCachedLocation(): LocationCoords | null {
    return this.currentLocation;
  }

  /**
   * Check if location services are enabled
   */
  public async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Show alert when permission is denied
   */
  private showPermissionDeniedAlert(canAskAgain: boolean): void {
    const title = 'Location Permission Required';
    const message = canAskAgain
      ? 'ReportIt needs location access to show nearby incidents and help you report incidents at your current location. Please grant location permission.'
      : 'Location permission has been permanently denied. Please enable it in your device settings to use location features.';

    const buttons = canAskAgain
      ? [
          { text: 'Cancel', style: 'cancel' as const },
          { text: 'Grant Permission', onPress: () => this.requestLocationPermission() }
        ]
      : [
          { text: 'Cancel', style: 'cancel' as const },
          { text: 'Open Settings', onPress: () => this.openAppSettings() }
        ];

    Alert.alert(title, message, buttons);
  }

  /**
   * Open app settings (for when permission is permanently denied)
   */
  private openAppSettings(): void {
    if (Platform.OS === 'ios') {
      // On iOS, we can't directly open app settings, but we can show instructions
      Alert.alert(
        'Enable Location',
        'Go to Settings > Privacy & Security > Location Services > ReportIt and select "While Using App"',
        [{ text: 'OK' }]
      );
    } else {
      // On Android, we could use Linking to open settings, but it's not straightforward
      Alert.alert(
        'Enable Location',
        'Go to Settings > Apps > ReportIt > Permissions and enable Location',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Calculate distance between two points (in meters)
   */
  public static calculateDistance(
    point1: LocationCoords,
    point2: LocationCoords
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export default LocationService;