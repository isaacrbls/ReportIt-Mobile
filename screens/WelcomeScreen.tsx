import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import LocationService from '../services/LocationService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';


const ShieldIcon = ({ size = 24, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationIcon = ({ size = 24, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </Svg>
);

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [slideAnim] = useState(new Animated.Value(100));


  useEffect(() => {
    if (!fontsLoaded) return;

    const checkLocationServices = async () => {
      const locationService = LocationService.getInstance();
      const isEnabled = await locationService.isLocationEnabled();
      if (!isEnabled) {
        console.log('Location services are disabled');
      }
    };

    checkLocationServices();


    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fontsLoaded, slideAnim]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ShieldIcon size={32} color="white" />
          <Text style={styles.headerTitle}>ReportIt</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome to ReportIt</Text>
          <Text style={styles.welcomeSubtitle}>
            A Machine Learning-Driven Mobile Application for Dynamic{'\n'}
            Theft Risk Assessment Using Crowd-Sourced Reports
          </Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.cardsContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <LocationIcon size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>Real-time Risk Assessment</Text>
              <Text style={styles.cardDescription}>
                View dynamic theft risk maps based on{'\n'}
                crowd-sourced reports and machine{'\n'}
                learning analysis.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <ShieldIcon size={24} color="white" />
              </View>
              <Text style={styles.cardTitle}>Community Protection</Text>
              <Text style={styles.cardDescription}>
                Contribute to community safety by{'\n'}
                reporting incidents and helping others{'\n'}
                stay informed.
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeSection: {
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  getStartedButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;