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
import { SessionManager } from './utils/SessionManager';

import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import MapScreen from './screens/MapScreen';
import IncidentAnalysisScreen from './screens/IncidentAnalysisScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ViewReportsScreen from './screens/ViewReportsScreen';

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
      console.log('🔍 Checking app startup state...');
      
      // Check if this is first launch
      const hasLaunched = await SessionManager.hasLaunchedBefore();
      setIsFirstLaunch(!hasLaunched);
      
      // Log session debug info
      const sessionInfo = await SessionManager.getSessionDebugInfo();
      console.log('📊 Session state:', sessionInfo);
      
    } catch (error) {
      console.error('❌ Error checking first launch:', error);
      setIsFirstLaunch(true);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsLaunched = async () => {
    try {
      await SessionManager.markAsLaunched();
      await SessionManager.markWelcomeAsSeen();
      setIsFirstLaunch(false);
      console.log('✅ App marked as launched');
    } catch (error) {
      console.error('❌ Error marking app as launched:', error);
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

  // Determine initial route following the startup flow:
  // 1. Check Firebase Auth (persisted via AsyncStorage)
  // 2. If authenticated → go to Map
  // 3. If not authenticated but first launch → go to Welcome
  // 4. Otherwise → go to Login
  const initialRouteName = isAuthenticated 
    ? "Map" 
    : (isFirstLaunch ? "Welcome" : "Login");

  console.log('🔐 App startup decision:', {
    isAuthenticated,
    isFirstLaunch,
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
            name="ViewReports" 
            component={ViewReportsScreen}
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
