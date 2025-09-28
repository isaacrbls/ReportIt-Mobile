import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';
import authService from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('kelianagir1@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      const result = await authService.loginUser(email, password);
      if (result.success) {
        navigation.navigate('Map');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
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

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }}>
        {/* Icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 50 }}>
            <ShieldCheckIcon size={40} color="#EF4444" />
          </View>
        </View>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
          Login to ReportIt
        </Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 32, fontSize: 16 }}>
          Enter your credentials to access your account
        </Text>

        {/* Email Input */}
        <View style={{ marginBottom: 20 }}>
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
            placeholder="kelianagir1@gmail.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#374151', fontSize: 16, fontWeight: '500' }}>Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '500' }}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
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

        {/* Remember Me */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={{ 
            width: 20, 
            height: 20, 
            borderRadius: 4, 
            borderWidth: 2, 
            borderColor: rememberMe ? '#EF4444' : '#9CA3AF', 
            marginRight: 12,
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: rememberMe ? '#EF4444' : 'white' 
          }}>
            {rememberMe && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
          </View>
          <Text style={{ color: '#374151', fontSize: 16 }}>Remember me</Text>
        </TouchableOpacity>

        {/* Login Button */}
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
          onPress={handleLogin}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Login</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={{ color: '#EF4444', fontWeight: '500', fontSize: 16 }}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}