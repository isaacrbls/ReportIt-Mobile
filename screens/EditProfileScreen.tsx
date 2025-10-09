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
  Image,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import {
  useFonts,
  Poppins_500Medium,
} from '@expo-google-fonts/poppins';
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
  
  // Profile picture states
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
        setProfileImageUri(profile.profilePictureURL || null);
        console.log('✅ User profile loaded successfully:', {
          email: profile.email,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          profilePictureURL: profile.profilePictureURL
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

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable gallery access to select profile picture');
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable camera access to take profile picture');
      return false;
    }

    return true;
  };

  const showImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Remove Photo'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: profileImageUri ? 3 : -1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openGallery();
          } else if (buttonIndex === 3 && profileImageUri) {
            removeProfilePicture();
          }
        }
      );
    } else {
      // Android alert
      const options: any[] = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Gallery', onPress: openGallery },
      ];
      
      if (profileImageUri) {
        options.push({ text: 'Remove Photo', onPress: removeProfilePicture, style: 'destructive' });
      }
      
      Alert.alert('Profile Picture', 'Choose an option', options);
    }
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadProfilePicture(imageUri);
      }
    } catch (error: any) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadProfilePicture(imageUri);
      }
    } catch (error: any) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const uploadProfilePicture = async (imageUri: string) => {
    setIsUploadingImage(true);
    try {
      console.log('Uploading profile picture...');
      const result = await UserService.uploadProfilePicture(imageUri);
      
      if (result.success && result.data) {
        setProfileImageUri(result.data.profilePictureURL);
        Alert.alert('Success', 'Profile picture updated successfully');
        
        // Reload user data to get updated profile
        await loadUserData();
      } else {
        console.error('Failed to upload profile picture:', result.error);
        Alert.alert('Error', result.error || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    Alert.alert(
      'Remove Profile Picture',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsUploadingImage(true);
            try {
              const result = await UserService.deleteProfilePicture();
              
              if (result.success) {
                setProfileImageUri(null);
                Alert.alert('Success', 'Profile picture removed successfully');
                
                // Reload user data to get updated profile
                await loadUserData();
              } else {
                console.error('Failed to remove profile picture:', result.error);
                Alert.alert('Error', result.error || 'Failed to remove profile picture');
              }
            } catch (error: any) {
              console.error('Error removing profile picture:', error);
              Alert.alert('Error', 'Failed to remove profile picture');
            } finally {
              setIsUploadingImage(false);
            }
          },
        },
      ]
    );
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
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileImageContainer} 
            onPress={showImagePicker}
            disabled={isUploadingImage}
          >
            {profileImageUri ? (
              <Image 
                source={{ uri: profileImageUri }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileIcon}>
                <Icon name="user" size={40} color="#EF4444" />
              </View>
            )}
            {isUploadingImage && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Icon name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {isLoadingUserData ? 'Loading...' : 
             userProfile && (userProfile.firstName || userProfile.lastName) ? 
             `${userProfile.firstName} ${userProfile.lastName}`.trim() : 
             'Edit Profile'}
          </Text>
          <Text style={styles.subtitle}>
            {isLoadingUserData ? 'Please wait...' : 'Update your profile picture and account settings'}
          </Text>
          <TouchableOpacity onPress={showImagePicker} disabled={isUploadingImage}>
            <Text style={styles.changePhotoText}>
              {profileImageUri ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 8,
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
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
});

export default EditProfileScreen;