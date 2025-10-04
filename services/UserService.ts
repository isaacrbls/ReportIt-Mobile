import { ref, set, get, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { database, storage } from '../config/firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  barangay: string;
  city: string;
  role: string; // 'user' or 'admin'
  profilePictureURL?: string;
  profilePicturePath?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  deactivatedAt?: string;
}

export interface CreateUserProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  barangay: string;
  city: string;
}

export interface UserServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class UserService {
  
  /**
   * Test database connectivity
   */
  static async testDatabaseConnection(): Promise<UserServiceResult> {
    try {
      console.log('Testing database connection...');
      const testRef = ref(database, 'test');
      await set(testRef, {
        timestamp: new Date().toISOString(),
        message: 'Database connection test'
      });
      console.log('Database connection test successful');
      
      // Clean up test data
      await remove(testRef);
      
      return {
        success: true,
        data: 'Database connection successful'
      };
    } catch (error: any) {
      console.error('Database connection test failed:', error);
      return {
        success: false,
        error: error.message || 'Database connection failed'
      };
    }
  }
  
  /**
   * Create user profile in Realtime Database
   */
  static async createUserProfile(user: User, profileData: CreateUserProfileData): Promise<UserServiceResult> {
    try {
      console.log('Creating user profile for:', user.uid, 'with data:', profileData);
      
      const userProfile: UserProfile = {
        uid: user.uid,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        email: profileData.email,
        barangay: profileData.barangay,
        city: profileData.city,
        role: 'user', // All new accounts are created with 'user' role
        createdAt: new Date().toISOString(),
        isActive: true, // New accounts are active by default
      };

      const userRef = ref(database, `users/${user.uid}`);
      console.log('Writing to database path:', `users/${user.uid}`);
      
      await set(userRef, userProfile);
      console.log('User profile created successfully in database');

      return {
        success: true,
        data: userProfile
      };
    } catch (error: any) {
      console.warn('User profile creation failed (non-critical):', error.message);
      // Don't treat database permission errors as critical failures
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
        return {
          success: false,
          error: 'Database permissions not configured yet - profile will be created when database rules are updated'
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to create user profile'
      };
    }
  }

  /**
   * Get user profile from Realtime Database
   */
  static async getUserProfile(uid: string): Promise<UserServiceResult> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val()
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user profile'
      };
    }
  }

  /**
   * Update user profile in Realtime Database
   */
  static async updateUserProfile(uid: string, updateData: Partial<UserProfile>): Promise<UserServiceResult> {
    try {
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      const userRef = ref(database, `users/${uid}`);
      await update(userRef, updates);

      return {
        success: true,
        data: updates
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update user profile'
      };
    }
  }

  /**
   * Delete user profile from Realtime Database
   */
  static async deleteUserProfile(uid: string): Promise<UserServiceResult> {
    try {
      const userRef = ref(database, `users/${uid}`);
      await remove(userRef);

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete user profile'
      };
    }
  }

  /**
   * Check if username is already taken
   */
  static async isUsernameAvailable(username: string): Promise<UserServiceResult> {
    try {
      const usernameRef = ref(database, `usernames/${username}`);
      const snapshot = await get(usernameRef);
      
      return {
        success: true,
        data: !snapshot.exists() // true if username is available
      };
    } catch (error: any) {
      console.warn('Username availability check failed:', error.message);
      // If we can't check due to permissions, assume username is available
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
        return {
          success: true,
          data: true // Assume available when we can't check
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to check username availability'
      };
    }
  }

  /**
   * Reserve username for user
   */
  static async reserveUsername(username: string, uid: string): Promise<UserServiceResult> {
    try {
      console.log('Reserving username:', username, 'for user:', uid);
      
      const usernameRef = ref(database, `usernames/${username}`);
      await set(usernameRef, {
        uid: uid,
        reservedAt: new Date().toISOString()
      });
      
      console.log('Username reserved successfully');

      return {
        success: true
      };
    } catch (error: any) {
      console.warn('Username reservation failed (non-critical):', error.message);
      // Don't treat database permission errors as critical failures
      if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
        return {
          success: false,
          error: 'Database permissions not configured yet - username will be reserved when database rules are updated'
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to reserve username'
      };
    }
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(uid: string): Promise<UserServiceResult> {
    try {
      console.log('Deactivating account for user:', uid);
      
      const userRef = ref(database, `users/${uid}`);
      const updates = {
        isActive: false,
        deactivatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await update(userRef, updates);
      
      console.log('Account deactivated successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error deactivating account:', error);
      return {
        success: false,
        error: error.message || 'Failed to deactivate account'
      };
    }
  }

  /**
   * Reactivate user account (called during login)
   */
  static async reactivateAccount(uid: string): Promise<UserServiceResult> {
    try {
      console.log('Reactivating account for user:', uid);
      
      const userRef = ref(database, `users/${uid}`);
      const updates = {
        isActive: true,
        deactivatedAt: null,
        updatedAt: new Date().toISOString()
      };
      
      await update(userRef, updates);
      
      console.log('Account reactivated successfully');
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error reactivating account:', error);
      return {
        success: false,
        error: error.message || 'Failed to reactivate account'
      };
    }
  }

  /**
   * Check if user account is active
   */
  static async isAccountActive(uid: string): Promise<UserServiceResult> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const isActive = userData.isActive !== false; // Default to true if not set
        
        return {
          success: true,
          data: isActive
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error: any) {
      console.error('Error checking account status:', error);
      return {
        success: false,
        error: error.message || 'Failed to check account status'
      };
    }
  }

  /**
   * Check if user has the required role to login
   */
  static async checkUserRole(uid: string): Promise<UserServiceResult> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const userRole = userData.role || 'user'; // Default to 'user' if not set
        
        // Only allow 'user' role to login (not admin or other roles)
        const canLogin = userRole === 'user';
        
        return {
          success: true,
          data: {
            role: userRole,
            canLogin: canLogin
          }
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error: any) {
      console.error('Error checking user role:', error);
      return {
        success: false,
        error: error.message || 'Failed to check user role'
      };
    }
  }

  /**
   * Get current user's profile data
   */
  static async getCurrentUserProfile(): Promise<UserServiceResult> {
    try {
      // Get current user from Firebase Auth
      const { auth } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      console.log('Fetching profile for current user:', currentUser.uid);
      
      // Get user profile from database
      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val() as UserProfile;
        
        // Combine Firebase Auth data with database profile data
        const completeProfile: UserProfile = {
          ...userData,
          email: currentUser.email || userData.email, // Prefer Auth email (it's always current)
          uid: currentUser.uid
        };
        
        console.log('Successfully fetched user profile');
        return {
          success: true,
          data: completeProfile
        };
      } else {
        // If no profile in database, create basic profile from Auth data
        console.log('No profile found in database, using Auth data');
        const basicProfile: Partial<UserProfile> = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          firstName: '',
          lastName: '',
          username: '',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        return {
          success: true,
          data: basicProfile
        };
      }
    } catch (error: any) {
      console.error('Error getting current user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to get user profile'
      };
    }
  }

  /**
   * Update current user's profile data
   */
  static async updateCurrentUserProfile(updates: Partial<UserProfile>): Promise<UserServiceResult> {
    try {
      const { auth } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      console.log('Updating profile for user:', currentUser.uid);
      
      const userRef = ref(database, `users/${currentUser.uid}`);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(userRef, updateData);
      
      console.log('Profile updated successfully');
      return {
        success: true,
        data: updateData
      };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Upload profile picture for the current user
   */
  static async uploadProfilePicture(imageUri: string): Promise<UserServiceResult> {
    try {
      const { auth, storage } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      console.log('Uploading profile picture for user:', currentUser.uid);

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `profile_${currentUser.uid}_${timestamp}.jpg`;
      const profilePicturePath = `profile_pictures/${currentUser.uid}/${filename}`;
      
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const imageRef = storageRef(storage, profilePicturePath);
      const uploadResult = await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      // Update user profile with new image URLs
      const profileUpdate = {
        profilePictureURL: downloadURL,
        profilePicturePath: profilePicturePath,
        updatedAt: new Date().toISOString()
      };
      
      const updateResult = await this.updateCurrentUserProfile(profileUpdate);
      
      if (updateResult.success) {
        console.log('Profile picture uploaded successfully');
        return {
          success: true,
          data: {
            profilePictureURL: downloadURL,
            profilePicturePath: profilePicturePath
          }
        };
      } else {
        return updateResult;
      }
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload profile picture'
      };
    }
  }

  /**
   * Delete current user's profile picture
   */
  static async deleteProfilePicture(): Promise<UserServiceResult> {
    try {
      const { auth, storage } = await import('../config/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      console.log('Deleting profile picture for user:', currentUser.uid);
      
      // Get current user profile to find the image path
      const profileResult = await this.getCurrentUserProfile();
      if (!profileResult.success || !profileResult.data) {
        return {
          success: false,
          error: 'Could not retrieve current user profile'
        };
      }

      const userProfile = profileResult.data as UserProfile;
      
      // If user has a profile picture, delete it from storage
      if (userProfile.profilePicturePath) {
        try {
          const { ref: storageRef, deleteObject } = await import('firebase/storage');
          const imageRef = storageRef(storage, userProfile.profilePicturePath);
          await deleteObject(imageRef);
          console.log('Profile picture deleted from storage');
        } catch (storageError: any) {
          console.warn('Could not delete image from storage:', storageError.message);
          // Continue with profile update even if storage deletion fails
        }
      }
      
      // Remove profile picture URLs from user profile
      const profileUpdate = {
        profilePictureURL: undefined,
        profilePicturePath: undefined,
        updatedAt: new Date().toISOString()
      };
      
      const updateResult = await this.updateCurrentUserProfile(profileUpdate);
      
      if (updateResult.success) {
        console.log('Profile picture removed successfully');
        return {
          success: true,
          data: { profilePictureRemoved: true }
        };
      } else {
        return updateResult;
      }
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete profile picture'
      };
    }
  }

  /**
   * Update profile picture with a new image
   */
  static async updateProfilePicture(imageUri: string): Promise<UserServiceResult> {
    try {
      console.log('Updating profile picture...');
      
      // First delete the old profile picture if it exists
      await this.deleteProfilePicture();
      
      // Then upload the new profile picture
      const uploadResult = await this.uploadProfilePicture(imageUri);
      
      if (uploadResult.success) {
        console.log('Profile picture updated successfully');
        return uploadResult;
      } else {
        return uploadResult;
      }
    } catch (error: any) {
      console.error('Error updating profile picture:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile picture'
      };
    }
  }
}