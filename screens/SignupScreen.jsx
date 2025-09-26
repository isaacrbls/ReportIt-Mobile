import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';
import authService from '../services/authService';

export default function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSignup = async () => {
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      const result = await authService.registerUser(email, password, firstName, lastName, username, 'User', '');
      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Map') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#EF4444', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 16 }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '500', marginLeft: 8 }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        {/* Logo/Icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 50 }}>
            <ShieldCheckIcon size={40} color="#EF4444" />
          </View>
        </View>

        {/* Title and Subtitle */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
          Create Account
        </Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
          Join ReportIt to help keep your community safe
        </Text>

        {/* Form Fields */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>First Name</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 14, 
              fontSize: 16, 
              backgroundColor: '#F9FAFB',
              color: '#374151'
            }}
            placeholder="Enter your first name"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Last Name</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 14, 
              fontSize: 16, 
              backgroundColor: '#F9FAFB',
              color: '#374151'
            }}
            placeholder="Enter your last name"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Username</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 14, 
              fontSize: 16, 
              backgroundColor: '#F9FAFB',
              color: '#374151'
            }}
            placeholder="Choose a username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Email</Text>
          <TextInput
            style={{ 
              borderWidth: 1, 
              borderColor: '#D1D5DB', 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 14, 
              fontSize: 16, 
              backgroundColor: '#F9FAFB',
              color: '#374151'
            }}
            placeholder="Enter your email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#D1D5DB', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 14, 
                paddingRight: 50,
                fontSize: 16, 
                backgroundColor: '#F9FAFB',
                color: '#374151'
              }}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 16, top: 14 }}
            >
              {showPassword ? (
                <EyeSlashIcon size={22} color="#6B7280" />
              ) : (
                <EyeIcon size={22} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500', marginBottom: 8 }}>Confirm Password</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#D1D5DB', 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 14, 
                paddingRight: 50,
                fontSize: 16, 
                backgroundColor: '#F9FAFB',
                color: '#374151'
              }}
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: 16, top: 14 }}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon size={22} color="#6B7280" />
              ) : (
                <EyeIcon size={22} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}
          onPress={() => setAgreeToTerms(!agreeToTerms)}
        >
          <View style={{ 
            width: 20, 
            height: 20, 
            borderRadius: 4, 
            borderWidth: 2, 
            borderColor: agreeToTerms ? '#EF4444' : '#9CA3AF', 
            marginRight: 12, 
            marginTop: 2,
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: agreeToTerms ? '#EF4444' : 'white' 
          }}>
            {agreeToTerms && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
          </View>
          <Text style={{ color: '#374151', flex: 1, fontSize: 16 }}>
            I Agree to the{' '}
            <Text style={{ color: '#EF4444', fontWeight: '500' }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: '#EF4444', fontWeight: '500' }}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#EF4444', 
            borderRadius: 12, 
            paddingVertical: 16, 
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}
          onPress={handleSignup}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Create Account</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#EF4444', fontWeight: '500', fontSize: 16 }}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
