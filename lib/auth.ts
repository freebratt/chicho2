'use client';

import { Uzivatel } from './types';
import { loadUzivatelia, saveUzivatelia, recordUserActivity } from './storage';

// Simple hash function for client-side password hashing (NOT for production use)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Login function with hashed password verification
export const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; user?: Uzivatel; error?: string }> => {
  console.log('🔐 Attempting login for:', email, 'Remember me:', rememberMe);
  
  // Load users from localStorage
  const currentUsers = loadUzivatelia();
  console.log('📊 Loaded users from storage:', currentUsers.length, 'users');
  
  const user = currentUsers.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ User not found:', email);
    return { success: false, error: 'Nesprávne prihlasovacie údaje' };
  }

  console.log('👤 User found, verifying password...');
  
  // Hash the input password and compare with stored hash
  const passwordHash = simpleHash(password);
  console.log('🔒 Password verification - Input hash:', passwordHash, 'Stored hash:', user.hesloHash);
  
  if (user.hesloHash !== passwordHash) {
    console.log('❌ Password verification failed');
    return { success: false, error: 'Nesprávne prihlasovacie údaje' };
  }

  console.log('✅ Login successful for user:', email);
  
  // Update last login
  user.poslednePohlasenie = new Date();
  
  // Record login activity
  recordUserActivity(user.id, 'prihlasenie', 'Prihlásenie do systému');
  
  // Create auth data
  const authData = {
    userId: user.id,
    email: user.email,
    uroven: user.uroven,
    loginTime: new Date().toISOString(),
    rememberMe: rememberMe
  };

  // Store authentication based on rememberMe preference
  if (rememberMe) {
    // Persistent storage - stays until manually logged out
    localStorage.setItem('chicho_current_user', JSON.stringify(authData));
    console.log('🔑 Auth data stored in localStorage (persistent)');
  } else {
    // Session storage - cleared when browser closes
    sessionStorage.setItem('chicho_current_user', JSON.stringify(authData));
    console.log('🔑 Auth data stored in sessionStorage (session only)');
  }

  return { success: true, user };
};

// Logout function
export const logout = () => {
  console.log('👋 User logging out');
  // Clear both storage types to ensure complete logout
  localStorage.removeItem('chicho_current_user');
  sessionStorage.removeItem('chicho_current_user');
  console.log('🗑️ Auth data cleared from both localStorage and sessionStorage');
};

// Get current user from localStorage or sessionStorage
export const getCurrentUser = (): Uzivatel | null => {
  try {
    // Check localStorage first (persistent login)
    let authData = localStorage.getItem('chicho_current_user');
    let storageType = 'localStorage';
    
    // If not found in localStorage, check sessionStorage
    if (!authData) {
      authData = sessionStorage.getItem('chicho_current_user');
      storageType = 'sessionStorage';
    }
    
    if (!authData) {
      console.log('🔍 No auth data found in either storage');
      return null;
    }

    console.log('🔍 Auth data found in:', storageType);
    const parsed = JSON.parse(authData);
    
    // Load current users from localStorage
    const currentUsers = loadUzivatelia();
    const user = currentUsers.find(u => u.id === parsed.userId);
    
    if (user) {
      console.log('✅ Current user retrieved:', user.email, 'from', storageType);
    } else {
      console.log('❌ User not found in current users list, clearing auth data');
      logout(); // Clear invalid auth data
    }
    
    return user || null;
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    // Clear potentially corrupted auth data
    logout();
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user has persistent login (remember me) enabled
export const hasRememberMe = (): boolean => {
  try {
    const authData = localStorage.getItem('chicho_current_user');
    if (!authData) return false;
    
    const parsed = JSON.parse(authData);
    return parsed.rememberMe === true;
  } catch (error) {
    console.error('❌ Error checking remember me status:', error);
    return false;
  }
};

// Get auth data from storage (for debugging/info purposes)
export const getAuthData = (): any => {
  try {
    let authData = localStorage.getItem('chicho_current_user');
    let storageType = 'localStorage';
    
    if (!authData) {
      authData = sessionStorage.getItem('chicho_current_user');
      storageType = 'sessionStorage';
    }
    
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return { ...parsed, storageType };
  } catch (error) {
    console.error('❌ Error getting auth data:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.uroven === 'admin';
};

// Hash a password (for admin when creating/updating users)
export const hashPassword = (password: string): string => {
  return simpleHash(password);
};

// Update all user passwords in system (admin function)
export const updateAllUserPasswords = async (newPassword: string): Promise<boolean> => {
  const { updateAllUserPasswords: storageUpdate } = await import('./storage');
  return storageUpdate(newPassword);
};