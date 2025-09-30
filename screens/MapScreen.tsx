import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  Image,
  Animated,
} from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { WebView } from 'react-native-webview';
import LocationService, { LocationCoords } from '../services/LocationService';
import { ReportsService, Report, Hotspot } from '../services/ReportsService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MapView = ({ userLocation, reports, hotspots }: { userLocation: LocationCoords | null; reports: Report[]; hotspots: Hotspot[] }) => {
  const mapWidth = screenWidth;
  const mapHeight = screenHeight - 200;

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

            // Custom ReportIT pin with exclamation point
            var reportIcon = L.divIcon({
                html: '<div style="position: relative; width: 32px; height: 40px;"><div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B35, #EF4444); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">!</div></div></div>',
                iconSize: [32, 40],
                iconAnchor: [16, 35],
                className: 'custom-reportit-pin'
            });

            // User location marker (only show if location is available)
            ${userLocation ? `
            L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                .addTo(map)
                .bindPopup('<div style="font-weight: bold; color: #EF4444;">Your Current Location</div>');
            ` : ''}

            // Add report markers
            ${reports.map(report => `
            L.marker([${report.geoLocation.latitude}, ${report.geoLocation.longitude}], {icon: reportIcon})
                .addTo(map)
                .bindPopup(\`
                    <div style="max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 4px;">
                        <div style="font-weight: bold; color: #FF6B35; font-size: 14px; margin-bottom: 12px; border-bottom: 2px solid #FF6B35; padding-bottom: 6px;">
                            📍 ${report.incidentType || 'Incident Report'}
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong>🏘️ Barangay:</strong> <span style="color: #666;">${report.barangay || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong>📅 Date & Time:</strong> <span style="color: #666;">${report.dateTime ? new Date(report.dateTime).toLocaleString() : 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong>🚨 Incident Type:</strong> <span style="color: #666;">${report.incidentType || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong>📊 Status:</strong> 
                                <span style="
                                    color: white; 
                                    background-color: ${report.status === 'Verified' ? '#22C55E' : report.status === 'Pending' ? '#F59E0B' : '#EF4444'}; 
                                    padding: 2px 6px; 
                                    border-radius: 10px; 
                                    font-size: 11px;
                                    margin-left: 4px;
                                ">${report.status || 'Unknown'}</span>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #E5E7EB; padding-top: 8px;">
                            <div style="font-size: 11px; color: #333; margin-bottom: 3px;"><strong>📝 Description:</strong></div>
                            <div style="font-size: 11px; color: #666; line-height: 1.4; max-height: 60px; overflow-y: auto;">
                                ${report.description || 'No description available'}
                            </div>
                        </div>
                        
                        ${report.submittedByEmail ? `
                        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #E5E7EB;">
                            <div style="font-size: 10px; color: #999;">Reported by: ${report.submittedByEmail}</div>
                        </div>
                        ` : ''}
                    </div>
                \`);
            `).join('')}

            // Add hotspot circles
            ${hotspots.map(hotspot => `
            L.circle([${hotspot.lat}, ${hotspot.lng}], {
                color: '${hotspot.riskLevel === 'high' ? '#DC2626' : hotspot.riskLevel === 'medium' ? '#F59E0B' : '#10B981'}',
                fillColor: '${hotspot.riskLevel === 'high' ? '#DC2626' : hotspot.riskLevel === 'medium' ? '#F59E0B' : '#10B981'}',
                fillOpacity: 0.2,
                weight: 3,
                radius: ${hotspot.radius}
            }).addTo(map)
                .bindPopup(\`
                    <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 4px;">
                        <div style="font-weight: bold; color: ${hotspot.riskLevel === 'high' ? '#DC2626' : hotspot.riskLevel === 'medium' ? '#F59E0B' : '#10B981'}; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            🔥 ${hotspot.riskLevel.toUpperCase()} RISK HOTSPOT
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                            <strong>📍 Location:</strong> ${hotspot.barangay || 'Multiple Areas'}
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                            <strong>📊 Incident Count:</strong> ${hotspot.incidentCount} verified reports
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 6px;">
                            <strong>⚠️ Risk Level:</strong> 
                            <span style="
                                background: ${hotspot.riskLevel === 'high' ? '#DC2626' : hotspot.riskLevel === 'medium' ? '#F59E0B' : '#10B981'}; 
                                color: white; 
                                padding: 2px 6px; 
                                border-radius: 8px; 
                                font-size: 10px; 
                                margin-left: 4px;
                            ">${hotspot.riskLevel.toUpperCase()}</span>
                        </div>
                        <div style="font-size: 11px; color: #666; border-top: 1px solid #E5E7EB; padding-top: 6px;">
                            This area has multiple verified incidents clustered together. Exercise caution when in this vicinity.
                        </div>
                    </div>
                \`);
            `).join('')}

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLocationPermissionModalVisible, setIsLocationPermissionModalVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;

  // Function to fetch reports from Firestore
  const fetchReports = async () => {
    setIsLoadingReports(true);
    console.log('Starting to fetch reports from Firestore...');
    try {
      const result = await ReportsService.getAllReports();
      if (result.success && result.data) {
        setReports(result.data);
        console.log(`✅ Successfully loaded ${result.data.length} reports from Firestore`);
        
        // Log sample report for debugging with all requested fields
        if (result.data.length > 0) {
          const sample = result.data[0];
          console.log('📋 Sample Report Details:', {
            id: sample.id,
            barangay: sample.barangay,
            dateTime: sample.dateTime,
            description: sample.description,
            incidentType: sample.incidentType,
            status: sample.status,
            coordinates: `${sample.geoLocation.latitude}, ${sample.geoLocation.longitude}`,
            submittedBy: sample.submittedByEmail
          });
        }
        
        // Show summary of all reports
        const reportsWithAllFields = result.data.filter(r => 
          r.barangay && r.dateTime && r.description && r.incidentType && r.status
        );
        console.log(`📊 Reports with complete data: ${reportsWithAllFields.length}/${result.data.length}`);
      } else {
        console.error('❌ Failed to fetch reports:', result.error);
        Alert.alert('Error', `Failed to load reports: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Exception while fetching reports:', error);
      Alert.alert('Error', `Failed to load reports: ${error.message}`);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Function to fetch hotspots
  const fetchHotspots = async () => {
    setIsLoadingHotspots(true);
    console.log('🔥 Starting to calculate hotspots...');
    try {
      const result = await ReportsService.calculateHotspots();
      if (result.success && result.data) {
        setHotspots(result.data);
        console.log(`🔥 Successfully calculated ${result.data.length} hotspots`);
      } else {
        console.error('❌ Failed to calculate hotspots:', result.error);
        // Don't show alert for hotspot errors - it's a secondary feature
      }
    } catch (error: any) {
      console.error('❌ Exception while calculating hotspots:', error);
    } finally {
      setIsLoadingHotspots(false);
    }
  };

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
    fetchReports(); // Load reports when component mounts
    fetchHotspots(); // Load hotspots when component mounts
  }, [fontsLoaded]);

  const handleReportPress = async () => {
    const locationPermission = await LocationService.getInstance().requestLocationPermission();
    
    if (!locationPermission.granted) {
      setIsLocationPermissionModalVisible(true);
      return;
    }

    const isLoggedIn = true;
    
    if (!isLoggedIn) {
      navigation.navigate('Login');
      return;
    }

    setIsReportModalVisible(true);
  };

  const handleNotificationPress = () => {
    setIsNotificationModalVisible(true);
  };

  const handleAllowNotifications = () => {
    setIsNotificationModalVisible(false);
  };

  const handleEditProfilePress = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSidebarVisible(false);
      navigation.navigate('EditProfile');
    });
  };

  const handleLocationPermissionRequest = async () => {
    const locationService = LocationService.getInstance();
    const permission = await locationService.requestLocationPermission();
    setLocationPermissionGranted(permission.granted);

    if (permission.granted) {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        setIsLocationPermissionModalVisible(false);
        
        if (isUserLoggedIn) {
          setIsReportModalVisible(true);
        } else {
          navigation.navigate('Login');
        }
      }
    }
  };

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
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            setIsSidebarVisible(true);
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }}
        >
          <FontAwesome name="bars" size={22} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>ReportIT Map</Text>
        
        <View style={styles.headerStatus}>
          <View style={styles.reportsStatus}>
            <Text style={styles.reportsStatusText}>
              {(isLoadingReports || isLoadingHotspots) ? 'Loading...' : `${reports.length} Reports`}
            </Text>
          </View>
          {hotspots.length > 0 && (
            <View style={[styles.reportsStatus, { backgroundColor: 'rgba(255, 107, 53, 0.3)', marginTop: 4 }]}>
              <Text style={styles.reportsStatusText}>
                🔥 {hotspots.length} Hotspots
              </Text>
            </View>
          )}
        </View>
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
        <MapView userLocation={userLocation} reports={reports} hotspots={hotspots} />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, (isLoadingReports || isLoadingHotspots) && styles.fabDisabled]} 
          onPress={() => {
            fetchReports();
            fetchHotspots();
          }}
          disabled={isLoadingReports || isLoadingHotspots}
        >
          <FontAwesome 
            name={(isLoadingReports || isLoadingHotspots) ? "spinner" : "refresh"} 
            size={18} 
            color={(isLoadingReports || isLoadingHotspots) ? "#9CA3AF" : "#6B7280"} 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={handleLocationPress}>
          <FontAwesome name="crosshairs" size={22} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, styles.fabDanger]} onPress={handleReportPress}>
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

      {isSidebarVisible && (
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.sidebar,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <TouchableOpacity style={styles.profileContainer}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/60' }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.profileName}></Text>
              <TouchableOpacity style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Edit profile</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.menuSection}>
              <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Report an Incident</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleNotificationPress}>
                <Text style={styles.menuItemText}>Enable Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleEditProfilePress}>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  Animated.timing(slideAnim, {
                    toValue: -280,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setIsSidebarVisible(false);
                    navigation.navigate('TermsAndConditions');
                  });
                }}
              >
                <Text style={styles.menuItemText}>Terms and Condition</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  Animated.timing(slideAnim, {
                    toValue: -280,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setIsSidebarVisible(false);
                    navigation.navigate('Login');
                  });
                }}
              >
                <Text style={styles.menuItemText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => {
              Animated.timing(slideAnim, {
                toValue: -280,
                duration: 300,
                useNativeDriver: true,
              }).start(() => setIsSidebarVisible(false));
            }}
          />
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isLocationPermissionModalVisible}
        onRequestClose={() => setIsLocationPermissionModalVisible(false)}
      >
        <View style={styles.permissionModalOverlay}>
          <View style={styles.permissionModal}>
            <View style={styles.permissionIcon}>
              <FontAwesome name="map-marker" size={32} color="#EF4444" />
            </View>
            <Text style={styles.permissionTitle}>Location Services</Text>
            <Text style={styles.permissionText}>
              ReportIt needs access to your location to provide accurate risk assessments and alerts in your area.
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity 
                style={styles.notNowButton}
                onPress={() => setIsLocationPermissionModalVisible(false)}
              >
                <Text style={styles.notNowText}>Not now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={handleLocationPermissionRequest}
              >
                <Text style={styles.allowText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isNotificationModalVisible}
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View style={styles.permissionModalOverlay}>
          <View style={styles.permissionModal}>
            <View style={styles.permissionIcon}>
              <FontAwesome name="bell" size={32} color="#EF4444" />
            </View>
            <Text style={styles.permissionTitle}>Notification</Text>
            <Text style={styles.permissionText}>
              Allow ReportIt to use notification access
            </Text>
            <View style={styles.permissionButtons}>
              <TouchableOpacity 
                style={styles.notNowButton}
                onPress={() => setIsNotificationModalVisible(false)}
              >
                <Text style={styles.notNowText}>Not now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={handleAllowNotifications}
              >
                <Text style={styles.allowText}>Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isReportModalVisible}
        onRequestClose={() => setIsReportModalVisible(false)}
      >
        <View style={styles.reportModalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportModalTitle}>Report Form</Text>
            <Text style={styles.reportModalSubtitle}>Detail of report</Text>
            
            <View style={styles.reportForm}>
              <Text style={styles.reportLabel}>Type of incident</Text>
              <TextInput
                style={styles.reportInput}
                value={reportType}
                onChangeText={setReportType}
                placeholder="Enter incident type"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.reportLabel}>Description</Text>
              <TextInput
                style={[styles.reportInput, styles.reportTextArea]}
                value={reportDescription}
                onChangeText={setReportDescription}
                placeholder="Describe the incident"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.reportLabel}>Add Media</Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton}>
                  <View style={styles.mediaIcon}>
                    <FontAwesome name="camera" size={24} color="white" />
                  </View>
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton}>
                  <View style={styles.mediaIcon}>
                    <FontAwesome name="video-camera" size={24} color="white" />
                  </View>
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.reportModalButtons}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setIsReportModalVisible(false)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={() => {
                  setIsReportModalVisible(false);
                  Alert.alert('Success', 'Report submitted successfully');
                }}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  reportsStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  reportsStatusText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
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
  fabDisabled: {
    opacity: 0.6,
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
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#EF4444',
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 1001,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
  },
  editProfileText: {
    color: 'white',
    fontSize: 12,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    color: 'white',
    fontSize: 16,
  },
  permissionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  permissionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  notNowButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  notNowText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  allowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reportModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  reportModalTitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportModalSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  reportForm: {
    marginBottom: 24,
  },
  reportLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  reportTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  mediaIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  reportModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MapScreen;