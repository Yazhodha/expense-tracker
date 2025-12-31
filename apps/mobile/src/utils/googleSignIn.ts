/**
 * Google Sign-In configuration for React Native
 *
 * This handles Google Sign-In using @react-native-google-signin package
 * and authenticates with the SAME Firebase project as the web app.
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Web Client ID from Firebase Console
 *
 * IMPORTANT: You need to configure this with your actual Web Client ID
 *
 * To get your Web Client ID:
 * 1. Go to Firebase Console → Authentication → Sign-in method → Google
 * 2. Copy the "Web client ID"
 * 3. Replace the placeholder below
 *
 * Example: '123456789-abc123def456.apps.googleusercontent.com'
 */
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID_HERE';

/**
 * Configure Google Sign-In
 * Must be called before using Google Sign-In
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

/**
 * Sign in with Google
 * Returns ID token that can be used with Firebase
 */
export const signInWithGoogle = async () => {
  try {
    // Check if device supports Google Play Services (Android)
    await GoogleSignin.hasPlayServices();

    // Sign in and get user info
    const response = await GoogleSignin.signIn();

    // Get ID token for Firebase authentication
    const { data } = response;
    if (!data?.idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    return {
      idToken: data.idToken,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
  }
};

/**
 * Check if user is signed in to Google
 */
export const isSignedInToGoogle = async () => {
  return await GoogleSignin.isSignedIn();
};
