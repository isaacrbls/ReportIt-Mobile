import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, BackHandler, Platform, AppState, AppStateStatus } from 'react-native';
import { LaunchUtils } from './utils/LaunchUtils';
import { NavigationHelper } from './utils/NavigationHelper';
import { AuthProvider, useAuth } from './services/AuthContext';

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

function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  // App lifecycle handler (onResume, onPause, onShutdown)
  useEffect(() => {
    console.log('🔄 Setting up app lifecycle listener');
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(`🔄 App state changed to: ${nextAppState}`);
      
      if (nextAppState === 'active') {
        console.log('✅ App has come to foreground (onResume)');
        // App resumed - you can refresh data, re-check auth, resume operations here
      } else if (nextAppState === 'background') {
        console.log('⏸️ App has gone to background (onPause)');
        // App paused - you can save state, cleanup, pause operations here
      } else if (nextAppState === 'inactive') {
        console.log('🔄 App is transitioning (onInactive)');
        // App is transitioning between states (e.g., incoming call, control center)
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Log initial app state
    console.log(`🔄 Initial app state: ${AppState.currentState}`);

    return () => {
      console.log('🔄 Removing app lifecycle listener');
      subscription?.remove();
    };
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

  // Show loading while checking auth state or first launch
  if (isLoading || authLoading) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EF4444' }}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </SafeAreaProvider>
    );
  }

  // Determine initial route:
  // 1. If user is authenticated, go to Map
  // 2. If first launch, go to Welcome
  // 3. Otherwise, go to Login
  const initialRouteName = isAuthenticated 
    ? "Map" 
    : (isFirstLaunch ? "Welcome" : "Login");

  console.log('🔐 Auth state:', {
    isAuthenticated,
    userEmail: user?.email || 'No user',
    initialRoute: initialRouteName
  });

  const handleNavigationStateChange = (state: any) => {
    if (isFirstLaunch && state?.routes) {
      const currentRoute = state.routes[state.index];
      if (currentRoute.name !== 'Welcome') {
        markAsLaunched();
      }
    }

    // Log navigation for debugging logical flow
    if (state?.routes) {
      const currentRoute = state.routes[state.index];
      const previousRoute = state.routes[state.index - 1];
      console.log('Navigation:', {
        current: currentRoute?.name,
        previous: previousRoute?.name,
        stackLength: state.routes.length
      });
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer 
        onStateChange={handleNavigationStateChange}
        onReady={() => {
          console.log('Navigation container is ready');
        }}
        onUnhandledAction={(action) => {
          console.warn('Unhandled navigation action:', action);
        }}
      >
        <Stack.Navigator 
          initialRouteName={initialRouteName}
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ 
              gestureEnabled: false, // No back from welcome
              animationTypeForReplace: 'push'
            }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              gestureEnabled: false, // Custom back handler (exit app)
              animationTypeForReplace: 'push'
            }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to login
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to login
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="VerifyEmail" 
            component={VerifyEmailScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to forgot password
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="CreateNewPassword" 
            component={CreateNewPasswordScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to verify email
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="PasswordResetComplete" 
            component={PasswordResetCompleteScreen}
            options={{ 
              gestureEnabled: false, // No back from completion screen
              animationTypeForReplace: 'push'
            }}
          />
          <Stack.Screen 
            name="TermsAndConditions" 
            component={TermsAndConditionsScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to signup
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{ 
              gestureEnabled: false, // Map is home base, custom back handler
              animationTypeForReplace: 'push'
            }}
          />
          <Stack.Screen 
            name="IncidentAnalysis" 
            component={IncidentAnalysisScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to map
              gestureDirection: 'horizontal'
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ 
              gestureEnabled: true, // Can swipe back to map
              gestureDirection: 'horizontal'
            }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Wrapper component with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
