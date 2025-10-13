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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Camera } from 'expo-camera';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';
import LocationService, { LocationCoords } from '../services/LocationService';
import { ReportsService, Report, Hotspot, CreateReportData } from '../services/ReportsService';
import { OfflineReportsService } from '../services/OfflineReportsService';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { isReportingAllowed, BULACAN_CITIES } from '../utils/BulacanBarangays';
import { NavigationHelper } from '../utils/NavigationHelper';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Comprehensive Responsive utility functions
// Device breakpoints based on common device widths
const isSmallPhone = () => screenWidth < 375;        // iPhone SE 1st gen, small Androids (360px)
const isStandardPhone = () => screenWidth >= 375 && screenWidth < 414;  // iPhone 8, X, 12/13 Pro (375-390px)
const isLargePhone = () => screenWidth >= 414 && screenWidth < 768;     // iPhone Plus, Pro Max (414-430px)
const isTablet = () => screenWidth >= 768;           // iPad mini and larger
const isLargeTablet = () => screenWidth >= 1024;     // iPad Pro and larger

// Device height detection for notched/long devices
const hasNotch = () => screenHeight >= 812;          // iPhone X and newer, modern Androids
const isShortDevice = () => screenHeight < 667;      // iPhone SE, compact devices

// Get device category for easier logic
const getDeviceSize = () => {
  if (isLargeTablet()) return 'xlarge';
  if (isTablet()) return 'large';
  if (isLargePhone()) return 'medium-large';
  if (isStandardPhone()) return 'medium';
  if (isSmallPhone()) return 'small';
  return 'medium';
};

// Responsive size with granular device support
const responsiveSize = (small: number, medium: number, mediumLarge: number, large: number, xlarge?: number) => {
  if (isLargeTablet() && xlarge) return xlarge;
  if (isTablet()) return large;
  if (isLargePhone()) return mediumLarge;
  if (isStandardPhone()) return medium;
  if (isSmallPhone()) return small;
  return medium;
};

// Improved font scaling with min/max constraints
const responsiveFontSize = (baseSize: number) => {
  // Base scale on iPhone 11 (414px) for better modern device support
  const baseWidth = 414;
  let scale = screenWidth / baseWidth;
  
  // Constrain scale to prevent too small or too large fonts
  scale = Math.max(0.85, Math.min(scale, 1.15));
  
  let fontSize = baseSize * scale;
  
  // Apply device-specific adjustments
  if (isSmallPhone()) {
    fontSize = baseSize * 0.9; // Slightly smaller for small devices
  } else if (isTablet()) {
    fontSize = baseSize * 1.1; // Slightly larger for tablets
  }
  
  // Ensure minimum readability
  const minSize = baseSize * 0.85;
  const maxSize = baseSize * 1.2;
  
  return Math.round(Math.max(minSize, Math.min(fontSize, maxSize)));
};

// Responsive padding with device-specific scaling
const responsivePadding = (base: number) => {
  return responsiveSize(
    base * 0.8,      // small phones
    base,            // standard phones  
    base * 1.1,      // large phones
    base * 1.3,      // tablets
    base * 1.5       // large tablets
  );
};

// Responsive width (percentage-based)
const responsiveWidth = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

// Responsive height (percentage-based)
const responsiveHeight = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};

// Ensure minimum touch target size (iOS HIG: 44x44pt, Material: 48x48dp)
const minimumTouchTarget = (size: number) => {
  const minSize = 44;
  return Math.max(size, minSize);
};

// Get safe area insets for notched devices
const getSafeAreaTop = () => {
  if (hasNotch()) return responsiveSize(44, 44, 47, 50, 50);
  return responsiveSize(20, 20, 24, 24, 24);
};

const getSafeAreaBottom = () => {
  if (hasNotch()) return responsiveSize(34, 34, 34, 34, 34);
  return 0;
};

// Responsive icon sizes
const getIconSize = (base: number) => {
  return responsiveSize(
    base * 0.9,      // small
    base,            // medium
    base * 1.05,     // medium-large
    base * 1.15,     // large
    base * 1.25      // xlarge
  );
};

const MapView = React.forwardRef<any, { userLocation: LocationCoords | null; reports: Report[]; hotspots: Hotspot[] }>(
  ({ userLocation, reports, hotspots }, ref) => {
  const mapWidth = screenWidth;
  // Responsive map height - adapts to device size and safe areas
  const headerHeight = responsiveSize(
    160,  // small phones - compact header
    170,  // standard phones
    180,  // large phones
    200,  // tablets
    220   // large tablets
  );
  const safeTop = getSafeAreaTop();
  const mapHeight = screenHeight - headerHeight - safeTop;

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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
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
            // Debug logging function
            function debugLog(message) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: message }));
                }
            }
            
            debugLog('Script started');
            
            // Define Philippines geographical bounds
            // Southwest corner: Mindanao (approx 4.5°N, 116.9°E)
            // Northeast corner: Northern Luzon (approx 21.2°N, 126.6°E)
            var philippinesBounds = L.latLngBounds(
                L.latLng(4.5, 116.9),  // Southwest
                L.latLng(21.2, 126.6)  // Northeast
            );
            
            debugLog('Philippines bounds defined');

            // Initialize map with dynamic center location and bounds
            try {
                var map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false,
                    maxBounds: philippinesBounds,
                    maxBoundsViscosity: 1.0,  // Prevent dragging outside bounds
                    minZoom: 6,   // Minimum zoom to see entire Philippines
                    maxZoom: 18   // Maximum zoom for street-level detail
                }).setView([${mapCenter[0]}, ${mapCenter[1]}], 15);
                debugLog('Map initialized successfully');
            } catch(e) {
                debugLog('Error initializing map: ' + e.message);
                throw e;
            }

            // Add OpenStreetMap tiles
            debugLog('Adding tile layer...');
            try {
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '',
                    maxZoom: 19
                }).addTo(map);
                debugLog('Tile layer added successfully');
            } catch(e) {
                debugLog('Error adding tile layer: ' + e.message);
            }

            // Font Awesome pin icon for user location
            var userIcon = L.divIcon({
                html: '<i class="fa fa-map-marker" style="font-size: 24px; color: #EF4444; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"></i>',
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                className: 'custom-user-pin'
            });

            // Incident type to Font Awesome icon mapping (exact categories from database)
            var incidentTypeIcons = {
                'Theft': 'fa-user-secret',
                'Reports/Agreement': 'fa-file-contract',
                'Accident': 'fa-car-burst',
                'Debt / Unpaid Wages Report': 'fa-money-bill-transfer',
                'Defamation Complaint': 'fa-gavel',
                'Assault/Harassment': 'fa-hand-fist',
                'Property Damage/Incident': 'fa-house-damage',
                'Animal Incident': 'fa-shield-dog',
                'Verbal Abuse and Threats': 'fa-comment-slash',
                'Alarm and Scandal': 'fa-bell',
                'Lost Items': 'fa-magnifying-glass',
                'Scam/Fraud': 'fa-user-ninja',
                'Drugs Addiction': 'fa-syringe',
                'Missing Person': 'fa-person-circle-question',
                'Others': 'fa-circle-info'
            };

            // Function to get icon for incident type
            function getIncidentIcon(incidentType) {
                var icon = incidentTypeIcons[incidentType] || 'fa-exclamation-triangle';
                return icon;
            }

            // Function to create custom icon based on incident type
            function createIncidentIcon(incidentType) {
                var iconClass = getIncidentIcon(incidentType);
                return L.divIcon({
                    html: '<div style="position: relative; width: 36px; height: 44px;">' +
                          '<div style="width: 36px; height: 36px; background: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #960C12; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0;">' +
                          '<div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">' +
                          '<i class="fas ' + iconClass + '" style="font-size: 18px; color: #960C12;"></i>' +
                          '</div>' +
                          '</div>' +
                          '</div>',
                    iconSize: [36, 44],
                    iconAnchor: [18, 40],
                    popupAnchor: [0, -36],
                    className: 'custom-report-pin'
                });
            }

            // User location marker (only show if location is available)
            ${userLocation ? `
            debugLog('Adding user location marker at [${userLocation.latitude}, ${userLocation.longitude}]');
            try {
                L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon, zIndexOffset: 1000})
                    .addTo(map)
                    .bindPopup('<div style="font-weight: bold; color: #EF4444;">Your Current Location</div>');
                debugLog('User location marker added');
            } catch(e) {
                debugLog('Error adding user marker: ' + e.message);
            }
            ` : 'debugLog("No user location available");'}

            // Add report markers with incident-specific icons
            debugLog('Adding ${reports.length} report markers...');
            ${reports.map((report, index) => `
            try {
                debugLog('Adding marker ${index + 1}/${reports.length} at [${report.geoLocation.latitude}, ${report.geoLocation.longitude}] - Type: ${report.incidentType || 'Unknown'}');
                L.marker([${report.geoLocation.latitude}, ${report.geoLocation.longitude}], {icon: createIncidentIcon('${report.incidentType || 'Others'}')})
                    .addTo(map)
                .bindPopup(\`
                    <div style="max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 12px; background: white; border-radius: 8px;">
                        <!-- Title Header -->
                        <div style="font-weight: 700; color: #1F2937; font-size: 16px; margin-bottom: 14px; line-height: 1.3; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px;">
                            ${report.title || 'Untitled Report'}
                        </div>
                        
                        <!-- Barangay -->
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4B5563; display: flex; align-items: center;">
                            <i class="fas fa-home" style="margin-right: 8px; font-size: 14px; color: #960C12;"></i>
                            <strong style="color: #1F2937; margin-right: 6px;">Barangay:</strong> 
                            <span>${report.barangay || 'Not specified'}</span>
                        </div>
                        
                        <!-- Date & Time -->
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4B5563; display: flex; align-items: center;">
                            <i class="fas fa-calendar-alt" style="margin-right: 8px; font-size: 14px; color: #960C12;"></i>
                            <strong style="color: #1F2937; margin-right: 6px;">Date & Time:</strong> 
                            <span>${report.dateTime ? (() => {
                                try {
                                  const dateStr = typeof report.dateTime === 'string' 
                                    ? report.dateTime.replace(' UTC', '').replace('T', ' ')
                                    : report.dateTime;
                                  const date = new Date(dateStr);
                                  return date.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric'
                                  }) + ' at ' + date.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  });
                                } catch(e) {
                                  return report.dateTime;
                                }
                              })() : 'Invalid Date'}</span>
                        </div>
                        
                        <!-- Incident Type -->
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4B5563; display: flex; align-items: center;">
                            <i class="fas fa-exclamation-triangle" style="margin-right: 8px; font-size: 14px; color: #960C12;"></i>
                            <strong style="color: #1F2937; margin-right: 6px;">Incident Type:</strong> 
                            <span>${report.incidentType || 'Not specified'}</span>
                        </div>
                        
                        <!-- Status -->
                        <div style="margin-bottom: 10px; font-size: 13px; color: #4B5563; display: flex; align-items: center;">
                            <i class="fas fa-check-circle" style="margin-right: 8px; font-size: 14px; color: #22C55E;"></i>
                            <strong style="color: #1F2937; margin-right: 6px;">Status:</strong> 
                            <span style="
                                color: white; 
                                background-color: #22C55E;
                                padding: 3px 10px; 
                                border-radius: 12px; 
                                font-size: 11px;
                                font-weight: 600;
                                display: inline-block;
                            ">Verified</span>
                        </div>
                        
                        <!-- Description -->
                        <div style="border-top: 1px solid #E5E7EB; padding-top: 10px; margin-top: 10px;">
                            <div style="font-size: 13px; color: #4B5563;">
                                <div style="display: flex; align-items: flex-start; margin-bottom: 6px;">
                                    <i class="fas fa-file-alt" style="margin-right: 8px; font-size: 14px; color: #960C12;"></i>
                                    <strong style="color: #1F2937;">Description:</strong>
                                </div>
                                <div style="color: #6B7280; font-size: 12px; line-height: 1.5; margin-top: 4px; max-height: 80px; overflow-y: auto; padding-left: 22px;">
                                    ${report.description || 'No description available'}
                                </div>
                            </div>
                        </div>
                        
                        ${report.mediaURL && report.mediaURL.length > 0 ? `
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                            <div style="font-size: 11px; color: #333; margin-bottom: 6px;"><strong><i class="fas fa-camera" style="margin-right: 4px; color: #960C12;"></i> Media:</strong></div>
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
                                                <i class="fas fa-video" style="font-size: 20px; color: #960C12;"></i>
                                               </div>`
                                            : `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" 
                                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                               <div style="display: none; width: 100%; height: 100%; background: #F3F4F6; align-items: center; justify-content: center; color: #666;">
                                                <i class="fas fa-image" style="font-size: 20px; color: #960C12;"></i>
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
                    </div>
                \`);
            } catch(e) {
                debugLog('Error adding marker: ' + e.message);
            }
            `).join('')}
            debugLog('Finished adding all markers');

            // Add hotspot circles
            debugLog('Adding ${hotspots.length} hotspot circles...');
            ${hotspots.map((hotspot, index) => `
            try {
                debugLog('Adding hotspot ${index + 1}/${hotspots.length}');
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
                            <strong><i class="fas fa-map-marker-alt" style="margin-right: 4px; color: #960C12;"></i> Location:</strong> ${hotspot.barangay || 'Multiple Areas'}
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                            <strong><i class="fas fa-chart-bar" style="margin-right: 4px; color: #960C12;"></i> Incident Count:</strong> ${hotspot.incidentCount} verified reports
                        </div>
                        <div style="font-size: 12px; color: #333; margin-bottom: 6px;">
                            <strong><i class="fas fa-exclamation-triangle" style="margin-right: 4px; color: #960C12;"></i> Risk Level:</strong> 
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
            } catch(e) {
                debugLog('Error adding hotspot: ' + e.message);
            }
            `).join('')}
            debugLog('Finished adding all hotspots');
            debugLog('Map setup complete!');

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
      style={{ width: mapWidth, height: mapHeight, backgroundColor: '#f0f0f0' }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      scrollEnabled={false}
      bounces={false}
      onLoadStart={() => console.log('🗺️ Map started loading...')}
      onLoadEnd={() => console.log('🗺️ Map loaded successfully')}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
      }}
      onMessage={(event) => {
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
      }}
      originWhitelist={['*']}
      ref={ref}
    />
  );
});

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const webViewRef = useRef<any>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLocationPermissionModalVisible, setIsLocationPermissionModalVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportCategory, setReportCategory] = useState('Select type of incident');
  const [isSensitive, setIsSensitive] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isLoadingHotspots, setIsLoadingHotspots] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Real-time notification state
  const [newVerifiedReports, setNewVerifiedReports] = useState<Report[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Report | null>(null);
  const [previousReportIds, setPreviousReportIds] = useState<Set<string>>(new Set());
  const isFirstReportLoad = useRef(true); // Track first load to avoid showing notifications on initial mount
  const notificationAnimation = useRef(new Animated.Value(-100)).current;
  
  // Media-related state
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  
  // Location caching for offline reporting
  const [lastKnownLocation, setLastKnownLocation] = useState<{
    latitude: number;
    longitude: number;
    timestamp: number;
  } | null>(null);
  
  // Network and offline state (initialize as null, will be determined by NetInfo)
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  const slideAnim = useRef(new Animated.Value(-280)).current;

  // Search is now triggered only on Enter key press (onSubmitEditing)
  // No auto-search on every keystroke for better performance

  // Search handler - searches reports by location, incident type, or description
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();
    try {
      // Search in reports
      const matchingReports = reports.filter(report => {
        const barangay = (report.barangay || '').toLowerCase();
        const incidentType = (report.incidentType || '').toLowerCase();
        const description = (report.description || '').toLowerCase();
        const category = (report.category || '').toLowerCase();
        
        return barangay.includes(query) || 
               incidentType.includes(query) || 
               description.includes(query) ||
               category.includes(query);
      });

      // Search in barangays
      const matchingBarangays: any[] = [];
      BULACAN_CITIES.forEach(city => {
        city.barangays.forEach(barangay => {
          if (barangay.name.toLowerCase().includes(query)) {
            matchingBarangays.push({
              type: 'barangay',
              name: barangay.name,
              city: city.name,
              coordinates: barangay.coordinates
            });
          }
        });
      });

      const results = [
        ...matchingReports.map(r => ({ type: 'report', data: r })),
        ...matchingBarangays
      ];

      setSearchResults(results);
      // Pan to nearest result
      if (results.length > 0) {
        const firstResult = results[0];
        
        if (firstResult.type === 'report') {
          const report = firstResult.data;
          const lat = report.geoLocation.latitude;
          const lng = report.geoLocation.longitude;
          
          // Pan map to report location
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              if (typeof map !== 'undefined') {
                map.setView([${lat}, ${lng}], 16);
              }
              true;
            `);
          }
        } else if (firstResult.type === 'barangay' && firstResult.coordinates) {
          const lat = firstResult.coordinates.latitude;
          const lng = firstResult.coordinates.longitude;
          
          // Pan map to barangay location
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              if (typeof map !== 'undefined') {
                map.setView([${lat}, ${lng}], 15);
              }
              true;
            `);
          }
        }
      } else {
        Alert.alert(
          'No Results',
          `No reports or locations found for "${searchQuery}"`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Search Error', error.message || 'Failed to search');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to fetch reports from Firestore
  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const result = await ReportsService.getAllReports();
      if (result.success && result.data) {
        // Filter to only show Verified AND non-sensitive reports within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const verifiedReports = result.data.filter(report => {
          if (report.status !== 'Verified' || report.isSensitive) return false;
          
          // Check if report is within last 30 days
          try {
            if (!report.dateTime) return false;
            
            const reportDate = new Date(report.dateTime);
            if (isNaN(reportDate.getTime())) return false;
            
            return reportDate >= thirtyDaysAgo;
          } catch (e) {
            return false;
          }
        });
        setReports(verifiedReports);
        // Log sample report for debugging with all requested fields
        if (result.data.length > 0) {
          const sample = result.data[0];
        }
        
        // Show summary of all reports
        const reportsWithAllFields = result.data.filter(r => 
          r.barangay && r.dateTime && r.description && r.incidentType && r.status
        );
      } else {
        Alert.alert('Error', `Failed to load reports: ${result.error}`);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to load reports: ${error.message}`);
    } finally {
      setIsLoadingReports(false);
    }
  };

  // Function to fetch hotspots
  const fetchHotspots = async () => {
    setIsLoadingHotspots(true);
    try {
      const result = await ReportsService.calculateHotspots();
      if (result.success && result.data) {
        setHotspots(result.data);
      } else {
        // Don't show alert for hotspot errors - it's a secondary feature
      }
    } catch (error: any) {
    } finally {
      setIsLoadingHotspots(false);
    }
  };

  // Handle notification queue - show notifications one at a time
  useEffect(() => {
    if (newVerifiedReports.length > 0 && !showNotification) {
      const nextReport = newVerifiedReports[0];
      setCurrentNotification(nextReport);
      setShowNotification(true);
      
      // Send push notification (works even when app is in background/closed)
      sendPushNotification(nextReport);
      
      // Animate notification in
      Animated.spring(notificationAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
      
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newVerifiedReports, showNotification]);

  const sendPushNotification = async (report: Report) => {
    try {
      const { NotificationService } = await import('../services/NotificationService');
      await NotificationService.notifyNewVerifiedReport(
        report.incidentType || report.category || 'Incident',
        report.barangay,
        report.id
      );
    } catch (error) {
    }
  };

  const hideNotification = () => {
    Animated.timing(notificationAnimation, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowNotification(false);
      setCurrentNotification(null);
      // Remove the shown notification from queue
      setNewVerifiedReports(prev => prev.slice(1));
    });
  };

  // Function to check authentication status and load user profile
  const checkAuthenticationStatus = async () => {
    try {
      const user = AuthService.getCurrentUser();
      setCurrentUser(user);
      setIsUserLoggedIn(!!user);

      if (user) {
        setIsLoadingUserProfile(true);
        try {
          const profileResult = await UserService.getCurrentUserProfile();
          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
          } else {
            setUserProfile(null);
          }
        } catch (profileError) {
          setUserProfile(null);
        } finally {
          setIsLoadingUserProfile(false);
        }
      } else {
        setUserProfile(null);
      }
    } catch (error) {
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
      if (isLogoutModalVisible) {
        setIsLogoutModalVisible(false);
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
  }, [isReportModalVisible, isMediaPickerVisible, isLocationPermissionModalVisible, isNotificationModalVisible, isLogoutModalVisible, isSidebarVisible, navigation]);

  // Auth state listener
  useEffect(() => {
    if (!fontsLoaded) return;
    
    const { auth } = require('../config/firebase');
    const { onAuthStateChanged } = require('firebase/auth');
    
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      setCurrentUser(user);
      setIsUserLoggedIn(!!user);

      if (user) {
        setIsLoadingUserProfile(true);
        try {
          const profileResult = await UserService.getCurrentUserProfile();
          if (profileResult.success && profileResult.data) {
            setUserProfile(profileResult.data);
          } else {
            setUserProfile(null);
          }
        } catch (profileError) {
          setUserProfile(null);
        } finally {
          setIsLoadingUserProfile(false);
        }
      } else {
        setUserProfile(null);
        setIsLoadingUserProfile(false);
      }
    });

    return () => unsubscribe();
  }, [fontsLoaded]);

  // Set up push notification listeners
  useEffect(() => {
    if (!fontsLoaded) return;

    let notificationListener: any;
    let responseListener: any;

    const setupNotificationListeners = async () => {
      try {
        const { NotificationService } = await import('../services/NotificationService');
        
        // Listen for notifications received while app is in foreground
        notificationListener = NotificationService.addNotificationReceivedListener((notification) => {
        });

        // Listen for user tapping on notifications
        responseListener = NotificationService.addNotificationResponseListener((response) => {
          const data = response.notification.request.content.data;
          
          if (data.type === 'verified-report' && data.reportId) {
            // Could navigate to report details or highlight on map
            Alert.alert(
              'View Report',
              `Report ID: ${data.reportId}\nType: ${data.incidentType}\nLocation: ${data.barangay}`,
              [{ text: 'OK' }]
            );
          }
        });
      } catch (error) {
      }
    };

    setupNotificationListeners();

    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
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
            // Cache location for offline use
            setLastKnownLocation({
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: Date.now()
            });
          } else {
          }
        } else {
        }
      } catch (error: any) {
      }
    };

    initializeLocation();
    
    // Set up real-time listener for reports
    const unsubscribeReports = ReportsService.subscribeToReports(
      (allReports) => {
        // Filter to only show Verified AND non-sensitive reports within last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const verifiedReports = allReports.filter(report => {
          // Debug each report
          const isVerified = report.status === 'Verified';
          const isNotSensitive = !report.isSensitive;
          if (!isVerified) {
            return false;
          }
          if (!isNotSensitive) {
            return false;
          }
          
          // Check if report is within last 30 days
          try {
            if (!report.dateTime) {
              return false;
            }
            
            // Parse date - should already be ISO string from service
            const reportDate = new Date(report.dateTime);
            
            if (isNaN(reportDate.getTime())) {
              return false;
            }
            
            const isWithin30Days = reportDate >= thirtyDaysAgo;
            const daysDiff = Math.floor((new Date().getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
            return isWithin30Days;
          } catch (e) {
            return false;
          }
        });
        // Update reports state
        setReports(verifiedReports);
        
        // On first load, just store the IDs without showing notifications
        if (isFirstReportLoad.current) {
          const currentVerifiedIds = new Set(verifiedReports.map(r => r.id));
          setPreviousReportIds(currentVerifiedIds);
          isFirstReportLoad.current = false;
        } else {
          // Detect newly verified reports for notifications (after first load)
          setPreviousReportIds(prevIds => {
            const currentVerifiedIds = new Set(verifiedReports.map(r => r.id));
            const newlyVerified = verifiedReports.filter(report => 
              !prevIds.has(report.id)
            );
            
            // Show notifications for newly verified reports
            if (newlyVerified.length > 0) {
              setNewVerifiedReports(prev => [...prev, ...newlyVerified]);
            }
            return currentVerifiedIds;
          });
        }
      },
      (error) => {
        Alert.alert('Error', `Failed to load reports: ${error}`);
      }
    );
    
    fetchHotspots(); // Load hotspots when component mounts
    
    // Cleanup listener on unmount
    return () => {
      unsubscribeReports();
    };
  }, [fontsLoaded]);

  // Monitor network connectivity and sync offline reports when online
  useEffect(() => {
    if (!fontsLoaded) return;

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Auto-sync when connection is restored
      if (connected && !isSyncing) {
        syncOfflineReports();
      }
    });

    // Get initial connection state and pending reports count
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected ?? false);
    });

    // Load pending reports count
    OfflineReportsService.getOfflineReportsCount().then(count => {
      setPendingReportsCount(count);
    });

    return () => unsubscribe();
  }, [fontsLoaded]);

  // Function to sync offline reports when connection is restored
  const syncOfflineReports = async () => {
    try {
      const offlineReports = await OfflineReportsService.getOfflineReports();
      
      if (offlineReports.length === 0) {
        setPendingReportsCount(0);
        return;
      }

      setIsSyncing(true);
      
      let successCount = 0;
      let failureCount = 0;

      for (const report of offlineReports) {
        try {
          // Upload media if any
          let mediaURL = report.mediaURL;
          let mediaType = report.mediaType;

          if (report.mediaAssets && report.mediaAssets.length > 0) {
            const uploadPromises = report.mediaAssets.map(async (media: any) => {
              return await uploadMediaToStorage(media, report.submittedByEmail);
            });
            
            const downloadURLs = await Promise.all(uploadPromises);
            const successfulUploads = downloadURLs.filter(url => url !== null);
            
            if (successfulUploads.length > 0) {
              const types = report.mediaAssets.map((m: any) => m.type).join(', ');
              mediaType = `${successfulUploads.length} files: ${types}`;
              mediaURL = successfulUploads.join(';');
            }
          }

          // Submit report with original timestamp
          const reportData: CreateReportData = {
            barangay: report.barangay,
            title: report.title,
            description: report.description,
            incidentType: report.incidentType,
            category: report.category,
            isSensitive: report.isSensitive,
            latitude: report.latitude,
            longitude: report.longitude,
            submittedByEmail: report.submittedByEmail,
            mediaType,
            mediaURL
          };

          const result = await ReportsService.createReport(reportData, report.createdAt);
          
          if (result.success) {
            await OfflineReportsService.removeOfflineReport(report.id);
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }

      // Update pending count
      const remainingCount = await OfflineReportsService.getOfflineReportsCount();
      setPendingReportsCount(remainingCount);

      // Show result to user
      if (successCount > 0 || failureCount > 0) {
        Alert.alert(
          'Sync Complete',
          `Successfully uploaded ${successCount} offline report${successCount !== 1 ? 's' : ''}${failureCount > 0 ? `. ${failureCount} failed.` : ''}`,
          [{ text: 'OK' }]
        );
        
        // Refresh reports if any succeeded
        if (successCount > 0) {
          fetchHotspots();
        }
      }
    } catch (error) {
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReportPress = () => {
    // Quick auth check only - no async operations
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) {
      navigation.navigate('Login');
      return;
    }

    // Open modal immediately for instant response
    setIsReportModalVisible(true);

    // Do background checks and location caching asynchronously
    // These will be checked again during submission anyway
    (async () => {
      try {
        const locationService = LocationService.getInstance();
        
        // Cache location in background if available
        const location = await locationService.getCurrentLocation();
        if (location) {
          setLastKnownLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silently fail - location will be checked on submit
      }
    })();
  };

  // Upload media to Firebase Storage
  const uploadMediaToStorage = async (mediaAsset: ImagePicker.ImagePickerAsset, userEmail: string): Promise<string | null> => {
    try {
      const fileUri = mediaAsset.uri;
      const fileType = mediaAsset.type || 'image'; // 'image' or 'video'
      
      // Get file extension
      const fileExtension = fileUri.split('.').pop() || (fileType === 'video' ? 'mp4' : 'jpg');
      
      // Generate unique filename with timestamp and sanitized email
      const timestamp = Date.now();
      const sanitizedEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${fileType}s/${sanitizedEmail}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      // Fetch the file as a blob directly from the URI
      const response = await fetch(fileUri);
      const blob = await response.blob();
      // Create storage reference
      const storageReference = storageRef(storage, `reports/${fileName}`);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageReference, blob);
      
      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          (error) => {
            reject(error);
          },
          () => {
            resolve(uploadTask.snapshot);
          }
        );
      });
      
      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (error: any) {
      throw error;
    }
  };

  const handleSubmitReport = async () => {
    // ===== STEP 1: Basic validation =====
    if (!reportTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for the incident');
      return;
    }

    if (reportCategory === 'Select type of incident') {
      Alert.alert('Error', 'Please select a category for the incident');
      return;
    }

    if (!reportDescription.trim()) {
      Alert.alert('Error', 'Please provide a description of the incident');
      return;
    }

    // Check if user is authenticated
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Authentication Required', 'You must be logged in to submit a report');
      return;
    }

    setIsSubmittingReport(true);

    // ===== STEP 2: Check network connectivity FIRST =====
    const networkState = await NetInfo.fetch();
    const isOnline = networkState.isConnected ?? false;
    
    console.log('📡 Network check:', { 
      isConnected: networkState.isConnected, 
      isInternetReachable: networkState.isInternetReachable,
      type: networkState.type,
      finalDecision: isOnline ? 'ONLINE' : 'OFFLINE'
    });

    // ===== STEP 3: Handle OFFLINE submission (simplified path) =====
    if (!isOnline) {
      console.log('💾 Device is offline - saving report locally');
      
      try {
        // Get cached user profile for offline validation
        const cachedProfile = await UserService.getCachedUserProfile();
        
        if (!cachedProfile) {
          Alert.alert(
            'Profile Not Available',
            'Unable to access your profile offline. Please connect to internet at least once before submitting offline reports.'
          );
          setIsSubmittingReport(false);
          return;
        }

        // Check if user is suspended (from cache)
        if (cachedProfile.suspended) {
          Alert.alert(
            'Account Suspended',
            'Your account is suspended and you cannot submit reports.'
          );
          setIsSubmittingReport(false);
          return;
        }

        // Get location (with fallbacks)
        const locationService = LocationService.getInstance();
        let currentLocation = await locationService.getCurrentLocation();

        // Fallback 1: Use cached location
        if (!currentLocation && lastKnownLocation) {
          currentLocation = {
            latitude: lastKnownLocation.latitude,
            longitude: lastKnownLocation.longitude
          };
          console.log('📍 Using cached location for offline report');
        }

        // Fallback 2: Use barangay center
        if (!currentLocation) {
          const { BARANGAY_COORDINATES } = await import('../utils/BulacanBarangays');
          const barangayData = BARANGAY_COORDINATES[cachedProfile.barangay];
          
          if (barangayData) {
            currentLocation = {
              latitude: barangayData.latitude,
              longitude: barangayData.longitude
            };
            console.log('📍 Using barangay center for offline report');
          }
        }

        // Final check
        if (!currentLocation) {
          Alert.alert(
            'Location Required',
            'Unable to determine your location. Please enable GPS and try again.'
          );
          setIsSubmittingReport(false);
          return;
        }

        // Create offline report
        const offlineReport = {
          id: OfflineReportsService.generateLocalId(),
          barangay: cachedProfile.barangay,
          title: reportTitle.trim(),
          description: reportDescription.trim(),
          incidentType: reportCategory !== 'Select type of incident' ? reportCategory : 'Others',
          category: reportCategory !== 'Select type of incident' ? reportCategory : 'Others',
          isSensitive: isSensitive,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          submittedByEmail: currentUser.email || 'unknown@email.com',
          createdAt: new Date().toISOString(),
          mediaAssets: selectedMedia.length > 0 ? selectedMedia : undefined
        };

        await OfflineReportsService.saveOfflineReport(offlineReport);
        
        // Update pending count
        const count = await OfflineReportsService.getOfflineReportsCount();
        setPendingReportsCount(count);

        // Stop loading and clear form
        setIsSubmittingReport(false);
        setIsReportModalVisible(false);
        setReportTitle('');
        setReportType('');
        setReportDescription('');
        setReportCategory('Select type of incident');
        setIsSensitive(false);
        setSelectedMedia([]);

        console.log('✅ Report saved offline successfully, showing alert now');
        
        // Use setTimeout to ensure modal closes before alert shows
        setTimeout(() => {
          Alert.alert(
            'Report Saved Offline',
            'Your report has been saved and will be submitted automatically when you have internet connection.',
            [{ text: 'OK', onPress: () => console.log('User acknowledged offline save') }]
          );
        }, 300);
        
        return;
      } catch (error: any) {
        console.error('❌ Error saving offline report:', error);
        Alert.alert('Error', 'Failed to save report offline. Please try again.');
        setIsSubmittingReport(false);
        return;
      }
    }

    // ===== STEP 4: Handle ONLINE submission (full validation) =====
    console.log('🌐 Device is online - submitting to server');

    // 🔓 SPECIAL ADMIN BYPASS: Only emmnlisaac@gmail.com can report from anywhere
    const isAdminUser = currentUser.email === 'emmnlisaac@gmail.com';
    
    if (isAdminUser) {
    }

    // Check user's barangay eligibility (SKIP for admin user)
    try {
      const userProfileResult = await UserService.getCurrentUserProfile();
      if (!userProfileResult.success || !userProfileResult.data) {
        Alert.alert('Profile Error', 'Unable to load your profile. Please try again.');
        setIsSubmittingReport(false);
        return;
      }

      const userProfile = userProfileResult.data;
      
      // Check if user is suspended
      if (userProfile.suspended) {
        const suspensionEndDate = userProfile.suspensionEndDate 
          ? new Date(userProfile.suspensionEndDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : 'indefinitely';
        
        const suspensionReason = userProfile.suspensionReason || 'Violation of community guidelines';
        
        Alert.alert(
          'Account Suspended',
          `Your account has been suspended and you cannot submit reports.\n\n` +
          `Suspension until: ${suspensionEndDate}\n\n` +
          [{ text: 'OK', style: 'default' }]
        );
        setIsSubmittingReport(false);
        return;
      }
      
      // SKIP barangay eligibility check ONLY for admin user
      if (!isAdminUser && !isReportingAllowed(userProfile.barangay)) {
        Alert.alert(
          'Reporting Not Available', 
          `Sorry, reporting is currently only available for residents of Pinagbakahan, Look, Bulihan, Dakila, and Mojon barangays. Your registered barangay: ${userProfile.barangay}`
        );
        setIsSubmittingReport(false);
        return;
      }

      // Check location permission and get current location for vicinity check
      const locationService = LocationService.getInstance();
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission.granted) {
        Alert.alert(
          'Location Required', 
          'Location access is required to submit reports. Please enable location permissions and try again.'
        );
        return;
      }

      // Get current location to check if user is within barangay vicinity
      const currentLocation = await locationService.getCurrentLocation();
      
      if (!currentLocation) {
        // Alert is already shown by LocationService
        return;
      }

      // SKIP vicinity check ONLY for admin user
      if (!isAdminUser) {
        // Check if user is within their registered barangay's vicinity
        const { isWithinBarangayVicinity } = await import('../utils/BulacanBarangays');
        const vicinityCheck = isWithinBarangayVicinity(
          userProfile.barangay,
          currentLocation.latitude,
          currentLocation.longitude
        );

        if (!vicinityCheck.isWithin) {
          Alert.alert(
            'Location Verification Failed',
            `You must be within your registered barangay (${userProfile.barangay}) to submit a report.\n\n` +
            `Your current location is ${vicinityCheck.distance.toFixed(2)} km away from ${userProfile.barangay}.\n` +
            `You need to be within ${vicinityCheck.allowedRadius} km of your barangay to report incidents.\n\n` +
            `Please go to your barangay or contact support if you believe this is an error.`,
            [{ text: 'OK' }]
          );
          return;
        }
      } else {
      }

      // At this point, user is verified and online - get location and submit to Firebase
      // Get user's barangay from the already-fetched profile
      const userBarangay = userProfile.barangay || 'Pinagbakahan';

      // currentLocation was already fetched in the vicinity check above
      // Cache it if available
      if (currentLocation) {
        setLastKnownLocation({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: Date.now()
        });
      }

      // Prepare report data
      const reportData: CreateReportData = {
        barangay: userBarangay,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        incidentType: reportCategory !== 'Select type of incident' ? reportCategory : 'Others',
        category: reportCategory !== 'Select type of incident' ? reportCategory : 'Others',
        isSensitive: isSensitive,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        submittedByEmail: currentUser.email || 'unknown@email.com'
      };

      // Upload media to Firebase Storage if any media is selected
      if (selectedMedia.length > 0) {
        try {
          const uploadPromises = selectedMedia.map(async (media, index) => {
            const downloadURL = await uploadMediaToStorage(media, currentUser.email || 'unknown');
            return downloadURL;
          });
          
          const downloadURLs = await Promise.all(uploadPromises);
          
          // Filter out any failed uploads (null values)
          const successfulUploads = downloadURLs.filter(url => url !== null);
          
          if (successfulUploads.length === 0) {
            throw new Error('All media uploads failed');
          }
          
          if (successfulUploads.length < downloadURLs.length) {
          }
          
          const mediaTypes = selectedMedia.map(media => media.type).join(', ');
          reportData.mediaType = `${successfulUploads.length} files: ${mediaTypes}`;
          reportData.mediaURL = successfulUploads.join(';');
        } catch (uploadError: any) {
          setIsSubmittingReport(false);
          Alert.alert(
            'Upload Error',
            `Failed to upload media files: ${uploadError.message}. The report was not submitted.`,
            [{ text: 'OK' }]
          );
          return; // Exit early on upload error
        }
      }
      // Submit to Firestore
      const result = await ReportsService.createReport(reportData);

      if (result.success) {
        // Close modal and clear form
        setIsReportModalVisible(false);
        setReportTitle('');
        setReportType('');
        setReportDescription('');
        setReportCategory('Select type of incident');
        setIsSensitive(false);
        setSelectedMedia([]); // Clear selected media
        
        // Real-time listener will automatically update reports
        // Just refresh hotspots without showing success modal
        fetchHotspots();
      } else {
        Alert.alert('Error', `Failed to submit report: ${result.error}`);
      }
    } catch (error: any) {
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
      return false;
    }
  };

  const requestMediaLibraryPermission = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
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

  const openPhotoOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openPhotoGallery() },
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
        
        // Check file size (10MB limit for images)
        const asset = result.assets[0];
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists && fileInfo.size) {
            const fileSizeMB = fileInfo.size / (1024 * 1024);
            if (fileSizeMB > 10) {
              Alert.alert(
                'File Too Large',
                `Image size is ${fileSizeMB.toFixed(1)}MB. Maximum allowed size is 10MB.`
              );
              return;
            }
          }
        } catch (sizeError) {
        }
        
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openPhotoGallery = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Gallery access is required to select photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        
        // Check file size (10MB limit for images)
        const asset = result.assets[0];
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists && fileInfo.size) {
            const fileSizeMB = fileInfo.size / (1024 * 1024);
            if (fileSizeMB > 10) {
              Alert.alert(
                'File Too Large',
                `Image size is ${fileSizeMB.toFixed(1)}MB. Maximum allowed size is 10MB.`
              );
              return;
            }
          }
        } catch (sizeError) {
        }
        
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo gallery');
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
        
        // Check file size (20MB limit for videos)
        const asset = result.assets[0];
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists && fileInfo.size) {
            const fileSizeMB = fileInfo.size / (1024 * 1024);
            if (fileSizeMB > 20) {
              Alert.alert(
                'File Too Large',
                `Video size is ${fileSizeMB.toFixed(1)}MB. Maximum allowed size is 20MB.`
              );
              return;
            }
          }
        } catch (sizeError) {
        }
        
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
      }
    } catch (error) {
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
        
        // Check file size (20MB limit for videos)
        const asset = result.assets[0];
        try {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          if (fileInfo.exists && fileInfo.size) {
            const fileSizeMB = fileInfo.size / (1024 * 1024);
            if (fileSizeMB > 20) {
              Alert.alert(
                'File Too Large',
                `Video size is ${fileSizeMB.toFixed(1)}MB. Maximum allowed size is 20MB.`
              );
              return;
            }
          }
        } catch (sizeError) {
        }
        
        setSelectedMedia(prevMedia => [...prevMedia, ...result.assets]);
      }
    } catch (error) {
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
    setReportTitle('');
    setReportType('');
    setReportDescription('');
    setReportCategory('Select type of incident');
    setIsSensitive(false);
    setSelectedMedia([]);
    setIsReportModalVisible(false);
  };

  const handleNotificationPress = async () => {
    try {
      const { NotificationService } = await import('../services/NotificationService');
      
      // Check current permission status
      const currentStatus = await NotificationService.getPermissionStatus();
      
      if (currentStatus === 'granted') {
        Alert.alert(
          'Notifications Enabled',
          'You are already receiving push notifications for verified reports.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      if (currentStatus === 'denied') {
        // Permission was previously denied, show settings prompt
        NotificationService.showPermissionDeniedAlert();
        return;
      }
      
      // Show custom modal asking user if they want to enable notifications
      setIsNotificationModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Unable to manage notification settings.');
    }
  };

  const handleAllowNotifications = async () => {
    try {
      const { NotificationService } = await import('../services/NotificationService');
      
      setIsNotificationModalVisible(false);
      
      // Request notification permissions
      const result = await NotificationService.requestPermissions();
      
      if (result.granted) {
        Alert.alert(
          '✅ Notifications Enabled',
          'You will now receive push notifications when new incident reports are verified in your area.',
          [{ text: 'OK' }]
        );
      } else if (!result.canAskAgain) {
        // User denied permission, show settings prompt
        setTimeout(() => {
          NotificationService.showPermissionDeniedAlert();
        }, 500);
      } else {
        Alert.alert(
          'Notifications Not Enabled',
          'You can enable notifications later from the menu.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to enable notifications. Please try again.');
    }
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
      } else {
        // Location services are disabled - alert already shown by LocationService
        setIsLocationPermissionModalVisible(false);
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  // Handle location button press (crosshair button)
  const handleLocationPress = async () => {
    try {
      // Refresh hotspots first
      fetchHotspots();
      
      // Then get and update location
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        // Cache location for offline use
        setLastKnownLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: Date.now()
        });
        // You could also update the map center here by sending a message to the WebView
      }
      // If location is null, alert is already shown by LocationService
    } catch (error) {
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

      {/* Real-time Notification Banner */}
      {showNotification && currentNotification && (
        <Animated.View 
          style={[
            styles.notificationBanner,
            {
              transform: [{ translateY: notificationAnimation }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.notificationContent}
            onPress={hideNotification}
            activeOpacity={0.9}
          >
            <View style={styles.notificationIcon}>
              <FontAwesome name="check-circle" size={24} color="#10B981" />
            </View>
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationTitle}>New Report Verified!</Text>
              <Text style={styles.notificationText} numberOfLines={2}>
                {currentNotification.incidentType} in {currentNotification.barangay}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={hideNotification}
              style={styles.notificationClose}
            >
              <FontAwesome name="times" size={18} color="#6B7280" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={13} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              // Clear results when text is cleared
              if (!text.trim()) {
                setSearchResults([]);
              }
            }}
            onSubmitEditing={() => {
              // Trigger search only when Enter is pressed
              if (searchQuery.trim()) {
                handleSearch();
              }
            }}
            placeholder="Search incident type..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <>
              {isSearching && (
                <FontAwesome name="spinner" size={14} color="#960C12" style={{ marginRight: 4 }} />
              )}
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={{ padding: 4 }}
              >
                <FontAwesome name="times-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView 
          ref={webViewRef}
          userLocation={userLocation} 
          reports={reports} 
          hotspots={hotspots} 
        />
      </View>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleLocationPress}
        >
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

            {/* Offline/Syncing Status Badges */}
            {!isConnected && pendingReportsCount > 0 && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>
                  OFFLINE MODE - {pendingReportsCount} report{pendingReportsCount !== 1 ? 's' : ''} pending upload
                </Text>
              </View>
            )}

            {isSyncing && (
              <View style={styles.syncingBadge}>
                <Text style={styles.syncingBadgeText}>
                  SYNCING REPORTS...
                </Text>
              </View>
            )}

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

                  {/* View Reports - Only for logged in users */}
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      Animated.timing(slideAnim, {
                        toValue: -280,
                        duration: 300,
                        useNativeDriver: true,
                      }).start(() => {
                        setIsSidebarVisible(false);
                        navigation.navigate('ViewReports');
                      });
                    }}
                  >
                    <Text style={styles.menuItemText}>View Reports</Text>
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
                        setIsLogoutModalVisible(true);
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
                        navigation.navigate('Signup', { fromMenu: true });
                      });
                    }}
                  >
                    <Text style={styles.menuItemText}>Create Account</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Incident Analysis - Always visible */}
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
                    navigation.navigate('TermsAndConditions', { fromMenu: true });
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

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.permissionModalOverlay}>
          <View style={styles.permissionModal}>
            <View style={styles.permissionIcon}>
              <FontAwesome name="sign-out" size={28} color="#EF4444" />
            </View>
            <Text style={styles.permissionTitle}>Log out</Text>
            <Text style={styles.permissionText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.permissionButtons}>
              {/* Yes (Confirm Logout) */}
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={async () => {
                  setIsLogoutModalVisible(false);
                  // Sign out user and clear cached profile
                  await AuthService.signOut();
                  await UserService.clearCachedUserProfile();
                  setIsUserLoggedIn(false);
                  setCurrentUser(null);
                  setUserProfile(null);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.allowText}>Yes</Text>
              </TouchableOpacity>
              {/* No (Cancel) */}
              <TouchableOpacity 
                style={styles.notNowButton}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.notNowText}>No</Text>
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
              {/* Title of Incident */}
              <Text style={styles.reportLabel}>Title of incident</Text>
              <TextInput
                style={styles.reportInput}
                value={reportTitle}
                onChangeText={setReportTitle}
                placeholder="Enter incident title"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
              />

              {/* Category Dropdown */}
              <Text style={styles.reportLabel}>Type of incident</Text>
              <TouchableOpacity 
                style={styles.categoryDropdownButton}
                onPress={() => setIsCategoryDropdownVisible(!isCategoryDropdownVisible)}
              >
                <Text style={[styles.categoryDropdownText, reportCategory === 'Select type of incident' && styles.placeholderText]}>
                  {reportCategory}
                </Text>
                <FontAwesome name={isCategoryDropdownVisible ? "chevron-up" : "chevron-down"} size={14} color="#6B7280" />
              </TouchableOpacity>
              
              {isCategoryDropdownVisible && (
                <ScrollView style={styles.categoryDropdown} nestedScrollEnabled={true}>
                  {[
                    'Theft',
                    'Reports/Agreement',
                    'Accident',
                    'Debt / Unpaid Wages Report',
                    'Defamation Complaint',
                    'Assault/Harassment',
                    'Property Damage/Incident',
                    'Animal Incident',
                    'Verbal Abuse and Threats',
                    'Alarm and Scandal',
                    'Lost Items',
                    'Scam/Fraud',
                    'Drugs Addiction',
                    'Missing Person',
                    'Others'
                  ].map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.categoryOption,
                        reportCategory === category && styles.selectedCategoryOption
                      ]}
                      onPress={() => {
                        setReportCategory(category);
                        setIsCategoryDropdownVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        reportCategory === category && styles.selectedCategoryOptionText
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

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

              {/* Mark as Sensitive Toggle */}
              <TouchableOpacity 
                style={styles.sensitiveToggle}
                onPress={() => setIsSensitive(!isSensitive)}
              >
                <View style={[styles.checkbox, isSensitive && styles.checkboxChecked]}>
                  {isSensitive && <FontAwesome name="check" size={14} color="white" />}
                </View>
                <Text style={styles.sensitiveLabel}>Mark as sensitive</Text>
              </TouchableOpacity>

              <Text style={styles.reportLabel}>Add Media</Text>
              <View style={styles.mediaButtons}>
                <TouchableOpacity 
                  style={styles.mediaButton}
                  onPress={() => openPhotoOptions()}
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
    paddingTop: getSafeAreaTop() + responsiveSize(10, 12, 14, 16, 18),
    paddingBottom: responsiveSize(14, 16, 18, 20, 22),
    paddingHorizontal: responsivePadding(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: minimumTouchTarget(responsiveSize(40, 44, 46, 48, 52)),
    height: minimumTouchTarget(responsiveSize(40, 44, 46, 48, 52)),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveSize(8, 8, 10, 10, 12),
  },
  headerTitle: {
    color: 'white',
    fontSize: responsiveFontSize(18),
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.3,
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
    fontSize: responsiveFontSize(12),
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
    fontSize: responsiveFontSize(11),
    fontFamily: 'Poppins_400Regular',
  },
  searchContainer: {
    position: 'absolute',
    top: responsiveSize(130, 150, 160, 170, 176),
    left: responsivePadding(16),
    right: responsivePadding(16),
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: responsiveSize(24, 28, 30, 32, 33),
    paddingHorizontal: responsivePadding(25),
    paddingVertical: responsiveSize(8, 12, 13, 14, 14),
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
    marginLeft: responsiveSize(12, 16, 18, 20, 21),
    fontSize: responsiveFontSize(16),
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  fabContainer: {
    position: 'absolute',
    right: responsivePadding(16),
    bottom: responsiveSize(140, 160, 170, 180, 186),
    gap: responsiveSize(16, 20, 22, 24, 25),
  },
  fab: {
    width: responsiveSize(56, 64, 68, 72, 74),
    height: responsiveSize(56, 64, 68, 72, 74),
    borderRadius: responsiveSize(28, 32, 34, 36, 37),
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
    paddingVertical: responsiveSize(20, 24, 26, 28, 29),
    paddingHorizontal: responsivePadding(32),
    justifyContent: isTablet() ? 'center' : 'space-around',
    gap: isTablet() ? responsiveSize(40, 60, 70, 80, 86) : 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  navItem: {
    padding: responsiveSize(16, 20, 22, 24, 25),
    borderRadius: responsiveSize(12, 14, 15, 16, 16),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: responsiveSize(64, 80, 88, 96, 100),
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
    width: responsiveSize(280, 360, 380, 400, 412),
    backgroundColor: '#EF4444',
    paddingTop: responsiveSize(60, 70, 75, 80, 83),
    paddingHorizontal: responsivePadding(20),
    zIndex: 1001,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: responsiveSize(30, 35, 37, 40, 41),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: responsiveSize(20, 25, 27, 30, 31),
  },
  profileImageContainer: {
    width: responsiveSize(80, 100, 110, 120, 126),
    height: responsiveSize(80, 100, 110, 120, 126),
    borderRadius: responsiveSize(40, 50, 55, 60, 63),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: responsiveSize(12, 16, 18, 20, 21),
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
    fontSize: responsiveFontSize(18),
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileEmail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: responsiveFontSize(14),
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
    paddingVertical: responsiveSize(16, 20, 22, 24, 25),
    paddingHorizontal: responsiveSize(16, 20, 22, 24, 25),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    color: 'white',
    fontSize: responsiveFontSize(16),
  },
  permissionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionModal: {
    backgroundColor: 'white',
    borderRadius: responsiveSize(20, 24, 26, 28, 29),
    padding: responsivePadding(32),
    alignItems: 'center',
    width: '100%',
    maxWidth: responsiveSize(340, 450, 475, 500, 515),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: responsiveFontSize(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: responsiveFontSize(22),
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  permissionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  notNowButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  notNowText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  allowButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  allowText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
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
    borderRadius: responsiveSize(20, 24, 26, 28, 29),
    height: isTablet() ? '80%' : '85%',
    width: isTablet() ? '90%' : '100%',
    maxWidth: responsiveSize(400, 600, 650, 700, 730),
    paddingTop: responsivePadding(24),
    paddingHorizontal: responsivePadding(24),
    display: 'flex',
    flexDirection: 'column',
  },
  reportModalTitle: {
    fontSize: responsiveFontSize(16),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportModalSubtitle: {
    fontSize: responsiveFontSize(24),
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
    fontSize: responsiveFontSize(14),
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
    marginTop: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: responsiveSize(8, 10, 11, 12, 12),
    paddingHorizontal: responsiveSize(16, 20, 22, 24, 25),
    paddingVertical: responsiveSize(12, 14, 15, 16, 16),
    fontSize: responsiveFontSize(16),
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
  categoryDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  categoryDropdownText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  categoryDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategoryOption: {
    backgroundColor: '#3B82F6',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedCategoryOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  sensitiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  sensitiveLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  // Notification Banner Styles
  notificationBanner: {
    position: 'absolute',
    top: responsiveSize(70, 85, 92, 100, 104),
    left: responsivePadding(16),
    right: responsivePadding(16),
    zIndex: 9999,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  notificationText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  notificationClose: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#960C12',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  offlineBadge: {
    backgroundColor: '#F59E0B',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  syncingBadge: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});

export default MapScreen;