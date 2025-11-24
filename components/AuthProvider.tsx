'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, Uzivatel } from '@/lib/types';
import { getCurrentUser, logout as authLogout, updateAllUserPasswords } from '@/lib/auth';
import { initializeStorage } from '@/lib/storage';

interface AuthContextType extends AuthState {
  login: (user: Uzivatel) => void;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  const checkAuth = () => {
    console.log('Checking authentication status');
    const user = getCurrentUser();
    setAuthState({
      isAuthenticated: !!user,
      user
    });
  };

  const login = (user: Uzivatel) => {
    console.log('User logged in:', user.email);
    setAuthState({
      isAuthenticated: true,
      user
    });
  };

  const logout = () => {
    console.log('User logging out from context');
    authLogout();
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  };

  useEffect(() => {
    console.log('🔧 AuthProvider initializing...');
    
    // Initialize storage with default data first (only if not already initialized)
    console.log('🔄 Initializing storage...');
    initializeStorage();
    
    // Update all user passwords to Chicho123 (ensure consistency)
    console.log('🔒 Updating user passwords...');
    updateAllUserPasswords('Chicho123').then(success => {
      if (success) {
        console.log('✅ User passwords updated successfully');
      } else {
        console.log('❌ Failed to update user passwords');
      }
      
      // After password update, check for existing authentication
      console.log('🔐 Checking for existing authentication...');
      const user = getCurrentUser();
      
      if (user) {
        console.log('✅ Auto-login successful for user:', user.email);
        setAuthState({
          isAuthenticated: true,
          user
        });
      } else {
        console.log('ℹ️ No valid authentication found');
        setAuthState({
          isAuthenticated: false,
          user: null
        });
      }
    });
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};