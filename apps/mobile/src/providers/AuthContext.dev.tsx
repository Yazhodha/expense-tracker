/**
 * Development-only Auth Context
 * This version works without Firebase config files for testing the UI
 *
 * To use: Temporarily swap this file with AuthContext.tsx for testing
 */

import React, { createContext, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import type { User } from '@expense-tracker/shared-types';

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);

      // Simulate sign-in delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock user for testing
      const mockUser: User = {
        uid: 'dev-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: '',
        settings: {
          monthlyLimit: 100000,
          billingDate: 15,
          currency: 'Rs.',
          categories: [
            { id: '1', name: 'Food & Dining', icon: 'utensils', color: 'bg-orange-500' },
            { id: '2', name: 'Shopping', icon: 'shopping-bag', color: 'bg-purple-500' },
            { id: '3', name: 'Transportation', icon: 'car', color: 'bg-blue-500' },
          ],
          notificationsEnabled: true,
          alertThresholds: [50, 75, 90, 100],
          theme: 'system',
        },
      };

      setUser(mockUser);

      Toast.show({
        type: 'success',
        text1: 'Development Mode',
        text2: 'Signed in with mock user (no Firebase)',
      });
    } catch (error: any) {
      console.error('Mock sign-in error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign in',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    Toast.show({
      type: 'info',
      text1: 'Signed Out',
      text2: 'Mock user signed out',
    });
  };

  const value: AuthContextType = {
    user,
    firebaseUser: null,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
