import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeftIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSendVerificationCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    navigation.navigate('VerifyEmail', { email });
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

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">Forgot Password</Text>
        <Text className="text-gray-500 text-center mb-8">Enter your email to receive a verification code</Text>

        <View className="mb-5">
          <Text className="text-gray-700 text-base font-medium mb-2">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3.5 text-base bg-gray-50 text-gray-700"
            placeholder="kelianagir1@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity className="bg-red-500 rounded-xl py-4 mb-6 shadow-md" onPress={handleSendVerificationCode}>
          <Text className="text-white text-center text-lg font-semibold">Send Verification Code</Text>
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

