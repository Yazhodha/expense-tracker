/**
 * Firebase initialization for React Native
 *
 * This uses React Native Firebase (@react-native-firebase) which connects to
 * the SAME Firebase project as the web app but with native mobile SDK for
 * better performance.
 *
 * Configuration files needed:
 * - google-services.json (Android)
 * - GoogleService-Info.plist (iOS)
 *
 * These should be downloaded from Firebase Console and placed in the
 * apps/mobile directory. See FIREBASE_SETUP.md for instructions.
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Firebase Auth instance
 * Uses the same Firebase project as the web app
 */
export const firebaseAuth = auth();

/**
 * Firestore database instance
 * Points to the same Firestore database as the web app
 */
export const firebaseDb = firestore();

/**
 * Initialize Firebase
 * React Native Firebase auto-initializes using config files
 */
export const initializeFirebase = () => {
  // Firebase is automatically initialized by React Native Firebase
  // using google-services.json (Android) and GoogleService-Info.plist (iOS)
  console.log('Firebase initialized for React Native');
  return { auth: firebaseAuth, db: firebaseDb };
};

export default {
  auth: firebaseAuth,
  db: firebaseDb,
  initialize: initializeFirebase,
};
