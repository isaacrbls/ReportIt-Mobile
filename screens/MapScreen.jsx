import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Dimensions, 
  Alert,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  MapPinIcon,
  XMarkIcon,
  HomeIcon,
  UserIcon as ProfileIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from 'react-native-heroicons/outline';
import { 
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon,
  ChartBarIcon as ChartBarSolidIcon
} from 'react-native-heroicons/solid';
import WebView from 'react-native-webview';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const webViewRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Default location (Malolos, Bulacan based on your image)
  const defaultLocation = { latitude: 14.8432, longitude: 120.8126 };
  const mapCenter = currentLocation || defaultLocation;

  // Risk zones data matching your image
  const riskZones = [
    {
      id: 1,
      lat: 14.8448,
      lng: 120.8115,
      radius: 350,
      color: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.4)',
      riskLevel: 'high',
      title: 'High Risk Zone',
      incidents: 15
    },
    {
      id: 2,
      lat: 14.8425,
      lng: 120.8145,
      radius: 200,
      color: '#F59E0B',
      fillColor: 'rgba(245, 158, 11, 0.3)',
      riskLevel: 'medium',
      title: 'Medium Risk Zone',
      incidents: 8
    },
    {
      id: 3,
      lat: 14.8410,
      lng: 120.8105,
      radius: 180,
      color: '#FCD34D',
      fillColor: 'rgba(252, 211, 77, 0.3)',
      riskLevel: 'low',
      title: 'Low Risk Zone',
      incidents: 2
    }
  ];

  // Incident markers
  const incidents = [
    {
      id: 1,
      lat: 14.8445,
      lng: 120.8118,
      type: 'theft',
      severity: 'high',
      time: '2 hours ago',
      icon: '!'
    },
    {
      id: 2,
      lat: 14.8420,
      lng: 120.8140,
      type: 'robbery',
      severity: 'medium',
      time: '5 hours ago',
      icon: '!'
    },
    {
      id: 3,
      lat: 14.8415,
      lng: 120.8110,
      type: 'suspicious',
      severity: 'low',
      time: '1 day ago',
      icon: '!'
    }
  ];

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Location error:', error);
    } finally {
      setIsLocating(false);
    }
  };

  const generateMapHTML = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map { 
                height: 100vh; 
                width: 100vw; 
            }
            .custom-div-icon {
                background: transparent;
                border: none;
            }
            .risk-marker {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: white;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 3px solid white;
            }
            .risk-high { background: #EF4444; }
            .risk-medium { background: #F59E0B; }
            .risk-low { background: #22C55E; }
            .user-location {
                width: 20px;
                height: 20px;
                background: #3B82F6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            .leaflet-popup-content-wrapper {
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .leaflet-popup-content {
                margin: 12px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Initialize map
            var map = L.map('map', {
                zoomControl: false,
                attributionControl: false
            }).setView([${mapCenter.latitude}, ${mapCenter.longitude}], 16);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '',
                maxZoom: 19
            }).addTo(map);

            // Add risk zones
            ${riskZones.map(zone => `
            var riskZone${zone.id} = L.circle([${zone.lat}, ${zone.lng}], {
                color: '${zone.color}',
                fillColor: '${zone.fillColor}',
                fillOpacity: 0.6,
                radius: ${zone.radius},
                weight: 2
            }).addTo(map);
            
            riskZone${zone.id}.bindPopup(\`
                <div style="text-align: center;">
                    <strong>${zone.title}</strong><br>
                    <span style="color: ${zone.color};">●</span> ${zone.riskLevel.toUpperCase()} RISK<br>
                    ${zone.incidents} incidents this week
                </div>
            \`);
            `).join('')}

            // Add incident markers
            ${incidents.map(incident => {
              const color = incident.severity === 'high' ? '#EF4444' : 
                           incident.severity === 'medium' ? '#F59E0B' : '#22C55E';
              return `
              var incidentIcon${incident.id} = L.divIcon({
                  html: '<div class="risk-marker risk-${incident.severity}">${incident.icon}</div>',
                  className: 'custom-div-icon',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
              });
              
              L.marker([${incident.lat}, ${incident.lng}], { 
                  icon: incidentIcon${incident.id} 
              }).addTo(map)
                .bindPopup(\`
                    <div style="text-align: center; min-width: 120px;">
                        <strong style="color: ${color};">${incident.type.toUpperCase()}</strong><br>
                        <span style="color: #666; font-size: 12px;">${incident.time}</span><br>
                        <span style="color: ${color}; font-size: 12px;">●</span> ${incident.severity} priority
                    </div>
                \`);
              `;
            }).join('')}

            // Add user location if available
            ${currentLocation ? `
            var userIcon = L.divIcon({
                html: '<div class="user-location"></div>',
                className: 'custom-div-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], { 
                icon: userIcon 
            }).addTo(map)
              .bindPopup('<div style="text-align: center;"><strong>Your Location</strong></div>');
            ` : ''}

            // Disable scroll zoom initially
            map.scrollWheelZoom.disable();
            
            // Enable zoom on click
            map.on('focus', function() { map.scrollWheelZoom.enable(); });
            map.on('blur', function() { map.scrollWheelZoom.disable(); });
        </script>
    </body>
    </html>
    `;
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      Alert.alert('Search', `Searching for: ${searchText}`);
    }
  };

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMenuItemPress = (item) => {
    setIsMenuVisible(false);
    switch (item) {
      case 'home':
        navigation.navigate('Welcome');
        break;
      case 'profile':
        Alert.alert('Profile', 'Profile feature coming soon');
        break;
      case 'settings':
        Alert.alert('Settings', 'Settings feature coming soon');
        break;
      case 'logout':
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', onPress: () => navigation.navigate('Welcome') }
        ]);
        break;
      default:
        break;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header with Hamburger Menu */}
      <View style={{ backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20, paddingVertical: 16, paddingTop: 50 }}>
        <TouchableOpacity 
          style={{ padding: 8 }}
          onPress={toggleMenu}
        >
          <Bars3Icon size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Map - Full Screen */}
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ html: generateMapHTML() }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={false}
          scrollEnabled={false}
          onError={(error) => console.log('WebView error:', error)}
        />

        {/* Search Bar - Floating Over Map */}
        <View style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 1000 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: 'white', 
            borderRadius: 25, 
            paddingHorizontal: 20, 
            paddingVertical: 16, 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8
          }}>
            <MagnifyingGlassIcon size={20} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#374151' }}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Floating UI Elements */}
        {/* Get Location Button - Bottom Right (Red Circle with Target) */}
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            bottom: 120, 
            right: 20, 
            width: 56, 
            height: 56, 
            borderRadius: 28, 
            backgroundColor: '#EF4444', 
            justifyContent: 'center', 
            alignItems: 'center', 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.25, 
            shadowRadius: 8,
            elevation: 8
          }}
          onPress={getCurrentLocation}
          disabled={isLocating}
        >
          {/* Target/Crosshair Icon */}
          <View style={{ 
            width: 24, 
            height: 24, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: 'white'
            }} />
            <View style={{ 
              position: 'absolute',
              width: 2, 
              height: 24, 
              backgroundColor: 'white'
            }} />
            <View style={{ 
              position: 'absolute',
              width: 24, 
              height: 2, 
              backgroundColor: 'white'
            }} />
          </View>
        </TouchableOpacity>

        {/* Emergency Alert Button - Bottom Right, Above Location (White Square) */}
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            bottom: 190, 
            right: 20, 
            width: 56, 
            height: 56, 
            borderRadius: 8, 
            backgroundColor: 'white', 
            justifyContent: 'center', 
            alignItems: 'center', 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.25, 
            shadowRadius: 8,
            elevation: 8
          }}
          onPress={() => Alert.alert('Alert', 'Emergency alert feature')}
        >
          <ExclamationTriangleIcon size={28} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Bottom Red Navigation Bar */}
      <View style={{ backgroundColor: '#EF4444', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 }}>
        <TouchableOpacity 
          style={{ 
            flex: 1,
            justifyContent: 'center', 
            alignItems: 'center',
            paddingVertical: 8
          }}
          onPress={() => Alert.alert('Report', 'Report incident feature')}
        >
          <ExclamationTriangleSolidIcon size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ 
            flex: 1,
            justifyContent: 'center', 
            alignItems: 'center',
            paddingVertical: 8
          }}
          onPress={() => navigation.navigate('IncidentAnalysis')}
        >
          <ChartBarSolidIcon size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Hamburger Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-start' }}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={{ backgroundColor: 'white', width: 280, height: '100%', paddingTop: 50, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                <XMarkIcon size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={{ paddingTop: 16 }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}
                onPress={() => handleMenuItemPress('home')}
              >
                <HomeIcon size={20} color="#6B7280" />
                <Text style={{ fontSize: 16, color: '#374151', marginLeft: 12, fontWeight: '500' }}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}
                onPress={() => handleMenuItemPress('profile')}
              >
                <ProfileIcon size={20} color="#6B7280" />
                <Text style={{ fontSize: 16, color: '#374151', marginLeft: 12, fontWeight: '500' }}>Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}
                onPress={() => handleMenuItemPress('settings')}
              >
                <Cog6ToothIcon size={20} color="#6B7280" />
                <Text style={{ fontSize: 16, color: '#374151', marginLeft: 12, fontWeight: '500' }}>Settings</Text>
              </TouchableOpacity>
              
              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8, marginHorizontal: 20 }} />
              
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}
                onPress={() => handleMenuItemPress('logout')}
              >
                <ArrowLeftOnRectangleIcon size={20} color="#EF4444" />
                <Text style={{ fontSize: 16, color: '#EF4444', marginLeft: 12, fontWeight: '500' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
