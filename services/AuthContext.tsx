import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { SessionManager } from '../utils/SessionManager';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up Firebase Auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.email || 'No user');
      
      if (user && !user.isAnonymous) {
        // User is authenticated - update session storage
        console.log('✅ User authenticated, updating session...');
        await SessionManager.setRegisteredUserSession({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
        });
      } else if (!user) {
        // User is logged out - but don't clear session here
        // Let the signOut method handle session clearing
        console.log('⚠️ No authenticated user');
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('🔐 Cleaning up Auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};