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

// Inline SVG icons for each category (optimized for WebView display)
// These SVGs are embedded directly as strings to avoid file:// URI issues
const CATEGORY_INLINE_SVGS: { [key: string]: string } = {
  'Theft': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="8" y="10" width="8" height="9" rx="1" fill="#960C12"/><path d="M9 10V7a3 3 0 116 0v3" stroke="#960C12" stroke-width="2" stroke-linecap="round"/></svg>',
  'Reports/Agreement': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2v6h6M8 13h8M8 17h8" stroke="#960C12" stroke-width="2" stroke-linecap="round"/></svg>',
  'Accident': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="#960C12"/></svg>',
  'Debt / Unpaid Wages Report': '💰',
  'Defamation Complaint': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10h8M8 14h4" stroke="#960C12" stroke-width="2" stroke-linecap="round"/></svg>',
  'Assault/Harassment': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#960C12" stroke-width="2" stroke-linejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="1.5" fill="#960C12"/></svg>',
  'Property Damage/Incident': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12h6v10" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l3-3 3 3" stroke="#960C12" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'Animal Incident': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="7" r="2" fill="#960C12"/><circle cx="16" cy="10" r="1.5" fill="#960C12"/><circle cx="6" cy="10" r="1.5" fill="#960C12"/><path d="M11 14c2.5 0 4.5 2 4.5 4.5V22H6.5v-3.5c0-2.5 2-4.5 4.5-4.5z" fill="#960C12"/></svg>',
  'Verbal Abuse and Threats': '🗯️',
  'Alarm and Scandal': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 17H2a3 3 0 003 3h14a3 3 0 003-3zM13 5V3h-2v2l-1 9h4l-1-9z" stroke="#960C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="19" r="1" fill="#960C12"/></svg>',
  'Lost Items': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#960C12" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="#960C12" stroke-width="2" stroke-linecap="round"/><path d="M11 8v3h3" stroke="#960C12" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'Scam/Fraud': '🎭',
  'Drugs Addiction': '💊',
  'Missing Person': '👤',
  'Others': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#960C12" stroke-width="2" stroke-linejoin="round"/><path d="M12 22V12" stroke="#960C12" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="1" fill="#960C12"/><circle cx="12" cy="17" r="1" fill="#960C12"/></svg>',
};

// Get inline SVG for category
const getCategoryInlineSVG = (category: string | undefined): string => {
  if (!category || !CATEGORY_INLINE_SVGS[category]) {
    return CATEGORY_INLINE_SVGS['Others'];
  }
  return CATEGORY_INLINE_SVGS[category];
};

const MapView = ({ userLocation, reports, hotspots }: { userLocation: LocationCoords | null; reports: Report[]; hotspots: Hotspot[] }) => {
  console.log('🗺️ MapView rendering with:', {
    userLocation: userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : 'null',
    reportsCount: reports.length,
    hotspotsCount: hotspots.length
  });

  const mapWidth = screenWidth;
  const mapHeight = screenHeight - 200;

  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [14.7942, 120.8781];
  
  console.log('🗺️ Map center:', mapCenter, 'Size:', mapWidth, 'x', mapHeight);

  // Function to get inline SVG based on category
  const getCategoryIconSVG = (category: string | undefined): string => {
    return category && CATEGORY_INLINE_SVGS[category] ? CATEGORY_INLINE_SVGS[category] : CATEGORY_INLINE_SVGS['Others'];
  };

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
            // Debug logging function
            function debugLog(message) {
                console.log('[MAP DEBUG]', message);
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
            debugLog('Initializing map...');
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

            // Category inline SVGs
            var categoryIcons = ${JSON.stringify(CATEGORY_INLINE_SVGS)};

            // Function to get icon symbol based on category
            function getCategoryIcon(category) {
                if (!category || !categoryIcons[category]) {
                    return categoryIcons['Others'] || '❗';
                }
                return categoryIcons[category];
            }

            // Function to format date safely
            function formatDate(dateString) {
                if (!dateString) return 'Not specified';
                try {
                    var date = new Date(dateString);
                    if (isNaN(date.getTime())) return 'Invalid date';
                    
                    var dateOptions = {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    };
                    var timeOptions = {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    };
                    
                    var dateStr = date.toLocaleDateString('en-US', dateOptions);
                    var timeStr = date.toLocaleTimeString('en-US', timeOptions);
                    
                    return dateStr + ' at ' + timeStr;
                } catch (e) {
                    return 'Invalid date';
                }
            }
            
            // Optimized inline SVG icons for popup display (16x20px)
            var POPUP_SVG_ICONS = {
                'Theft': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C8.66798039 7.39042358 15.33489085 16.94009308 16.33203125 28.5625 C16.35652344 29.60535156 16.38101563 30.64820313 16.40625 31.72265625 C16.44363281 32.74230469 16.48101563 33.76195312 16.51953125 34.8125 C15.27109692 46.46073592 9.95228755 56.97540443 5.01123047 67.4380188 C3.81884329 69.96289615 2.63665 72.49232756 1.45703125 75.02319336 C-0.17734869 78.52875121 -1.81503412 82.03273325 -3.45507812 85.53564453 C-6.95807273 93.02715781 -10.41437826 100.53998581 -13.8572998 108.05926514 C-14.88657508 110.30473342 -15.92016352 112.54817963 -16.95410156 114.79150391 C-17.58421455 116.16558458 -18.21410957 117.53976523 -18.84375 118.9140625 C-19.38902344 120.1007251 -19.93429687 121.2873877 -20.49609375 122.51000977 C-21.81157315 125.56526533 -22.9086277 128.61366918 -23.90625 131.78515625 C-16.79292492 123.54043937 -9.76547014 115.24361169 -2.90625 106.78515625 C-1.407105 104.95112371 0.09290322 103.11779644 1.59375 101.28515625 C2.33625 100.37765625 3.07875 99.47015625 3.84375 98.53515625 C19.59375 79.28515625 19.59375 79.28515625 21.86328125 76.51171875 C23.29874935 74.75697841 24.73368796 73.0018047 26.16796875 71.24609375 C31.40580163 64.83676775 36.66552219 58.44572429 41.92919922 52.05761719 C45.96225964 47.16196943 49.98666763 42.25949587 54 37.34765625 C57.01327364 33.6597691 60.03236433 29.97664695 63.05078125 26.29296875 C64.42483513 24.60627164 65.76846419 22.89437445 67.08203125 21.16015625 C72.39203684 14.89125645 81.01056512 10.06731661 89.09375 8.78515625 C103.06528487 7.77586065 114.00389911 9.56444717 125.125 18.83203125 C133.33960849 26.98144443 137.19006485 37.0359194 137.34375 48.47265625 C137.21314442 59.85908792 134.01176103 66.89057064 127.09375 75.78515625 C126.70155273 76.29530273 126.30935547 76.80544922 125.90527344 77.33105469 C120.05228102 84.93949005 113.99943242 92.38576925 107.93115234 99.82275391 C104.43913235 104.10846178 100.99598437 108.42790872 97.59375 112.78515625 C93.65179641 117.83362313 89.64327423 122.82258565 85.59375 127.78515625 C81.38844853 132.94263674 77.21142274 138.1198544 73.09375 143.34765625 C72.66126953 143.89486328 72.22878906 144.44207031 71.78320312 145.00585938 C68.76636801 148.85102987 65.91304138 152.79283828 63.09375 156.78515625 C64.30998047 155.64240234 64.30998047 155.64240234 65.55078125 154.4765625 C71.67512735 148.75442338 77.87494315 143.2463432 84.4140625 137.99609375 C87.22628315 135.67580675 89.91172263 133.25444491 92.59375 130.78515625 C97.04243912 126.69034013 101.63645325 122.85210103 106.35546875 119.07421875 C109.17196911 116.71976909 111.77091675 114.21446168 114.40625 111.66015625 C124.94436554 101.92682475 136.53892351 98.16780119 150.6875 98.4453125 C160.37670574 98.94683711 169.38186159 103.8932555 176.09375 110.78515625 C184.1925711 121.58358438 186.99666748 131.34361113 186.09375 144.78515625 C183.68446611 159.57241239 173.06742212 169.56070843 162.2265625 178.87109375z" transform="translate(762.90625,275.21484375)"/></svg>',
                'Reports/Agreement': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C6.59098952 6.12100385 11.90907335 13.41109724 17.30078125 20.57421875 C18.65450398 22.36491903 20.00866701 24.15528654 21.36328125 25.9453125 C22.0173999 26.810354 22.67151855 27.67539551 23.34545898 28.56665039 C25.81019833 31.80629468 28.3067358 35.02024844 30.81274414 38.22802734 C31.73699839 39.41355971 32.65315993 40.60550641 33.55639648 41.80712891 C39.55703366 49.50966131 47.64951572 54.59307253 57.30078125 56.13671875 C59.52841854 56.22919698 61.7587308 56.26671214 63.98828125 56.26171875z" transform="translate(840.69921875,636.86328125)"/></svg>',
                'Accident': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C8.66798039 7.39042358 15.33489085 16.94009308 16.33203125 28.5625 C16.35652344 29.60535156 16.38101563 30.64820313 16.40625 31.72265625 C16.44363281 32.74230469 16.48101563 33.76195312 16.51953125 34.8125 C15.27109692 46.46073592 9.95228755 56.97540443 5.01123047 67.4380188z" transform="translate(762.90625,275.21484375)"/></svg>',
                'Assault/Harassment': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C8.66798039 7.39042358 15.33489085 16.94009308 16.33203125 28.5625 C16.35652344 29.60535156 16.38101563 30.64820313 16.40625 31.72265625 C16.44363281 32.74230469 16.48101563 33.76195312 16.51953125 34.8125 C15.27109692 46.46073592 9.95228755 56.97540443 5.01123047 67.4380188 C3.81884329 69.96289615 2.63665 72.49232756 1.45703125 75.02319336 C-0.17734869 78.52875121 -1.81503412 82.03273325 -3.45507812 85.53564453 C-6.95807273 93.02715781 -10.41437826 100.53998581 -13.8572998 108.05926514 C-14.88657508 110.30473342 -15.92016352 112.54817963 -16.95410156 114.79150391 C-17.58421455 116.16558458 -18.21410957 117.53976523 -18.84375 118.9140625z" transform="translate(762.90625,275.21484375)"/></svg>',
                'Property Damage/Incident': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C2.50275936 2.19560253 4.84717343 4.41025741 7.140625 6.82421875 C7.65657227 7.35257324 8.17251953 7.88092773 8.70410156 8.42529297 C13.73276972 13.82167006 17.32732785 19.82374609 20.96069336 26.21826172 C22.80159246 29.45698307 24.67251833 32.67835783 26.5390625 35.90234375 C26.92128967 36.56431763 27.30351685 37.2262915 27.69732666 37.9083252 C31.57527223 44.61040677 35.59881463 51.22014953 39.640625 57.82421875z" transform="translate(732.859375,588.17578125)"/></svg>',
                'Animal Incident': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C0.66 0 1.32 0 2 0 C5.13566537 20.087593 8.26525628 40.1761234 11.38763428 60.26578617 C12.83757453 69.59390172 14.28949499 78.92170096 15.74609375 88.2487793 C17.0157747 96.37899481 18.28172356 104.50978118 19.54320908 112.64127249 C20.21117811 116.94611996 20.88100236 121.2506601 21.55529785 125.55452156 C22.19025019 129.60765095 22.8201994 133.66152671 23.44636536 137.71602249 C23.67671292 139.20176227 23.90886704 140.6872233 24.14299011 142.17237282 C24.46321051 144.20545956 24.77681898 146.23946423 25.08886719 148.27381897z" transform="translate(534,382)"/></svg>',
                'Alarm and Scandal': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C7.26088374 7.99783679 9.82080959 19.84417982 13 29.9375 C13.3916333 31.16122314 13.7832666 32.38494629 14.18676758 33.64575195 C16.10516257 39.67561894 17.93870663 45.71254327 19.60400391 51.81689453 C22.64822072 62.88052099 27.78630316 69.60510229 35.58984375 77.86254883 C43.13684682 85.97792904 44.89966345 93.57202418 44.765625 104.41796875z" transform="translate(402.5,676.75)"/></svg>',
                'Lost Items': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C10.95515845 9.80501059 16.95152552 23.77723019 18.19921875 38.24609375 C18.73244761 54.08067252 13.4598722 67.9524054 2.9765625 79.6640625 C-7.90438131 91.09010176 -21.8315444 96.58586703 -37.5234375 97.0390625 C-52.59518891 96.58618535 -66.05576681 91.289349 -77.03125 80.81640625z" transform="translate(935.0234375,774.3359375)"/></svg>',
                'Defamation': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C11.97866903 9.06651286 20.6937886 20.87936328 23.41015625 35.82421875 C25.327969 53.4217688 22.10444091 68.08245286 11.515625 82.3828125 C3.5755523 92.06115715 -7.3721654 98.17960501 -19.58984375 100.82421875 C-20.38261719 101.00597656 -21.17539062 101.18773437 -21.9921875 101.375 C-36.09999662 103.81469631 -50.61549855 100.49847144 -62.58984375 92.82421875z" transform="translate(597.58984375,867.17578125)"/></svg>',
                'Others': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 1080 1350" fill="#960C12"><path d="M0 0 C4.77218268 2.38609134 6.62796452 6.10272532 9.25 10.625 C9.66765625 11.33398438 10.0853125 12.04296875 10.515625 12.7734375 C11.44650101 14.3795264 12.35141051 16.00062669 13.25 17.625 C-3.97301713 39.95113331 -3.97301713 39.95113331 -12.2734375 43.79296875z" transform="translate(464.75,636.375)"/></svg>'
            };
            
            // Function to get inline SVG for incident type based on category
            function getIncidentTypeIcon(incidentType, category) {
                // Return actual SVG markup instead of Font Awesome class names
                return POPUP_SVG_ICONS[category] || POPUP_SVG_ICONS['Others'];
            }

            // Function to create category-specific icon with inline SVG
            function createCategoryIcon(category) {
                var iconContent = getCategoryIcon(category);
                
                // Check if it's an SVG (starts with '<svg') or emoji
                var isSVG = iconContent.startsWith('<svg');
                
                if (isSVG) {
                    // For SVG icons: Display in a teardrop pin shape with white background
                    return L.divIcon({
                        html: '<div style="position: relative; width: 36px; height: 44px;">' +
                              '<div style="width: 36px; height: 36px; background: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #960C12; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">' +
                              '<div style="transform: rotate(45deg); width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">' +
                              iconContent +
                              '</div>' +
                              '</div>' +
                              '</div>',
                        iconSize: [36, 44],
                        iconAnchor: [18, 40],
                        className: 'custom-reportit-pin'
                    });
                } else {
                    // For emoji fallback: Display with gradient background
                    return L.divIcon({
                        html: '<div style="position: relative; width: 32px; height: 40px;">' +
                              '<div style="width: 32px; height: 32px; background: linear-gradient(135deg, #FF6B35, #EF4444); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">' +
                              '<span style="font-size: 18px; transform: rotate(45deg); display: inline-block;">' + iconContent + '</span>' +
                              '</div>' +
                              '</div>',
                        iconSize: [32, 40],
                        iconAnchor: [16, 35],
                        className: 'custom-reportit-pin'
                    });
                }
            }

            // User location marker (only show if location is available)
            ${userLocation ? `
            debugLog('Adding user location marker at [${userLocation.latitude}, ${userLocation.longitude}]');
            try {
                L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                    .addTo(map)
                    .bindPopup('<div style="font-weight: bold; color: #EF4444;">Your Current Location</div>');
                debugLog('User location marker added');
            } catch(e) {
                debugLog('Error adding user marker: ' + e.message);
            }
            ` : 'debugLog("No user location available");'}

            // Add report markers with category-specific icons
            debugLog('Adding ${reports.length} report markers...');
            ${reports.map((report, index) => `
            try {
                debugLog('Adding marker ${index + 1}/${reports.length} at [${report.geoLocation.latitude}, ${report.geoLocation.longitude}]');
                L.marker([${report.geoLocation.latitude}, ${report.geoLocation.longitude}], {icon: createCategoryIcon('${report.category || ''}')})
                    .addTo(map)
                .bindPopup(\`
                    <div style="max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 4px;">
                        <div style="font-weight: bold; color: #FF6B35; font-size: 14px; margin-bottom: 12px; border-bottom: 2px solid #FF6B35; padding-bottom: 6px;">
                            <i class="fas fa-map-marker-alt" style="margin-right: 6px;"></i> ${report.incidentType || 'Incident Report'}
                        </div>
                        
                        <div style="margin-bottom: 8px; font-size: 12px; color: #333;">
                            <strong><i class="fas fa-home" style="margin-right: 4px;"></i> Barangay:</strong> 
                            <span style="color: #666;">${report.barangay || 'Not specified'}</span>
                        </div>
                        
                        <div style="margin-bottom: 8px; font-size: 12px; color: #333;">
                            <strong><i class="fas fa-calendar-alt" style="margin-right: 4px;"></i> Date & Time:</strong> 
                            <span style="color: #666;">${new Date('${report.dateTime}').toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        </div>
                        
                        <div style="margin-bottom: 8px; font-size: 12px; color: #333;">
                            <strong><i class="fas fa-exclamation-triangle" style="margin-right: 4px;"></i> Incident Type:</strong> 
                            <span style="color: #666;">${report.incidentType || 'Not specified'}</span>
                        </div>
                        
                        <div style="margin-bottom: 10px; font-size: 12px; color: #333;">
                            <strong><i class="fas fa-check-circle" style="margin-right: 4px;"></i> Status:</strong> 
                            <span style="
                                color: white; 
                                background-color: #22C55E;
                                padding: 4px 10px; 
                                border-radius: 12px; 
                                font-size: 11px;
                                font-weight: 600;
                                display: inline-block;
                                margin-left: 4px;
                            ">Verified</span>
                        </div>
                        
                        <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 10px;">
                            <div style="font-size: 12px; color: #333; margin-bottom: 4px;">
                                <strong><i class="fas fa-edit" style="margin-right: 4px;"></i> Description:</strong> 
                                <span style="color: #666; font-size: 11px; line-height: 1.5; display: block; max-height: 60px; overflow-y: auto;">${report.description || 'No description available'}</span>
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

  console.log('🗺️ Generated HTML length:', leafletHTML.length, 'characters');
  console.log('🗺️ HTML starts with:', leafletHTML.substring(0, 50));

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
        console.error('WebView error:', nativeEvent);
      }}
      onMessage={(event) => {
        console.log('WebView message:', event.nativeEvent.data);
      }}
      onHttpError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView HTTP error:', nativeEvent);
      }}
      originWhitelist={['*']}
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
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
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
        // Filter to only show Verified reports on the map
        const verifiedReports = result.data.filter(report => report.status === 'Verified');
        setReports(verifiedReports);
        console.log(`✅ Successfully loaded ${verifiedReports.length} verified reports out of ${result.data.length} total reports`);
        
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
            console.log('✅ User location set successfully');
          } else {
            console.warn('⚠️ Location could not be retrieved - services may be disabled');
          }
        } else {
          console.warn('⚠️ Location permission not granted');
        }
      } catch (error: any) {
        console.error('❌ Error initializing location:', error.message || error);
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
      console.log('📍 Getting current location to verify barangay vicinity...');
      const currentLocation = await locationService.getCurrentLocation();
      
      if (!currentLocation) {
        // Alert is already shown by LocationService
        return;
      }

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

      console.log('✅ User is within barangay vicinity - proceeding with report submission');
      
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      Alert.alert('Error', 'Unable to verify your eligibility. Please try again.');
      return;
    }

    if (reportCategory === 'Select type of incident') {
      Alert.alert('Error', 'Please select a category for the incident');
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
      // Get current location (we already verified it exists during vicinity check)
      console.log('📍 Getting current location for report submission...');
      const locationService = LocationService.getInstance();
      const currentLocation = await locationService.getCurrentLocation();

      if (!currentLocation) {
        // Alert is already shown by LocationService
        setIsSubmittingReport(false);
        return;
      }

      console.log('📍 Current location confirmed for report:', currentLocation);

      // Prepare report data with current location
      const reportData: CreateReportData = {
        barangay: 'Pinagbakahan', // Default barangay - could be enhanced with reverse geocoding
        description: reportDescription.trim(),
        incidentType: reportType.trim(),
        category: reportCategory !== 'Select type of incident' ? reportCategory : undefined,
        isSensitive: isSensitive,
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
        setReportCategory('Select type of incident');
        setIsSensitive(false);
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
      const locationService = LocationService.getInstance();
      const location = await locationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
        // You could also update the map center here by sending a message to the WebView
      }
      // If location is null, alert is already shown by LocationService
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
              <TouchableOpacity 
                style={styles.notNowButton}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.notNowText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.allowButton}
                onPress={() => {
                  setIsLogoutModalVisible(false);
                  // Sign out user
                  AuthService.signOut();
                  setIsUserLoggedIn(false);
                  setCurrentUser(null);
                  setUserProfile(null);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.allowText}>No</Text>
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
              {/* Category Dropdown */}
              <Text style={styles.reportLabel}>Category</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
});

export default MapScreen;