import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MapPinIcon, ShieldCheckIcon } from 'react-native-heroicons/solid';
import * as Location from 'expo-location';
import Logo from './components/Logo';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MapScreen from './screens/MapScreen';
import IncidentAnalysisScreen from './screens/IncidentAnalysisScreen';

// NOTE: This file is currently NOT used. Entry -> index.js -> App.js.
// Remove this file or merge needed parts into App.js to avoid confusion.

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // Start with welcome screen
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  // Request location permission and start watching
  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Location access is required for full functionality. You can enable it later in settings.',
          [{ text: 'OK' }]
        );
        // Fallback to Malolos coordinates
        setUserLocation({
          latitude: 14.8432,
          longitude: 120.8126,
        });
        return;
      }

      setLocationPermission(true);
      await startLocationTracking();
    } catch (error) {
      console.warn('Permission error:', error);
      // Fallback to Malolos coordinates
      setUserLocation({
        latitude: 14.8432,
        longitude: 120.8126,
      });
    }
  };

  // Start continuous location tracking
  const startLocationTracking = async () => {
    try {
      // Get initial location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
      
      setLocationSubscription(subscription);
    } catch (error) {
      console.log('Location tracking error:', error);
      // Fallback to Malolos coordinates if location fails
      setUserLocation({
        latitude: 14.8432,
        longitude: 120.8126,
      });
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  // Clean up location tracking when component unmounts
  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, [locationSubscription]);

  // Request location permission when app starts
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Handle logout - simplified without Firebase
  const handleLogout = async () => {
    try {
      stopLocationTracking();
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Simple navigation object
  const navigation = {
    navigate: (screenName) => {
      if (screenName === 'IncidentAnalysis') {
        setCurrentScreen('analysis');
      }
    },
    goBack: () => {
      if (currentScreen === 'analysis') {
        setCurrentScreen('map');
      }
    }
  };

  if (currentScreen === 'analysis') {
    return (
      <IncidentAnalysisScreen 
        navigation={navigation}
      />
    );
  }

  if (currentScreen === 'map') {
    return (
      <MapScreen 
        onLogout={handleLogout}
        navigation={navigation}
        userLocation={userLocation}
        user={null}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen 
        onBack={() => setCurrentScreen('welcome')}
        onSignup={() => setCurrentScreen('signup')}
        onLogin={(userData) => {
          setCurrentScreen('map');
        }}
      />
    );
  }

  if (currentScreen === 'signup') {
    return (
      <SignupScreen 
        onBack={() => setCurrentScreen('welcome')}
        onLogin={() => setCurrentScreen('login')}
        onSignup={(userData) => {
          setCurrentScreen('map');
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Logo size={32} color="white" />
          <Text style={styles.headerTitle}>ReportIt</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Welcome to ReportIt
          </Text>
          <Text style={styles.welcomeSubtitle}>
            A Machine Learning-Driven Mobile Application for Dynamic Theft Risk Assessment Using Crowd-Sourced Reports
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          {/* Real-time Risk Assessment Card */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <MapPinIcon size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>
                Real-time Risk Assessment
              </Text>
              <Text style={styles.cardDescription}>
                View dynamic theft risk maps based on crowd-sourced reports and machine learning analysis.
              </Text>
            </View>
          </View>

          {/* Community Protection Card */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <ShieldCheckIcon size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>
                Community Protection
              </Text>
              <Text style={styles.cardDescription}>
                Contribute to community safety by reporting incidents and helping others stay informed.
              </Text>
            </View>
          </View>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setCurrentScreen('signup')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => setCurrentScreen('login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#EF4444',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#6B7280',
  },
  linkText: {
    color: '#EF4444',
  },
});