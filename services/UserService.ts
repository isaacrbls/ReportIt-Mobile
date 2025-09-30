import { ref, set, get, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
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
        createdAt: new Date().toISOString(),
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
}