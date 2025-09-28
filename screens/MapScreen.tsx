import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { WebView } from 'react-native-webview';
import LocationService, { LocationCoords } from '../services/LocationService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');



// Map Component using Leaflet in WebView
const MapView = ({ userLocation }: { userLocation: LocationCoords | null }) => {
  const mapWidth = screenWidth;
  const mapHeight = screenHeight - 200; // Account for header and bottom nav

  // Use user location if available, otherwise default to Bulacan
  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [14.7942, 120.8781];

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>ReportIT Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            #map { height: 100vh; width: 100vw; }
            /* Hide zoom controls */
            .leaflet-control-zoom {
                display: none !important;
            }
            /* Hide attribution/watermark */
            .leaflet-control-attribution {
                display: none !important;
            }
            .leaflet-popup-content-wrapper {
                border-radius: 12px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
            }
            .leaflet-popup-tip {
                box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            }
            .custom-user-icon {
                border: none !important;
                background: transparent !important;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            // Initialize map with dynamic center location
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([${mapCenter[0]}, ${mapCenter[1]}], 15);

            // Add OpenStreetMap tiles
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: ''
            }).addTo(map);

            // Font Awesome pin icon for user location
            var userIcon = L.divIcon({
                html: '<i class="fa fa-map-marker" style="font-size: 24px; color: #EF4444; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                className: 'custom-user-pin'
            });

            // User location marker (only show if location is available)
            ${userLocation ? `
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                .addTo(map)
                .bindPopup('<div style="font-weight: bold; color: #EF4444;">Your Current Location</div>');
            ` : ''}

            // Disable scroll zoom initially to prevent conflicts with app scrolling
            map.scrollWheelZoom.disable();
            
            // Enable zoom on tap
            map.on('focus', function() { map.scrollWheelZoom.enable(); });
            map.on('blur', function() { map.scrollWheelZoom.disable(); });
        </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: leafletHTML }}
      style={{ width: mapWidth, height: mapHeight }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      scrollEnabled={false}
      bounces={false}
      onLoadEnd={() => console.log('Map loaded')}
    />
  );
};

interface MapScreenProps {
  navigation: any;
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Request location permission and get current location on component mount
  useEffect(() => {
    if (!fontsLoaded) return;
    
    const locationService = LocationService.getInstance();
    const initializeLocation = async () => {
      try {
        const permission = await locationService.requestLocationPermission();
        setLocationPermissionGranted(permission.granted);

        if (permission.granted) {
          const location = await locationService.getCurrentLocation();
          if (location) {
            setUserLocation(location);
          }
        }
      } catch (error) {
        console.error('Error initializing location:', error);
      }
    };

    initializeLocation();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Handle location button press (crosshair button)
  const handleLocationPress = async () => {
    try {
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        // You could also update the map center here by sending a message to the WebView
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check location permissions.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <FontAwesome name="bars" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={13} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView userLocation={userLocation} />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleLocationPress}>
          <FontAwesome name="crosshairs" size={22} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabDanger]}>
          <FontAwesome name="exclamation-triangle" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <FontAwesome name="exclamation-triangle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('IncidentAnalysis')}
        >
          <FontAwesome name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#EF4444',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  headerStatus: {
    alignItems: 'flex-end',
  },
  locationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationStatusText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  searchContainer: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    gap: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDanger: {
    backgroundColor: '#EF4444',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 20,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  navItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default MapScreen;