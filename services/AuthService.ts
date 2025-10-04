import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserService, CreateUserProfileData } from './UserService';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SignupData extends CreateUserProfileData {
  password: string;
}

export class AuthService {
  
  /**
   * Sign in user with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check user role first
      console.log('Checking user role for:', userCredential.user.uid);
      const roleResult = await UserService.checkUserRole(userCredential.user.uid);
      
      if (roleResult.success && roleResult.data) {
        if (!roleResult.data.canLogin) {
          // Sign out immediately if user doesn't have 'user' role
          await signOut(auth);
          console.log('Login denied: User does not have the required role');
          return {
            success: false,
            error: 'Access denied. Only user accounts can login to this application.'
          };
        }
      }
      
      // Check if account needs reactivation (if it was deactivated)
      console.log('Checking account status for user:', userCredential.user.uid);
      const statusResult = await UserService.isAccountActive(userCredential.user.uid);
      
      if (statusResult.success && statusResult.data === false) {
        // Account was deactivated, reactivate it
        console.log('Account was deactivated, reactivating...');
        await UserService.reactivateAccount(userCredential.user.uid);
        console.log('Account reactivated successfully');
      }
      
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      // Don't log the error to console for invalid credentials
      // Just return the user-friendly error message
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Sign up user with email, password, and profile data
   */
  static async signUpWithProfile(signupData: SignupData): Promise<AuthResult> {
    try {
      console.log('Starting signup process for:', signupData.email);
      
      // Skip username check temporarily due to database permission issues
      // First check if username is available
      // console.log('Checking username availability:', signupData.username);
      // const usernameCheck = await UserService.isUsernameAvailable(signupData.username);
      // if (!usernameCheck.success) {
      //   console.error('Username check failed:', usernameCheck.error);
      //   return {
      //     success: false,
      //     error: usernameCheck.error
      //   };
      // }
      
      // if (!usernameCheck.data) {
      //   console.log('Username already taken:', signupData.username);
      //   return {
      //     success: false,
      //     error: 'Username is already taken. Please choose a different username.'
      //   };
      // }

      // Create Firebase Auth account
      console.log('Creating Firebase Auth account...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupData.email, 
        signupData.password
      );
      console.log('Firebase Auth account created for:', userCredential.user.uid);

      // Try to create user profile in Realtime Database (but don't fail if it doesn't work)
      const profileData: CreateUserProfileData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        username: signupData.username,
        email: signupData.email,
        barangay: signupData.barangay,
        city: signupData.city
      };

      console.log('Attempting to create user profile in database...');
      const profileResult = await UserService.createUserProfile(userCredential.user, profileData);
      
      if (!profileResult.success) {
        console.warn('Profile creation failed but continuing with auth:', profileResult.error);
        // Don't fail the entire signup process if database write fails
        // The user account is still created in Firebase Auth
      } else {
        console.log('User profile created successfully');
      }

      // Try to reserve the username (but don't fail if it doesn't work)
      console.log('Attempting to reserve username...');
      const reserveResult = await UserService.reserveUsername(signupData.username, userCredential.user.uid);
      if (!reserveResult.success) {
        console.warn('Username reservation failed but continuing:', reserveResult.error);
        // This is not critical for the signup process
      }

      console.log('Signup process completed successfully');
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      console.error('Signup process failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<AuthResult> {
    try {
      await signOut(auth);
      return {
        success: true
      };
    } catch (error: any) {
      // Don't log the error to console for sign out errors
      // Just return the user-friendly error message
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Simple sign up user with email and password only (no database operations)
   */
  static async signUpSimple(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Creating simple Firebase Auth account for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('Firebase Auth account created successfully for:', userCredential.user.uid);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error: any) {
      console.error('Simple signup failed:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Convert Firebase auth error to user-friendly message
   */
  private static getErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials.';
      default:
        return error.message || 'An error occurred during authentication.';
    }
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      console.log('Password updated successfully');
      return {
        success: true,
        user: user
      };
    } catch (error: any) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: this.getPasswordChangeErrorMessage(error)
      };
    }
  }

  /**
   * Deactivate current user account
   */
  static async deactivateAccount(): Promise<AuthResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user is currently signed in'
        };
      }

      // Deactivate in database
      const result = await UserService.deactivateAccount(user.uid);
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to deactivate account'
        };
      }

      // Sign out the user after deactivation
      await signOut(auth);
      
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
   * Convert password change errors to user-friendly messages
   */
  private static getPasswordChangeErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/wrong-password':
        return 'Current password is incorrect.';
      case 'auth/weak-password':
        return 'New password should be at least 6 characters long.';
      case 'auth/requires-recent-login':
        return 'For security reasons, please sign in again before changing your password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'Failed to change password.';
    }
  }
}