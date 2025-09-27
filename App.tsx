import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import MapScreen from './screens/MapScreen';
import IncidentAnalysisScreen from './screens/IncidentAnalysisScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import CreateNewPasswordScreen from './screens/CreateNewPasswordScreen';
import PasswordResetCompleteScreen from './screens/PasswordResetCompleteScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{
              gestureEnabled: false,
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{
              gestureEnabled: false, // Disable swipe back for main screens
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="IncidentAnalysis" 
            component={IncidentAnalysisScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="VerifyEmail" 
            component={VerifyEmailScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="CreateNewPassword" 
            component={CreateNewPasswordScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="PasswordResetComplete" 
            component={PasswordResetCompleteScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
          <Stack.Screen 
            name="TermsAndConditions" 
            component={TermsAndConditionsScreen}
            options={{
              ...TransitionPresets.SlideFromRightIOS,
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
