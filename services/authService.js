import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple auth state management without Firebase
let currentUser = null;
let authStateListeners = [];

// Export simplified auth functions
export const auth = {
  currentUser: null
};

export const onAuthStateChanged = (callback) => {
  authStateListeners.push(callback);
  // Call immediately with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
};

// Notify all listeners of auth state change
const notifyAuthStateChange = (user) => {
  currentUser = user;
  auth.currentUser = user;
  authStateListeners.forEach(callback => callback(user));
};

// Check if username is available (simplified - just check if not empty)
export const checkUsernameAvailability = async (username) => {
  // Simple validation without backend
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
  
  return true;
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

// Register new user (simplified without Firebase)
export const registerUser = async (email, password, firstName, lastName, username, role = "User", barangay = "") => {
  try {
    console.log('Starting user registration process...');
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join('\n') };
    }

    // Check if username is available
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      return { success: false, error: 'Username is already taken. Please choose a different username.' };
    }

    // Simulate user creation
    const user = {
      uid: Date.now().toString(), // Simple UID generation
      email: email,
      displayName: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      username: username,
      role: role,
      barangay: barangay,
      createdAt: new Date().toISOString()
    };

    // Store user data locally
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update auth state
    notifyAuthStateChange(user);
    
    console.log('User registered successfully (local storage)');
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// Login user (simplified without Firebase)
export const loginUser = async (email, password) => {
  try {
    // Allow login with any credentials - no validation required
    const user = {
      uid: Date.now().toString(),
      email: email || 'demo@example.com',
      displayName: 'Demo User',
      firstName: 'Demo',
      lastName: 'User',
      username: 'demouser',
      role: 'User',
      barangay: 'Demo Barangay',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store user data locally
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));

    // Update auth state
    notifyAuthStateChange(user);

    console.log('User logged in successfully (local auth)');
    return { success: true, user: user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('currentUser');
    notifyAuthStateChange(null);
    console.log('User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Get user data (simplified)
export const getUserData = async (uid) => {
  try {
    const storedUser = await AsyncStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.uid === uid) {
        return { success: true, userData: userData };
      }
    }
    return { success: false, error: 'No user data found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user by username (simplified)
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
    return { success: false, error: error.message };
  }
};

// Initialize auth state from storage
export const initializeAuth = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      notifyAuthStateChange(user);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
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
  initializeAuth,
  auth,
  onAuthStateChanged
};
