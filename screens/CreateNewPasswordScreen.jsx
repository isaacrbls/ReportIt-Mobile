import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeftIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';

export default function CreateNewPasswordScreen({ navigation, route }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { email } = route.params;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    navigation.navigate('PasswordResetComplete');
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

        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">Create New Password</Text>
        <Text className="text-gray-500 text-center mb-8">Create a new secure password for your account</Text>

        <View className="mb-5">
          <Text className="text-gray-700 text-base font-medium mb-2">New Password</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 pr-12 text-base bg-gray-50 text-gray-700"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity className="absolute right-3 top-3.5" onPress={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? (
                <EyeSlashIcon size={24} color="#6B7280" />
              ) : (
                <EyeIcon size={24} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-gray-700 text-base font-medium mb-2">Confirm New Password</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3.5 pr-12 text-base bg-gray-50 text-gray-700"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity className="absolute right-3 top-3.5" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeSlashIcon size={24} color="#6B7280" />
              ) : (
                <EyeIcon size={24} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>
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

