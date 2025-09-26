import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import SignupScreen from './screens/SignupScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import IncidentAnalysisScreen from './screens/IncidentAnalysisScreen.jsx';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen.jsx';
import VerifyEmailScreen from './screens/VerifyEmailScreen.jsx';
import CreateNewPasswordScreen from './screens/CreateNewPasswordScreen.jsx';
import PasswordResetCompleteScreen from './screens/PasswordResetCompleteScreen.jsx';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="IncidentAnalysis" component={IncidentAnalysisScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
        <Stack.Screen name="PasswordResetComplete" component={PasswordResetCompleteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}