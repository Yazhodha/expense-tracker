/**
 * Authentication Context for Mobile App
 *
 * Manages authentication state using React Native Firebase
 * Connects to the SAME Firebase project as the web app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import type { User } from '@expense-tracker/shared-types';
import { configureGoogleSignIn, signInWithGoogle, signOutFromGoogle } from '../utils/googleSignIn';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Configure Google Sign-In on mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Fetch or create user document from Firestore
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(firebaseUser.uid)
            .get();

          if (userDoc.exists) {
            setUser(userDoc.data() as User);
          } else {
            // Create new user document (first time sign-in)
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || '',
              settings: {
                monthlyLimit: 100000,
                billingDate: 15,
                currency: 'Rs.',
                categories: [
                  { id: '1', name: 'Food & Dining', icon: 'utensils', color: 'bg-orange-500' },
                  { id: '2', name: 'Shopping', icon: 'shopping-bag', color: 'bg-purple-500' },
                  { id: '3', name: 'Transportation', icon: 'car', color: 'bg-blue-500' },
                  { id: '4', name: 'Entertainment', icon: 'film', color: 'bg-pink-500' },
                  { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: 'bg-yellow-500' },
                  { id: '6', name: 'Healthcare', icon: 'heart-pulse', color: 'bg-red-500' },
                  { id: '7', name: 'Education', icon: 'graduation-cap', color: 'bg-indigo-500' },
                  { id: '8', name: 'Other', icon: 'more-horizontal', color: 'bg-gray-500' },
                ],
                notificationsEnabled: true,
                alertThresholds: [50, 75, 90, 100],
                theme: 'system',
              },
            };

            await firestore()
              .collection('users')
              .doc(firebaseUser.uid)
              .set(newUser);

            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load user data',
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);

      // Get Google ID token
      const { idToken } = await signInWithGoogle();

      // Create Firebase credential and sign in
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);

      Toast.show({
        type: 'success',
        text1: 'Welcome!',
        text2: 'Signed in successfully',
      });
    } catch (error: any) {
      console.error('Sign-in error:', error);

      // Handle specific error codes
      if (error.code === 'auth/cancelled') {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Sign-in was cancelled',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sign-in Error',
          text2: error.message || 'Failed to sign in with Google',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Sign out from Firebase
      await auth().signOut();

      // Sign out from Google
      await signOutFromGoogle();

      Toast.show({
        type: 'success',
        text1: 'Signed Out',
        text2: 'You have been signed out successfully',
      });
    } catch (error: any) {
      console.error('Sign-out error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to sign out',
      });
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
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
