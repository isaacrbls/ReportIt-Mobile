// Firebase configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your actual Firebase project configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAOz81U2qnC2MEq-P1yMbUiQW8qAPTh9OU", // Your Web API key from Firebase Console
  authDomain: "admin-76567.firebaseapp.com", // Your auth domain
  databaseURL: "https://admin-76567-default-rtdb.asia-southeast1.firebasedatabase.app", // Your database URL
  projectId: "admin-76567", // Your project ID
  storageBucket: "admin-76567.firebasestorage.app", // Your storage bucket
  messagingSenderId: "189749622351", // Your messaging sender ID
  appId: "1:189749622351:web:35d81c4e4514b373985c3a", // Your Web App ID from Firebase Console
  measurementId: "G-CQFJZ4N4NM" // Optional - for Analytics
};

// Initialize Firebase with better error handling
let app = null;
let auth = null;

try {
  console.log('🔥 Starting Firebase initialization...');
  console.log('Config check - apiKey exists:', !!firebaseConfig.apiKey);
  console.log('Config check - projectId:', firebaseConfig.projectId);
  console.log('Config check - appId exists:', !!firebaseConfig.appId);
  
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('✅ Using existing Firebase app');
  }
  
  // Initialize Auth with better error handling
  try {
    console.log('🔐 Initializing Firebase Auth...');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('✅ Firebase Auth initialized with React Native persistence');
  } catch (authError) {
    console.log('⚠️ InitializeAuth failed, falling back to getAuth...', authError.message);
    auth = getAuth(app);
    console.log('✅ Firebase Auth initialized with getAuth fallback');
  }
  
  // Verify auth object is properly created
  if (auth && typeof auth === 'object') {
    console.log('✅ Firebase Auth object created successfully');
    console.log('Auth methods available:', {
      signInWithEmailAndPassword: typeof auth.signInWithEmailAndPassword,
      onAuthStateChanged: typeof auth.onAuthStateChanged,
      currentUser: auth.currentUser
    });
  } else {
    throw new Error('Auth object not created properly');
  }
  
} catch (error) {
  console.error('❌ Firebase initialization failed:');
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('Full error:', error);
  
  // Set auth to null so we can detect the failure
  auth = null;
  app = null;
}

// Additional verification
if (auth) {
  console.log('🎉 Firebase setup complete - Authentication ready!');
} else {
  console.error('💥 Firebase setup failed - Authentication not available');
}

export { auth };
export default app;