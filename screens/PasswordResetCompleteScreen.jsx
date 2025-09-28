import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeftIcon, ShieldCheckIcon, CheckCircleIcon, ArrowRightIcon } from 'react-native-heroicons/outline';

export default function PasswordResetCompleteScreen({ navigation }) {
  const handleReturnToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-red-500 pt-12 pb-6 px-4">
        <TouchableOpacity className="flex-row items-center" onPress={() => navigation.goBack()}>
          <ArrowLeftIcon size={24} color="white" />
          <Text className="text-white text-lg ml-2 font-medium">Back</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-12 justify-center">
        <View className="items-center mb-8">
          <View className="bg-red-100 p-4 rounded-full mb-4">
            <ShieldCheckIcon size={48} color="#EF4444" />
          </View>
          
          <View className="bg-green-100 p-3 rounded-full">
            <CheckCircleIcon size={40} color="#10B981" />
          </View>
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-6">Password Reset Complete</Text>

        <Text className="text-gray-500 text-center mb-4">Your password has been successfully reset</Text>

        <Text className="text-gray-500 text-center mb-12">You can now login with your new password</Text>

        <TouchableOpacity className="bg-red-500 rounded-xl py-4 mb-6 flex-row items-center justify-center shadow-md" onPress={handleReturnToLogin}>
          <Text className="text-white text-center text-lg font-semibold mr-2">Return to Login</Text>
          <ArrowRightIcon size={20} color="white" />
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-500">Remember your password? </Text>
          <TouchableOpacity onPress={handleReturnToLogin}>
            <Text className="text-red-500 font-medium">Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

