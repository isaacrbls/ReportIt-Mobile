import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeftIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';

export default function VerifyEmailScreen({ navigation, route }) {
  const [verificationCode, setVerificationCode] = useState('');
  const { email } = route.params;

  const handleResetPassword = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    navigation.navigate('CreateNewPassword', { email, code: verificationCode });
  };

  const handleResendCode = () => {
    Alert.alert('Success', 'Verification code sent again');
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-red-500 pt-12 pb-6 px-4">
        <TouchableOpacity className="flex-row items-center" onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color="white" />
          <Text className="text-white text-lg ml-2 font-medium">Back</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-12">
        <View className="items-center mb-8">
          <View className="bg-red-100 p-4 rounded-full">
            <ShieldCheckIcon size={48} color="#EF4444" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">Verify your Email</Text>
        <Text className="text-gray-500 text-center mb-8">Enter the 6-digit code sent to your email</Text>

        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <Text className="text-red-600 text-sm">
            We've sent a verification code to {email}{'\n'}
            Please check your inbox.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 text-base font-medium mb-2">Verification Code</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-center bg-gray-50 text-gray-700"
            style={{ letterSpacing: 2 }}
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View className="flex-row justify-end mb-6">
          <TouchableOpacity onPress={handleResendCode}>
            <Text className="text-red-500 font-medium">Resend code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-red-500 rounded-xl py-4 mb-6 shadow-md" onPress={handleResetPassword}>
          <Text className="text-white text-center text-lg font-semibold">Reset Password</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-500">Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-red-500 font-medium">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

