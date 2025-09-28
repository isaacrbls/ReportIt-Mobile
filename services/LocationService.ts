import * as Location from 'expo-location';

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

  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      const permissionResult = await this.requestLocationPermission();
      if (!permissionResult.granted) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
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

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
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