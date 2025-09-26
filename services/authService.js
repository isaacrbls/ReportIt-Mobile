import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';

// Firebase Authentication state management
let currentUser = null;
let authStateListeners = [];

// Export Firebase auth instance
export { auth };

export const onAuthStateChanged = (callback) => {
  // Use Firebase's built-in auth state listener - STRICT Firebase only
  if (auth && typeof auth.onAuthStateChanged === 'function') {
    return firebaseOnAuthStateChanged(auth, (user) => {
      currentUser = user;
      callback(user);
    });
  } else {
    console.error('Firebase not initialized. Cannot set up auth state listener.');
    // Return a dummy unsubscribe function
    return () => {};
  }
};

// Notify all listeners of auth state change (for development mode)
const notifyAuthStateChange = (user) => {
  currentUser = user;
  authStateListeners.forEach(callback => callback(user));
};

// Username availability check (simplified since Firebase Auth manages users by email)
export const checkUsernameAvailability = async (username) => {
  try {
    console.log('Username validation for:', username);
    
    // Check for basic requirements
    if (!username || username.length < 3) {
      return false;
    }
    
    // Check against reserved usernames
    const reservedUsernames = ['admin', 'root', 'user', 'test', 'guest'];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return false;
    }

    // Since Firebase Auth uses email as primary identifier,
    // username availability is handled locally
    return true;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!hasNumber.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  if (!hasSymbol.test(password)) {
    errors.push('Password must contain at least 1 symbol');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// Register new user using Firebase Authentication - STRICT Firebase only
export const registerUser = async (email, password, firstName, lastName, username, role = "User", barangay = "") => {
  try {
    console.log('Starting user registration with Firebase Authentication...');
    
    // Check if Firebase is properly initialized
    if (!auth || typeof auth.createUserWithEmailAndPassword !== 'function') {
      console.error('Firebase not initialized properly. Cannot register user.');
      return { 
        success: false, 
        error: 'Firebase configuration error. Please check your setup and try again.' 
      };
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('\n') };
    }

    // Check if username is available (local validation)
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      return { success: false, error: 'Username is already taken. Please choose a different username.' };
    }

    // Create user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create user object for local storage
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      username: username,
      role: role,
      barangay: barangay,
      createdAt: new Date().toISOString()
    };

    // Store additional user data locally (since Firebase Auth only stores basic info)
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('User registered successfully with Firebase Authentication');
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email is already registered. Please use a different email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'auth/invalid-api-key') {
      errorMessage = 'Firebase configuration error. Please contact support.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Login user using Firebase Authentication - STRICT Firebase only
export const loginUser = async (email, password) => {
  try {
    console.log('🔐 Attempting to login user with Firebase Authentication:', email);
    console.log('🔍 Auth object check:', {
      exists: !!auth,
      type: typeof auth,
      isNull: auth === null,
      isUndefined: auth === undefined
    });
    
    // Debug Firebase auth object
    if (auth) {
      console.log('🔍 Auth methods available:', {
        signInWithEmailAndPassword: typeof auth.signInWithEmailAndPassword,
        signOut: typeof auth.signOut,
        onAuthStateChanged: typeof auth.onAuthStateChanged,
        currentUser: auth.currentUser
      });
    }
    
    // Check if Firebase is properly initialized
    if (!auth) {
      console.error('❌ Auth object is null or undefined');
      return { 
        success: false, 
        error: 'Firebase not initialized properly. Please check your Firebase configuration.' 
      };
    }
    
    if (typeof auth !== 'object') {
      console.error('❌ Auth is not an object, type:', typeof auth);
      return { 
        success: false, 
        error: 'Firebase authentication object is invalid.' 
      };
    }
    
    // Try to access signInWithEmailAndPassword function
    if (!signInWithEmailAndPassword) {
      console.error('❌ signInWithEmailAndPassword function not imported');
      return { 
        success: false, 
        error: 'Firebase authentication function not available.' 
      };
    }
    
    // Strict validation - both email and password must be provided
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return { success: false, error: 'Email and password are required' };
    }

    // Normalize email to lowercase for consistent comparison
    const normalizedEmail = email.trim().toLowerCase();
    console.log('🔍 Attempting Firebase sign in with:', normalizedEmail);

    // Sign in with Firebase Authentication - MUST exist in Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Firebase sign in successful:', firebaseUser.email);
    
    // Verify user is properly authenticated
    if (!firebaseUser || !firebaseUser.email) {
      console.log('❌ Invalid Firebase user data');
      return { success: false, error: 'Authentication failed' };
    }

    // Check if we have additional user data stored locally
    let additionalUserData = {};
    try {
      const storedUserData = await AsyncStorage.getItem('currentUser');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        if (parsedData.uid === firebaseUser.uid) {
          additionalUserData = parsedData;
        }
      }
    } catch (error) {
      console.log('No additional user data found, using Firebase data only');
    }

    // Create user object combining Firebase Auth data with local data
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: additionalUserData.displayName || firebaseUser.displayName || 'User',
      firstName: additionalUserData.firstName || '',
      lastName: additionalUserData.lastName || '',
      username: additionalUserData.username || firebaseUser.email?.split('@')[0] || 'user',
      role: additionalUserData.role || 'User',
      barangay: additionalUserData.barangay || '',
      lastLogin: new Date().toISOString(),
      emailVerified: firebaseUser.emailVerified
    };

    // Store user data locally for offline access
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));

    console.log('User authenticated successfully with Firebase Authentication:', normalizedEmail);
    return { success: true, user: user };
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Firebase Auth errors
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.code === 'auth/invalid-api-key') {
      errorMessage = 'Firebase configuration error. Please contact support.';
    } else if (error.message && (error.message.includes('Cannot read property') || error.message.includes('app'))) {
      errorMessage = 'Firebase not properly configured. Please check your credentials.';
    }
    
    // Clear any stored user data on error
    await AsyncStorage.removeItem('currentUser');
    return { success: false, error: errorMessage };
  }
};

// Logout user from Firebase Authentication
export const logoutUser = async () => {
  try {
    // Sign out from Firebase Authentication
    await signOut(auth);
    
    // Clear local storage
    await AsyncStorage.removeItem('currentUser');
    
    console.log('User logged out successfully from Firebase Authentication');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Get user data from local storage (Firebase Auth handles basic user data)
export const getUserData = async (uid) => {
  try {
    // Get current Firebase user
    const firebaseUser = auth.currentUser;
    if (firebaseUser && firebaseUser.uid === uid) {
      // Get additional data from local storage
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return { success: true, userData: userData };
      }
      
      // Return Firebase user data if no local data
      return {
        success: true,
        userData: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          emailVerified: firebaseUser.emailVerified
        }
      };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user data:', error);
    return { success: false, error: error.message };
  }
};

// Get user by username (search in local storage)
export const getUserByUsername = async (username) => {
  try {
    const storedUser = await AsyncStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.username === username) {
        return { success: true, userData: userData };
      }
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user by username:', error);
    return { success: false, error: error.message };
  }
};

// Validate current user session against Firebase Authentication
export const validateUserSession = async () => {
  try {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return { valid: false, error: 'No user session found' };
    }

    // Firebase Auth automatically validates the session
    // Check if user is still valid
    if (firebaseUser.uid && firebaseUser.email) {
      // Get additional user data from local storage
      const storedUser = await AsyncStorage.getItem('currentUser');
      let userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        emailVerified: firebaseUser.emailVerified
      };

      if (storedUser) {
        try {
          const parsedData = JSON.parse(storedUser);
          if (parsedData.uid === firebaseUser.uid) {
            userData = { ...userData, ...parsedData };
          }
        } catch (error) {
          console.log('Error parsing stored user data');
        }
      }

      return { valid: true, userData: userData };
    }

    return { valid: false, error: 'Invalid user session' };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'Session validation failed' };
  }
};

// Initialize auth state - Firebase Auth handles this automatically
export const initializeAuth = async () => {
  try {
    console.log('Initializing Firebase Authentication...');
    
    // Firebase Auth automatically maintains auth state
    // We just need to sync any additional local data
    const firebaseUser = auth.currentUser;
    
    if (firebaseUser) {
      console.log('Firebase user found:', firebaseUser.email);
      
      // Get additional user data from local storage
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.uid === firebaseUser.uid) {
            console.log('Local user data synced with Firebase auth');
            // User data is already in sync
            return;
          }
        } catch (error) {
          console.log('Error parsing stored user data');
        }
      }
      
      // If no local data, create basic user object from Firebase data
      const basicUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        username: firebaseUser.email?.split('@')[0] || 'user',
        role: 'User',
        emailVerified: firebaseUser.emailVerified,
        lastLogin: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(basicUser));
    } else {
      console.log('No Firebase user found');
      // Clear any stale local data
      await AsyncStorage.removeItem('currentUser');
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    // Clear local data on error
    await AsyncStorage.removeItem('currentUser');
  }
};

// Default export with all functions
export default {
  loginUser,
  registerUser,
  logoutUser,
  getUserData,
  getUserByUsername,
  checkUsernameAvailability,
  validatePassword,
  validateUserSession,
  initializeAuth,
  auth,
  onAuthStateChanged
};
