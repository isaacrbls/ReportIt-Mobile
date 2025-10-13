import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  initializeAuth, 
  getAuth, 
  Auth
} from 'firebase/auth';
// @ts-ignore
import { getReactNativePersistence } from 'firebase/node_modules/@firebase/auth/dist/rn/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOz81U2qnC2MEq-P1yMbUiQW8qAPTh9OU",
  authDomain: "admin-76567.firebaseapp.com",
  databaseURL: "https://admin-76567-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "admin-76567",
  storageBucket: "admin-76567.firebasestorage.app",
  messagingSenderId: "189749622351",
  appId: "1:189749622351:web:35d81c4e4514b873985c3a",
  measurementId: "G-CQFJZ4N4NM"
};

const app = initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (error: any) {
  if (error?.code === 'auth/already-initialized') {
    console.log('⚠️ Firebase Auth already initialized, using existing instance');
    auth = getAuth(app);
  } else {
    console.error('❌ Error initializing Firebase Auth:', error);
    auth = getAuth(app);
  }
}

export { auth };
export const database = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;