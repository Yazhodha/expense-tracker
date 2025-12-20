'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, UserSettings } from '@/lib/types';

const DEFAULT_SETTINGS: UserSettings = {
  monthlyLimit: 100000,
  billingDate: 15,
  currency: 'Rs.',
  categories: [
    { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: 'bg-green-500' },
    { id: 'dining', name: 'Dining', icon: 'Utensils', color: 'bg-orange-500' },
    { id: 'fuel', name: 'Fuel', icon: 'Fuel', color: 'bg-blue-500' },
    { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: 'bg-pink-500' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'CreditCard', color: 'bg-purple-500' },
    { id: 'health', name: 'Health', icon: 'Heart', color: 'bg-red-500' },
    { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: 'bg-indigo-500' },
    { id: 'transport', name: 'Transport', icon: 'Car', color: 'bg-cyan-500' },
    { id: 'utilities', name: 'Utilities', icon: 'Zap', color: 'bg-yellow-500' },
    { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: 'bg-gray-500' },
  ],
  notificationsEnabled: true,
  alertThresholds: [50, 75, 90, 100],
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get or create user document
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            settings: userDoc.data().settings,
          });
        } else {
          // First time user - create document with defaults
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            settings: DEFAULT_SETTINGS,
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            settings: DEFAULT_SETTINGS,
            createdAt: new Date(),
          });
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;

    const updatedSettings = { ...user.settings, ...newSettings };
    await setDoc(doc(db, 'users', user.uid), { settings: updatedSettings }, { merge: true });
    setUser({ ...user, settings: updatedSettings });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
