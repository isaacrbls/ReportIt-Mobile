import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { LaunchUtils } from './utils/LaunchUtils';

import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import CreateNewPasswordScreen from './screens/CreateNewPasswordScreen';
import PasswordResetCompleteScreen from './screens/PasswordResetCompleteScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import MapScreen from './screens/MapScreen';
import IncidentAnalysisScreen from './screens/IncidentAnalysisScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      setIsFirstLaunch(hasLaunchedBefore === null);
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(true);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsLaunched = async () => {
    try {
      await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error marking app as launched:', error);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF4444' }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaProvider>
    );
  }

  const initialRouteName = isFirstLaunch ? "Welcome" : "Map";

  const handleNavigationStateChange = (state: any) => {
    if (isFirstLaunch && state?.routes) {
      const currentRoute = state.routes[state.index];
      if (currentRoute.name !== 'Welcome') {
        markAsLaunched();
      }
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer onStateChange={handleNavigationStateChange}>
        <Stack.Navigator 
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
          <Stack.Screen name="PasswordResetComplete" component={PasswordResetCompleteScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
          <Stack.Screen name="IncidentAnalysis" component={IncidentAnalysisScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
