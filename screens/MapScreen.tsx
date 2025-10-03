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
  ScrollView,
  BackHandler,
} from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import LocationService, { LocationCoords } from '../services/LocationService';
import { ReportsService, Report, Hotspot, CreateReportData } from '../services/ReportsService';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { isReportingAllowed } from '../utils/BulacanBarangays';
import { NavigationHelper } from '../utils/NavigationHelper';
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
        
        <!-- Image Modal for Enlarged View -->
        <div id="imageModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); justify-content: center; align-items: center;" onclick="closeImageModal()">
            <div style="position: relative; max-width: 90%; max-height: 90%; text-align: center;">
                <img id="modalImage" src="" style="max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" onclick="event.stopPropagation()" />
                <div style="position: absolute; top: 10px; right: 20px; color: white; font-size: 30px; font-weight: bold; cursor: pointer; background: rgba(0,0,0,0.5); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;" onclick="closeImageModal()">&times;</div>
            </div>
        </div>
        
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
                            <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i> ${report.incidentType || 'Incident Report'}
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong><i class="fas fa-home" style="margin-right: 4px;"></i> Barangay:</strong> <span style="color: #666;">${report.barangay || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong><i class="fas fa-calendar-alt" style="margin-right: 4px;"></i> Date & Time:</strong> <span style="color: #666;">${report.dateTime ? (() => {
                                    const date = new Date(report.dateTime);
                                    const options = { 
                                        year: 'numeric' as const, 
                                        month: 'long' as const, 
                                        day: 'numeric' as const, 
                                        hour: 'numeric' as const, 
                                        minute: '2-digit' as const, 
                                        second: '2-digit' as const, 
                                        hour12: true, 
                                        timeZone: 'UTC' 
                                    };
                                    return date.toLocaleDateString('en-US', options).replace(/,([^,]*)$/, ' at$1 UTC');
                                })() : 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 8px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong><i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i> Incident Type:</strong> <span style="color: #666;">${report.incidentType || 'Not specified'}</span>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 10px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 3px;">
                                <strong><i class="fas fa-chart-bar" style="margin-right: 4px;"></i> Status:</strong> 
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
                            <div style="font-size: 11px; color: #333; margin-bottom: 3px;"><strong><i class="fas fa-edit" style="margin-right: 4px;"></i> Description:</strong></div>
                            <div style="font-size: 11px; color: #666; line-height: 1.4; max-height: 60px; overflow-y: auto;">
                                ${report.description || 'No description available'}
                            </div>
                        </div>
                        
                        ${report.mediaURL && report.mediaURL.length > 0 ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                            <div style="font-size: 11px; color: #333; margin-bottom: 6px;"><strong><i class="fas fa-camera" style="margin-right: 4px;"></i> Media:</strong></div>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; max-height: 80px; overflow-y: auto;">
                                ${report.mediaURL.split(';').slice(0, 3).map((url, index) => {
                                    const isVideo = url.includes('video') || url.includes('.mp4') || url.includes('.mov');
                                    return `
                                    <div style="position: relative; width: 50px; height: 50px; border-radius: 4px; overflow: hidden; border: 1px solid #E5E7EB; cursor: pointer; transition: transform 0.2s;" 
                                         onclick="${isVideo ? `window.open('${url}', '_blank')` : `openImageModal('${url}')`}"
                                         onmouseover="this.style.transform='scale(1.05)'" 
                                         onmouseout="this.style.transform='scale(1)'">
                                        ${isVideo 
                                            ? `<div style="width: 100%; height: 100%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; color: #666;">
                                                <i class="fas fa-video" style="font-size: 16px;"></i>
                                               </div>`
                                            : `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" 
                                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                               <div style="display: none; width: 100%; height: 100%; background: #F3F4F6; align-items: center; justify-content: center; color: #666;">
                                                <i class="fas fa-image" style="font-size: 16px;"></i>
                                               </div>`
                                        }
                                    </div>`;
                                }).join('')}
                                ${report.mediaURL.split(';').length > 3 ? `
                                <div style="width: 50px; height: 50px; border-radius: 4px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; border: 1px solid #E5E7EB;">
                                    <span style="font-size: 10px; color: #666;">+${report.mediaURL.split(';').length - 3}</span>
                                </div>` : ''}
                            </div>
                            <div style="font-size: 10px; color: #666; margin-top: 4px;">${report.mediaType || `${report.mediaURL.split(';').length} media file(s)`}</div>
                        </div>
                        ` : ''}
                        
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
                            <i class="fas fa-fire" style="margin-right: 4px;"></i> ${hotspot.riskLevel.toUpperCase()} RISK HOTSPOT
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                            <strong><i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i> Location:</strong> ${hotspot.barangay || 'Multiple Areas'}
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                            <strong><i class="fas fa-chart-bar" style="margin-right: 4px;"></i> Incident Count:</strong> ${hotspot.incidentCount} verified reports
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 6px;">
                            <strong><i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i> Risk Level:</strong> 
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
            
            // Image Modal Functions
            function openImageModal(imageUrl) {
                const modal = document.getElementById('imageModal');
                const modalImg = document.getElementById('modalImage');
                modal.style.display = 'flex';
                modalImg.src = imageUrl;
            }
            
            function closeImageModal() {
                document.getElementById('imageModal').style.display = 'none';
            }
            
            // Close modal on Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeImageModal();
                }
            });
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Media-related state
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  
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

  // Function to check authentication status and load user profile
  const checkAuthenticationStatus = async () => {
    console.log('🔍 Checking authentication status...');
    try {
      const user = AuthService.getCurrentUser();
      console.log('👤 Current user:', user ? `${user.uid} (${user.email})` : 'null');
      setCurrentUser(user);
      setIsUserLoggedIn(!!user);

      if (user) {
        setIsLoadingUserProfile(true);
        console.log('👤 Loading user profile for:', user.uid);
        
        try {
          const profileResult = await UserService.getCurrentUserProfile();
          console.log('👤 Profile result:', profileResult);
          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
            console.log('👤 User profile loaded successfully:', {
              firstName: profileResult.data.firstName,
              lastName: profileResult.data.lastName,
              email: profileResult.data.email,
              barangay: profileResult.data.barangay
            });
          } else {
            console.warn('⚠️ Failed to load user profile:', profileResult.error);
            setUserProfile(null);
          }
        } catch (profileError) {
          console.error('❌ Error loading user profile:', profileError);
          setUserProfile(null);
        } finally {
          setIsLoadingUserProfile(false);
        }
      } else {
        console.log('👤 No user logged in - guest mode');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error checking authentication status:', error);
      setIsUserLoggedIn(false);
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  // Handle hardware back button with modal priority and logical navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Priority 1: Close modals in logical order
      if (isReportModalVisible) {
        setIsReportModalVisible(false);
        return true;
      }
      if (isMediaPickerVisible) {
        setIsMediaPickerVisible(false);
        return true;
      }
      if (isLocationPermissionModalVisible) {
        setIsLocationPermissionModalVisible(false);
        return true;
      }
      if (isNotificationModalVisible) {
        setIsNotificationModalVisible(false);
        return true;
      }
      if (isSidebarVisible) {
        setIsSidebarVisible(false);
        return true;
      }
      
      // Priority 2: Use logical navigation (Map is home, so exit app)
      const context = NavigationHelper.createContext('Map');
      const handled = NavigationHelper.handleBackNavigation(navigation, 'Map', context);
      
      if (!handled) {
        // NavigationHelper says to exit app
        BackHandler.exitApp();
      }
      return true;
    });

    return () => backHandler.remove();
  }, [isReportModalVisible, isMediaPickerVisible, isLocationPermissionModalVisible, isNotificationModalVisible, isSidebarVisible, navigation]);

  // Auth state listener
  useEffect(() => {
    if (!fontsLoaded) return;
    
    const { auth } = require('../config/firebase');
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      console.log('🔄 Auth state changed:', user ? `${user.uid} (${user.email})` : 'null');
      setCurrentUser(user);
      setIsUserLoggedIn(!!user);

      if (user) {
        setIsLoadingUserProfile(true);
        console.log('👤 Loading user profile for:', user.uid);
        
        try {
          const profileResult = await UserService.getCurrentUserProfile();
          console.log('👤 Profile result:', profileResult);
          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
            console.log('👤 User profile loaded successfully:', {
              firstName: profileResult.data.firstName,
              lastName: profileResult.data.lastName,
              email: profileResult.data.email,
              barangay: profileResult.data.barangay
            });
          } else {
            console.warn('⚠️ Failed to load user profile:', profileResult.error);
            setUserProfile(null);
          }
        } catch (profileError) {
          console.error('❌ Error loading user profile:', profileError);
          setUserProfile(null);
        } finally {
          setIsLoadingUserProfile(false);
        }
      } else {
        console.log('👤 No user logged in - guest mode');
        setUserProfile(null);
        setIsLoadingUserProfile(false);
      }
    });

    return () => unsubscribe();
  }, [fontsLoaded]);

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

    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }

    setIsReportModalVisible(true);
  };

  const handleSubmitReport = async () => {
    // Check if user is authenticated
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Authentication Required', 'You must be logged in to submit a report');
      return;
    }

    // Check user's barangay eligibility
    try {
      const userProfileResult = await UserService.getCurrentUserProfile();
      if (!userProfileResult.success || !userProfileResult.data) {
        Alert.alert('Profile Error', 'Unable to load your profile. Please try again.');
        return;
      }

      const userProfile = userProfileResult.data;
      if (!isReportingAllowed(userProfile.barangay)) {
        Alert.alert(
          'Reporting Not Available', 
          `Sorry, reporting is currently only available for residents of Pinagbakahan, Look, Bulihan, Dakila, and Mojon barangays. Your registered barangay: ${userProfile.barangay}`
        );
        return;
      }
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      Alert.alert('Error', 'Unable to verify your eligibility. Please try again.');
      return;
    }

    // Check location permission
    try {
      const locationService = LocationService.getInstance();
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Location Required', 
          'Location access is required to submit reports. Please enable location permissions and try again.'
        );
        return;
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      Alert.alert('Error', 'Unable to check location permissions. Please try again.');
      return;
    }

    if (!reportType.trim()) {
      Alert.alert('Error', 'Please enter the type of incident');
      return;
    }

    if (!reportDescription.trim()) {
      Alert.alert('Error', 'Please provide a description of the incident');
      return;
    }

    setIsSubmittingReport(true);

    try {
      // Get current location
      console.log('📍 Getting current location for report...');
      const locationService = LocationService.getInstance();
      const currentLocation = await locationService.getCurrentLocation();

      if (!currentLocation) {
        Alert.alert('Error', 'Unable to get your current location. Please ensure location services are enabled.');
        return;
      }

      console.log('📍 Current location obtained:', currentLocation);

      // Prepare report data with current location
      const reportData: CreateReportData = {
        barangay: 'Pinagbakahan', // Default barangay - could be enhanced with reverse geocoding
        description: reportDescription.trim(),
        incidentType: reportType.trim(),
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        submittedByEmail: currentUser.email || 'unknown@email.com'
      };

      // Add media information if any media is selected
      if (selectedMedia.length > 0) {
        const mediaTypes = selectedMedia.map(media => media.type).join(', ');
        reportData.mediaType = `${selectedMedia.length} files: ${mediaTypes}`;
        reportData.mediaURL = selectedMedia.map(media => media.uri).join(';');
        
        console.log('📸 Report includes media:', {
          count: selectedMedia.length,
          types: mediaTypes,
          firstFile: selectedMedia[0].uri
        });
      }

      console.log('📍 Report will be submitted with location:', {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        barangay: reportData.barangay
      });

      console.log('📝 Submitting report to Firestore:', reportData);

      // Submit to Firestore
      const result = await ReportsService.createReport(reportData);

      if (result.success) {
        console.log('✅ Report submitted successfully with ID:', result.reportId);
        
        // Close modal and clear form
        setIsReportModalVisible(false);
        setReportType('');
        setReportDescription('');
        setSelectedMedia([]); // Clear selected media
        
        // Show success message
        Alert.alert(
          'Success', 
          'Your report has been submitted successfully and will be reviewed by authorities.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh reports to show the new one
                fetchReports();
                fetchHotspots();
              }
            }
          ]
        );
      } else {
        console.error('❌ Failed to submit report:', result.error);
        Alert.alert('Error', `Failed to submit report: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Exception while submitting report:', error);
      Alert.alert('Error', `Failed to submit report: ${error.message}`);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Media picker functions
  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermissionGranted(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  };

  const showMediaPicker = () => {
    Alert.alert(
      'Select Media',
      'Choose how you want to add media to your report',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check if adding this would exceed the limit
        if (selectedMedia.length >= 5) {
          Alert.alert('Limit Exceeded', 'You can only select up to 5 media files.');
          return;
        }
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
        console.log('📷 Photo captured from camera:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery access is required to select media');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check if adding this would exceed the limit
        if (selectedMedia.length >= 5) {
          Alert.alert('Limit Exceeded', 'You can only select up to 5 media files.');
          return;
        }
        
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
        console.log('🎥 Video selected from gallery:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const openVideoOptions = () => {
    Alert.alert(
      'Select Video',
      'Choose how you want to add video to your report',
      [
        { text: 'Record Video', onPress: () => recordVideo() },
        { text: 'Choose from Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const recordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to record videos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 30, // 30 seconds max
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Check if adding this would exceed the limit
        if (selectedMedia.length >= 5) {
          Alert.alert('Limit Exceeded', 'You can only select up to 5 media files.');
          return;
        }
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
        console.log('🎥 Video recorded from camera:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video');
    }
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prevMedia => prevMedia.filter((_, i) => i !== index));
  };

  const clearAllMedia = () => {
    setSelectedMedia([]);
  };

  const handleCloseReportModal = () => {
    // Clear all form data including media when modal is closed
    setReportType('');
    setReportDescription('');
    setSelectedMedia([]);
    setIsReportModalVisible(false);
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
            {/* Profile Section - Different content based on authentication */}
            <View style={styles.profileContainer}>
              {isUserLoggedIn && userProfile ? (
                <>
                  <View style={styles.profileImageContainer}>
                    {userProfile.profilePictureURL ? (
                      <Image 
                        source={{ uri: userProfile.profilePictureURL }} 
                        style={styles.profileImage}
                      />
                    ) : (
                      <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileInitials}>
                          {userProfile.firstName?.charAt(0)?.toUpperCase()}{userProfile.lastName?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.profileName}>
                    {userProfile.firstName} {userProfile.lastName}
                  </Text>
                  <Text style={styles.profileEmail}>
                    {userProfile.email}
                  </Text>
                  <Text style={styles.profileLocation}>
                    {userProfile.barangay}, {userProfile.city}
                  </Text>
                  <TouchableOpacity 
                    style={styles.editProfileButton}
                    onPress={handleEditProfilePress}
                  >
                    <Text style={styles.editProfileText}>Edit profile</Text>
                  </TouchableOpacity>
                </>
              ) : isUserLoggedIn && isLoadingUserProfile ? (
                <>
                  <View style={styles.profileImageContainer}>
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileInitials}>...</Text>
                    </View>
                  </View>
                  <Text style={styles.profileName}>Loading...</Text>
                  <Text style={styles.profileEmail}>Please wait</Text>
                </>
              ) : (
                <>
                  <View style={styles.profileImageContainer}>
                    <View style={styles.guestProfilePlaceholder}>
                      <Text style={styles.guestProfileIcon}>👤</Text>
                    </View>
                  </View>
                  <Text style={styles.guestProfileName}>Guest User</Text>
                  <Text style={styles.guestProfileSubtext}>Using without account</Text>
                  <TouchableOpacity 
                    style={styles.loginButton}
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
                    <Text style={styles.loginButtonText}>Login to Account</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.menuSection}>
              {/* Report Incident - Always visible but behavior differs */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setIsSidebarVisible(false);
                  handleReportPress();
                }}
              >
                <Text style={styles.menuItemText}>Report an Incident</Text>
              </TouchableOpacity>

              {/* Notifications - Always visible */}
              <TouchableOpacity style={styles.menuItem} onPress={handleNotificationPress}>
                <Text style={styles.menuItemText}>Enable Notifications</Text>
              </TouchableOpacity>

              {/* Conditional menu items based on authentication */}
              {isUserLoggedIn ? (
                <>
                  {/* Edit Profile - Only for logged in users */}
                  <TouchableOpacity style={styles.menuItem} onPress={handleEditProfilePress}>
                    <Text style={styles.menuItemText}>Edit Profile</Text>
                  </TouchableOpacity>

                  {/* Analysis - Only for logged in users */}
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      Animated.timing(slideAnim, {
                        toValue: -280,
                        duration: 300,
                        useNativeDriver: true,
                      }).start(() => {
                        setIsSidebarVisible(false);
                        navigation.navigate('IncidentAnalysis');
                      });
                    }}
                  >
                    <Text style={styles.menuItemText}>Incident Analysis</Text>
                  </TouchableOpacity>

                  {/* Log Out - Only for logged in users */}
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      Animated.timing(slideAnim, {
                        toValue: -280,
                        duration: 300,
                        useNativeDriver: true,
                      }).start(() => {
                        setIsSidebarVisible(false);
                        // Sign out user
                        AuthService.signOut();
                        setIsUserLoggedIn(false);
                        setCurrentUser(null);
                        setUserProfile(null);
                        navigation.navigate('Login');
                      });
                    }}
                  >
                    <Text style={styles.menuItemText}>Log Out</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Sign Up - Only for guest users */}
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      Animated.timing(slideAnim, {
                        toValue: -280,
                        duration: 300,
                        useNativeDriver: true,
                      }).start(() => {
                        setIsSidebarVisible(false);
                        navigation.navigate('Signup');
                      });
                    }}
                  >
                    <Text style={styles.menuItemText}>Create Account</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Terms and Conditions - Always visible */}
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
                <Text style={styles.menuItemText}>Terms and Conditions</Text>
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
        animationType="fade"
        transparent={true}
        visible={isReportModalVisible}
        onRequestClose={handleCloseReportModal}
      >
        <View style={styles.reportModalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.reportModalTitle}>Report Form</Text>
            <Text style={styles.reportModalSubtitle}>Detail of report</Text>
            
            <ScrollView 
              style={styles.reportScrollView}
              contentContainerStyle={styles.reportModalScrollContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Location Display */}
              <View style={styles.locationDisplay}>
                <FontAwesome name="map-marker" size={16} color="#EF4444" />
                <Text style={styles.locationText}>
                  {userLocation 
                    ? `Location: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`
                    : 'Getting your location...'
                  }
                </Text>
              </View>
              
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
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => openCamera()}
                >
                  <View style={styles.mediaIcon}>
                    <FontAwesome name="camera" size={24} color="white" />
                  </View>
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => openVideoOptions()}
                >
                  <View style={styles.mediaIcon}>
                    <FontAwesome name="video-camera" size={24} color="white" />
                  </View>
                  <Text style={styles.mediaButtonText}>Video</Text>
                </TouchableOpacity>
              </View>
              {selectedMedia.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearAllMediaButton}
                  onPress={clearAllMedia}
                >
                  <Text style={styles.clearAllMediaText}>Clear All Media ({selectedMedia.length})</Text>
                </TouchableOpacity>
              )}

              {/* Media Preview */}
              {selectedMedia.length > 0 && (
                <View style={styles.mediaPreview}>
                  <Text style={styles.mediaPreviewTitle}>
                    Selected Media ({selectedMedia.length}/5)
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaPreviewScroll}
                  >
                    {selectedMedia.map((media, index) => (
                      <View key={index} style={styles.mediaPreviewItem}>
                        {media.type === 'image' ? (
                          <Image 
                            source={{ uri: media.uri }} 
                            style={styles.mediaPreviewImage} 
                          />
                        ) : (
                          <View style={styles.videoPreviewContainer}>
                            <FontAwesome name="video-camera" size={30} color="#666" />
                            <Text style={styles.videoPreviewText}>Video</Text>
                          </View>
                        )}
                        <TouchableOpacity 
                          style={styles.removeMediaButton}
                          onPress={() => removeMedia(index)}
                        >
                          <FontAwesome name="times-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            </ScrollView>

            <View style={styles.reportModalButtons}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleCloseReportModal}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmittingReport && styles.disabledButton]}
                onPress={handleSubmitReport}
                disabled={isSubmittingReport}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </Text>
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
    paddingHorizontal: 25,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  profileLocation: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  guestProfilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestProfileIcon: {
    fontSize: 24,
  },
  guestProfileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  guestProfileSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 16,
    alignSelf: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reportModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    height: '85%',
    width: '100%',
    maxWidth: 400,
    paddingTop: 24,
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
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
  reportScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  reportModalScrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
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
  clearMediaButton: {
    backgroundColor: '#F3F4F6',
  },
  clearAllMediaButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearAllMediaText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  mediaPreview: {
    marginTop: 16,
  },
  mediaPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  mediaPreviewScroll: {
    maxHeight: 100,
  },
  mediaPreviewItem: {
    width: 80,
    height: 80,
    marginRight: 8,
    position: 'relative',
  },
  mediaPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  videoPreviewContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoPreviewText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  reportModalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
  disabledButton: {
    opacity: 0.6,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});

export default MapScreen;