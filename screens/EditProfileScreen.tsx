import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AuthService } from '../services/AuthService';
import { UserService, UserProfile } from '../services/UserService';

interface EditProfileScreenProps {
  navigation: NavigationProp<any>;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load current user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoadingUserData(true);
    try {
      console.log('Loading current user profile...');
      const result = await UserService.getCurrentUserProfile();
      
      if (result.success && result.data) {
        const profile = result.data as UserProfile;
        setUserProfile(profile);
        setCurrentEmail(profile.email || '');
        setCurrentUsername(profile.username || '');
        console.log('✅ User profile loaded successfully:', {
          email: profile.email,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName
        });
      } else {
        console.error('❌ Failed to load user profile:', result.error);
        Alert.alert('Error', `Failed to load user data: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Exception while loading user profile:', error);
      Alert.alert('Error', `Failed to load user data: ${error.message}`);
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleSaveChanges = async () => {
    // Validate passwords if user wants to change password
    if (newPassword) {
      if (!currentPassword) {
        Alert.alert('Error', 'Please enter your current password');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long');
        return;
      }
    }

    setIsChangingPassword(true);
    
    try {
      // Change password if provided
      if (newPassword && currentPassword) {
        console.log('Attempting to change password...');
        const result = await AuthService.changePassword(currentPassword, newPassword);
        
        if (result.success) {
          Alert.alert('Success', 'Password changed successfully', [
            {
              text: 'OK',
              onPress: () => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }
            }
          ]);
        } else {
          Alert.alert('Error', result.error || 'Failed to change password');
          return;
        }
      } else {
        Alert.alert('Info', 'Enter a new password to make changes');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your account? You can reactivate it by logging in again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setIsDeactivating(true);
            
            try {
              console.log('Attempting to deactivate account...');
              const result = await AuthService.deactivateAccount();
              
              if (result.success) {
                Alert.alert(
                  'Account Deactivated', 
                  'Your account has been deactivated successfully. You can reactivate it anytime by logging in again.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Login')
                    }
                  ]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to deactivate account');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'An unexpected error occurred');
            } finally {
              setIsDeactivating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EF4444" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Icon */}
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <Icon name="user" size={24} color="#EF4444" />
          </View>
          <Text style={styles.title}>
            {isLoadingUserData ? 'Loading...' : 
             userProfile && (userProfile.firstName || userProfile.lastName) ? 
             `${userProfile.firstName} ${userProfile.lastName}`.trim() : 
             'Edit Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {isLoadingUserData ? 'Please wait...' : 'Update your password and account settings'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Current Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Email</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={isLoadingUserData ? 'Loading...' : currentEmail}
              editable={false}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Current Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Username</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={isLoadingUserData ? 'Loading...' : currentUsername}
              editable={false}
              autoCapitalize="none"
            />
          </View>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter current password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon
                  name={showCurrentPassword ? 'eye' : 'eye-slash'}
                  size={16}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? 'eye' : 'eye-slash'}
                  size={16}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm new password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'eye' : 'eye-slash'}
                  size={16}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Changes Button */}
          <TouchableOpacity 
            style={[styles.saveButton, (isChangingPassword || isLoadingUserData) && styles.disabledButton]} 
            onPress={handleSaveChanges}
            disabled={isChangingPassword || isLoadingUserData}
          >
            <Text style={styles.saveButtonText}>
              {isChangingPassword ? 'Changing Password...' : 
               isLoadingUserData ? 'Loading...' : 'Change Password'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Deactivate Account Button */}
        <View style={styles.deactivateSection}>
          <TouchableOpacity
            style={[styles.deactivateButton, (isDeactivating || isLoadingUserData) && styles.disabledButton]}
            onPress={handleDeactivateAccount}
            disabled={isDeactivating || isLoadingUserData}
          >
            <Text style={styles.deactivateButtonText}>
              {isDeactivating ? 'Deactivating...' : 
               isLoadingUserData ? 'Loading...' : 'Deactivate Account'}
            </Text>
          </TouchableOpacity>
          
          {/* Retry button if loading failed */}
          {!isLoadingUserData && !currentEmail && !currentUsername && (
            <TouchableOpacity
              style={[styles.deactivateButton, { marginTop: 16, borderColor: '#6B7280' }]}
              onPress={loadUserData}
            >
              <Text style={[styles.deactivateButtonText, { color: '#6B7280' }]}>
                Retry Loading Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  eyeButton: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deactivateSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  deactivateButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  deactivateButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
});

export default EditProfileScreen;