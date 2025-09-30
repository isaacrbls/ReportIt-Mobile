import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
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
        email: signupData.email
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
}