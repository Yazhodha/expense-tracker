# Expense Tracker App - Complete Implementation Plan

## Project Overview

**App Name**: SpendWise (or user's preference)
**Purpose**: Track credit card expenses to stay within Rs. 100,000 monthly limit
**User**: Yashodha - billing date 15th, due date 6th

### Core Philosophy
- **Simple over complicated** - Anyone should understand it in 5 seconds
- **Rich but intuitive UI** - Premium feel, zero learning curve
- **Fast** - Under 2s load, instant interactions
- **Mobile-first** - Thumb-friendly, works great on phone

---

## Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Next.js 14 (App Router) | SSR, API routes, deploys free on Vercel |
| UI | shadcn/ui + Radix UI | Beautiful, accessible, customizable |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Animations | Framer Motion | Smooth, performant micro-interactions |
| Database | Firebase Firestore | Real-time sync, offline support, free tier |
| Auth | Firebase Auth (Google) | One-tap sign in |
| Notifications | Firebase Cloud Messaging + Browser API | Push notifications |
| MCP | API route with SSE transport | Claude integration |
| Hosting | Vercel | Free, global CDN |
| Icons | Lucide React | Clean, consistent iconography |

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Project

```bash
npx create-next-app@latest expense-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd expense-tracker
```

### 1.2 Install Dependencies

```bash
# UI Components
npx shadcn@latest init
npx shadcn@latest add button card input label dialog sheet progress avatar dropdown-menu toast tabs

# Additional packages
npm install framer-motion lucide-react date-fns

# Firebase
npm install firebase firebase-admin

# MCP (for Claude integration)
npm install @modelcontextprotocol/sdk eventsource-parser
```

### 1.3 Project Structure

Create this folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Main dashboard
│   │   ├── add/
│   │   │   └── page.tsx             # Add expense (can also be bottom sheet)
│   │   ├── insights/
│   │   │   └── page.tsx             # Analytics & charts
│   │   └── settings/
│   │       └── page.tsx             # User preferences
│   ├── api/
│   │   ├── mcp/
│   │   │   └── route.ts             # MCP endpoint for Claude
│   │   └── expenses/
│   │       └── route.ts             # REST API for expenses
│   ├── layout.tsx
│   ├── page.tsx                     # Landing/redirect
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn components (auto-generated)
│   ├── dashboard/
│   │   ├── BudgetRing.tsx           # Circular progress indicator
│   │   ├── BudgetCard.tsx           # Main budget display card
│   │   ├── ExpenseList.tsx          # List of transactions
│   │   ├── ExpenseItem.tsx          # Single transaction row
│   │   ├── QuickStats.tsx           # Daily budget, days left
│   │   └── RecentActivity.tsx       # Today/Yesterday grouping
│   ├── expense/
│   │   ├── AddExpenseSheet.tsx      # Bottom sheet for adding
│   │   ├── CategoryPicker.tsx       # Grid of category icons
│   │   ├── AmountInput.tsx          # Large numpad-style input
│   │   └── ExpenseForm.tsx          # Full form
│   ├── insights/
│   │   ├── CategoryBreakdown.tsx    # Donut chart
│   │   ├── SpendingTrend.tsx        # Line chart
│   │   └── CycleComparison.tsx      # vs last month
│   ├── layout/
│   │   ├── BottomNav.tsx            # Mobile navigation
│   │   ├── Header.tsx               # Top bar with user avatar
│   │   └── PageWrapper.tsx          # Animation wrapper
│   └── providers/
│       ├── AuthProvider.tsx         # Firebase auth context
│       ├── ExpenseProvider.tsx      # Expense data context
│       └── NotificationProvider.tsx # Push notification setup
├── lib/
│   ├── firebase/
│   │   ├── config.ts                # Firebase initialization
│   │   ├── auth.ts                  # Auth helpers
│   │   ├── firestore.ts             # Firestore helpers
│   │   └── messaging.ts             # FCM setup
│   ├── mcp/
│   │   ├── server.ts                # MCP server implementation
│   │   └── tools.ts                 # Tool definitions
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth hook
│   │   ├── useExpenses.ts           # Expense CRUD hook
│   │   ├── useBudget.ts             # Budget calculations
│   │   └── useNotifications.ts      # Notification permissions
│   ├── utils/
│   │   ├── currency.ts              # Format Rs. amounts
│   │   ├── dates.ts                 # Billing cycle helpers
│   │   └── categories.ts            # Category definitions
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── public/
│   ├── firebase-messaging-sw.js     # Service worker for FCM
│   └── icons/                       # PWA icons
└── .env.local                       # Firebase config (user provides)
```

### 1.4 Environment Variables Template

Create `.env.local.example`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# App Configuration
NEXT_PUBLIC_DEFAULT_BUDGET=100000
NEXT_PUBLIC_BILLING_DATE=15
NEXT_PUBLIC_CURRENCY_SYMBOL=Rs.
```

### 1.5 TypeScript Types

Create `src/lib/types/index.ts`:

```typescript
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  settings: UserSettings;
}

export interface UserSettings {
  monthlyLimit: number;      // Default: 100000
  billingDate: number;       // Default: 15 (day of month)
  currency: string;          // Default: "Rs."
  categories: Category[];
  notificationsEnabled: boolean;
  alertThresholds: number[]; // Default: [50, 75, 90, 100]
}

export interface Category {
  id: string;
  name: string;
  icon: string;              // Lucide icon name
  color: string;             // Tailwind color class
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;          // Category ID
  merchant?: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  source: 'manual' | 'claude';  // How it was added
}

export interface BillingCycle {
  startDate: Date;
  endDate: Date;
  daysTotal: number;
  daysRemaining: number;
  daysElapsed: number;
}

export interface BudgetSummary {
  cycle: BillingCycle;
  spent: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  dailyBudget: number;       // Remaining / days left
  todaySpent: number;
  isOverBudget: boolean;
}

// MCP Tool Types
export interface AddExpenseInput {
  expenses: Array<{
    amount: number;
    category: string;
    merchant?: string;
    note?: string;
    date?: string;           // ISO string, defaults to today
  }>;
}

export interface GetSummaryOutput {
  spent: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  daysRemaining: number;
  dailyBudget: number;
  status: 'good' | 'warning' | 'danger';
}
```

---

## Phase 2: Firebase Setup & Authentication

### 2.1 Firebase Configuration

Create `src/lib/firebase/config.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging (only in browser)
export const getMessagingInstance = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getMessaging(app);
  }
  return null;
};

export default app;
```

### 2.2 Auth Provider

Create `src/components/providers/AuthProvider.tsx`:

```typescript
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
```

### 2.3 Login Page

Create `src/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center"
        >
          <Wallet className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">SpendWise</h1>
          <p className="text-muted-foreground">
            Track expenses. Stay on budget.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>✓ Set your monthly limit</p>
          <p>✓ Track every expense</p>
          <p>✓ Get alerts before overspending</p>
        </div>

        {/* Sign In Button */}
        <Button 
          size="lg" 
          onClick={signIn}
          className="w-full max-w-xs"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            {/* Google Icon SVG */}
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </Button>
      </motion.div>
    </div>
  );
}
```

---

## Phase 3: Core UI Components

### 3.1 Utility Functions

Create `src/lib/utils/currency.ts`:

```typescript
export function formatCurrency(amount: number, currency = 'Rs.'): string {
  return `${currency} ${amount.toLocaleString('en-IN')}`;
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}
```

Create `src/lib/utils/dates.ts`:

```typescript
import { BillingCycle } from '@/lib/types';
import { startOfDay, endOfDay, differenceInDays, addMonths, setDate, isAfter, isBefore } from 'date-fns';

export function getBillingCycle(billingDate: number, referenceDate = new Date()): BillingCycle {
  const today = startOfDay(referenceDate);
  
  // Determine current cycle start
  let cycleStart = setDate(today, billingDate);
  
  // If we're before the billing date this month, cycle started last month
  if (isBefore(today, cycleStart)) {
    cycleStart = addMonths(cycleStart, -1);
  }
  
  // Cycle ends one day before next billing date
  const cycleEnd = endOfDay(addMonths(setDate(cycleStart, billingDate), 1));
  cycleEnd.setDate(cycleEnd.getDate() - 1);
  
  const daysTotal = differenceInDays(cycleEnd, cycleStart) + 1;
  const daysElapsed = differenceInDays(today, cycleStart) + 1;
  const daysRemaining = daysTotal - daysElapsed;
  
  return {
    startDate: cycleStart,
    endDate: cycleEnd,
    daysTotal,
    daysElapsed,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

export function isInCurrentCycle(date: Date, billingDate: number): boolean {
  const cycle = getBillingCycle(billingDate);
  const checkDate = startOfDay(date);
  return !isBefore(checkDate, cycle.startDate) && !isAfter(checkDate, cycle.endDate);
}
```

### 3.2 Budget Ring Component (Animated Circular Progress)

Create `src/components/dashboard/BudgetRing.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';

interface BudgetRingProps {
  percent: number;  // 0-100
  size?: number;
  strokeWidth?: number;
}

export function BudgetRing({ percent, size = 200, strokeWidth = 16 }: BudgetRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  
  // Color based on percent
  const getColor = () => {
    if (percent >= 100) return 'stroke-red-500';
    if (percent >= 90) return 'stroke-red-400';
    if (percent >= 75) return 'stroke-orange-400';
    if (percent >= 50) return 'stroke-yellow-400';
    return 'stroke-green-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={getColor()}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percent)}%
        </motion.span>
        <span className="text-sm text-muted-foreground">used</span>
      </div>
    </div>
  );
}
```

### 3.3 Budget Card

Create `src/components/dashboard/BudgetCard.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetRing } from './BudgetRing';
import { BudgetSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';

interface BudgetCardProps {
  summary: BudgetSummary;
  currency?: string;
}

export function BudgetCard({ summary, currency = 'Rs.' }: BudgetCardProps) {
  const { cycle, spent, limit, remaining, percentUsed, dailyBudget } = summary;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        {/* Cycle header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">
            {format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d')}
          </h2>
          <p className="text-sm text-muted-foreground">Current billing cycle</p>
        </div>

        {/* Budget ring */}
        <div className="flex justify-center mb-6">
          <BudgetRing percent={percentUsed} />
        </div>

        {/* Amount details */}
        <div className="text-center space-y-1 mb-6">
          <motion.p
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatCurrency(spent, currency)}
          </motion.p>
          <p className="text-muted-foreground">
            of {formatCurrency(limit, currency)}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className={`text-xl font-semibold ${remaining < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(Math.abs(remaining), currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {remaining < 0 ? 'over budget' : 'remaining'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">
              {formatCurrency(dailyBudget, currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              daily budget ({cycle.daysRemaining} days left)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.4 Expense List

Create `src/components/dashboard/ExpenseItem.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Expense, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import * as Icons from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  category: Category;
  currency?: string;
  onEdit?: (expense: Expense) => void;
}

export function ExpenseItem({ expense, category, currency = 'Rs.', onEdit }: ExpenseItemProps) {
  // Dynamic icon component
  const IconComponent = (Icons as any)[category.icon] || Icons.Circle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 px-1 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onEdit?.(expense)}
    >
      {/* Category icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {expense.merchant || category.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {expense.note || format(expense.date, 'h:mm a')}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="font-semibold">
          {formatCurrency(expense.amount, currency)}
        </p>
        {expense.source === 'claude' && (
          <p className="text-xs text-muted-foreground">via Claude</p>
        )}
      </div>
    </motion.div>
  );
}
```

Create `src/components/dashboard/ExpenseList.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Category } from '@/lib/types';
import { ExpenseItem } from './ExpenseItem';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currency?: string;
  onEditExpense?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, categories, currency, onEditExpense }: ExpenseListProps) {
  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    
    expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((expense) => {
        const dateKey = format(expense.date, 'yyyy-MM-dd');
        const existing = groups.get(dateKey) || [];
        groups.set(dateKey, [...existing, expense]);
      });

    return groups;
  }, [expenses]);

  const getCategoryById = (id: string) => 
    categories.find((c) => c.id === id) || categories[categories.length - 1];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  const getDayTotal = (expenses: Expense[]) =>
    expenses.reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses yet</p>
        <p className="text-sm">Tap + to add your first expense</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedExpenses.entries()).map(([dateStr, dayExpenses]) => (
        <motion.div
          key={dateStr}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Date header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">{getDateLabel(dateStr)}</h3>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(getDayTotal(dayExpenses), currency)}
            </span>
          </div>

          {/* Expenses for this day */}
          <div className="bg-card rounded-lg border divide-y">
            {dayExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={getCategoryById(expense.category)}
                currency={currency}
                onEdit={onEditExpense}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

### 3.5 Add Expense Sheet (Bottom Sheet)

Create `src/components/expense/AddExpenseSheet.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/lib/types';
import { Plus, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

interface AddExpenseSheetProps {
  categories: Category[];
  onAdd: (expense: { amount: number; category: string; merchant?: string; note?: string }) => Promise<void>;
  currency?: string;
}

export function AddExpenseSheet({ categories, onAdd, currency = 'Rs.' }: AddExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) return;
    
    setLoading(true);
    try {
      await onAdd({
        amount: Number(amount),
        category: selectedCategory,
        merchant: merchant || undefined,
      });
      
      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setMerchant('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle>Add Expense</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Amount input */}
          <div className="text-center">
            <span className="text-2xl text-muted-foreground">{currency}</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-5xl font-bold text-center w-full bg-transparent border-none focus:outline-none"
              autoFocus
            />
          </div>

          {/* Category picker */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Category</p>
            <div className="grid grid-cols-5 gap-3">
              {categories.map((cat) => {
                const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
                const isSelected = selectedCategory === cat.id;
                
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs truncate w-full text-center">{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Merchant (optional) */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Merchant (optional)</p>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Keells, Dialog"
            />
          </div>

          {/* Submit button */}
          <Button
            className="w-full h-12"
            size="lg"
            disabled={!amount || !selectedCategory || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Add Expense
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 3.6 Bottom Navigation

Create `src/components/layout/BottomNav.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PieChart, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/insights', icon: PieChart, label: 'Insights' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-40">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-6 py-2"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

## Phase 4: Firebase Integration & Data Hooks

### 4.1 Firestore Functions

Create `src/lib/firebase/firestore.ts`:

```typescript
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { Expense } from '@/lib/types';

const EXPENSES_COLLECTION = 'expenses';

export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
    ...expense,
    userId,
    date: Timestamp.fromDate(expense.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
}

export function subscribeToExpenses(
  userId: string,
  startDate: Date,
  endDate: Date,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Expense[];
    
    callback(expenses);
  });
}

export async function getExpensesForCycle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate(),
    createdAt: doc.data().createdAt.toDate(),
    updatedAt: doc.data().updatedAt.toDate(),
  })) as Expense[];
}
```

### 4.2 Expense Hook

Create `src/lib/hooks/useExpenses.ts`:

```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Expense, BudgetSummary } from '@/lib/types';
import { getBillingCycle } from '@/lib/utils/dates';
import {
  addExpense as addExpenseToDb,
  updateExpense as updateExpenseInDb,
  deleteExpense as deleteExpenseFromDb,
  subscribeToExpenses,
} from '@/lib/firebase/firestore';
import { isToday } from 'date-fns';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current billing cycle
  const billingDate = user?.settings.billingDate || 15;
  const cycle = getBillingCycle(billingDate);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToExpenses(
      user.uid,
      cycle.startDate,
      cycle.endDate,
      (newExpenses) => {
        setExpenses(newExpenses);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, cycle.startDate.getTime(), cycle.endDate.getTime()]);

  // Calculate budget summary
  const summary: BudgetSummary = {
    cycle,
    spent: expenses.reduce((sum, e) => sum + e.amount, 0),
    limit: user?.settings.monthlyLimit || 100000,
    remaining: 0,
    percentUsed: 0,
    dailyBudget: 0,
    todaySpent: expenses.filter((e) => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0),
    isOverBudget: false,
  };
  
  summary.remaining = summary.limit - summary.spent;
  summary.percentUsed = (summary.spent / summary.limit) * 100;
  summary.dailyBudget = cycle.daysRemaining > 0 ? Math.floor(summary.remaining / cycle.daysRemaining) : 0;
  summary.isOverBudget = summary.remaining < 0;

  // CRUD operations
  const addExpense = useCallback(async (
    expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    return addExpenseToDb(user.uid, expense);
  }, [user]);

  const updateExpense = useCallback(async (
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    return updateExpenseInDb(expenseId, updates);
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    return deleteExpenseFromDb(expenseId);
  }, []);

  return {
    expenses,
    loading,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
```

---

## Phase 5: MCP Server Integration

### 5.1 MCP Tool Definitions

Create `src/lib/mcp/tools.ts`:

```typescript
import { z } from 'zod';

export const addExpenseSchema = z.object({
  expenses: z.array(z.object({
    amount: z.number().positive(),
    category: z.string(),
    merchant: z.string().optional(),
    note: z.string().optional(),
    date: z.string().optional(), // ISO date string
  })),
});

export const getSummarySchema = z.object({});

export const getExpensesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(20),
});

export const tools = [
  {
    name: 'add_expenses',
    description: 'Add one or more expenses extracted from a screenshot or user input. Each expense needs amount, category (groceries/dining/fuel/shopping/subscriptions/health/entertainment/transport/utilities/other), and optionally merchant name and note.',
    inputSchema: {
      type: 'object',
      properties: {
        expenses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Amount in LKR (Rs.)' },
              category: { type: 'string', description: 'Category ID: groceries, dining, fuel, shopping, subscriptions, health, entertainment, transport, utilities, other' },
              merchant: { type: 'string', description: 'Merchant/store name' },
              note: { type: 'string', description: 'Additional note' },
              date: { type: 'string', description: 'ISO date string (defaults to today)' },
            },
            required: ['amount', 'category'],
          },
        },
      },
      required: ['expenses'],
    },
  },
  {
    name: 'get_summary',
    description: 'Get the current billing cycle budget summary including spent amount, remaining budget, percentage used, and daily budget.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_expenses',
    description: 'Get a list of recent expenses, optionally filtered by date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO string)' },
        endDate: { type: 'string', description: 'End date (ISO string)' },
        limit: { type: 'number', description: 'Max expenses to return (default 20)' },
      },
    },
  },
];
```

### 5.2 MCP API Route (SSE)

Create `src/app/api/mcp/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { tools, addExpenseSchema, getSummarySchema, getExpensesSchema } from '@/lib/mcp/tools';
import { getExpensesForCycle, addExpense } from '@/lib/firebase/firestore';
import { getBillingCycle } from '@/lib/utils/dates';
import { adminDb } from '@/lib/firebase/admin'; // Server-side Firebase

// MCP Protocol implementation
export async function GET(request: NextRequest) {
  // Return tool definitions
  return Response.json({
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    serverInfo: {
      name: 'expense-tracker',
      version: '1.0.0',
    },
    tools,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { method, params, id } = body;

  // Handle different MCP methods
  switch (method) {
    case 'tools/list':
      return Response.json({
        jsonrpc: '2.0',
        id,
        result: { tools },
      });

    case 'tools/call':
      return handleToolCall(params, id);

    default:
      return Response.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: 'Method not found' },
      });
  }
}

async function handleToolCall(params: any, id: string) {
  const { name, arguments: args } = params;
  const userId = params.userId; // Passed from Claude via headers or params

  try {
    let result;

    switch (name) {
      case 'add_expenses': {
        const validated = addExpenseSchema.parse(args);
        const addedIds = [];
        
        for (const expense of validated.expenses) {
          const expenseId = await addExpense(userId, {
            amount: expense.amount,
            category: expense.category,
            merchant: expense.merchant,
            note: expense.note,
            date: expense.date ? new Date(expense.date) : new Date(),
            source: 'claude',
          });
          addedIds.push(expenseId);
        }
        
        result = {
          success: true,
          message: `Added ${addedIds.length} expense(s)`,
          ids: addedIds,
        };
        break;
      }

      case 'get_summary': {
        const cycle = getBillingCycle(15); // TODO: Get from user settings
        const expenses = await getExpensesForCycle(userId, cycle.startDate, cycle.endDate);
        
        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const limit = 100000; // TODO: Get from user settings
        const remaining = limit - spent;
        
        result = {
          spent,
          limit,
          remaining,
          percentUsed: Math.round((spent / limit) * 100),
          daysRemaining: cycle.daysRemaining,
          dailyBudget: cycle.daysRemaining > 0 ? Math.floor(remaining / cycle.daysRemaining) : 0,
          status: remaining < 0 ? 'danger' : remaining < limit * 0.1 ? 'warning' : 'good',
        };
        break;
      }

      case 'get_expenses': {
        const validated = getExpensesSchema.parse(args);
        const cycle = getBillingCycle(15);
        
        const startDate = validated.startDate ? new Date(validated.startDate) : cycle.startDate;
        const endDate = validated.endDate ? new Date(validated.endDate) : cycle.endDate;
        
        const expenses = await getExpensesForCycle(userId, startDate, endDate);
        
        result = {
          expenses: expenses.slice(0, validated.limit).map((e) => ({
            id: e.id,
            amount: e.amount,
            category: e.category,
            merchant: e.merchant,
            date: e.date.toISOString(),
          })),
          total: expenses.length,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return Response.json({
      jsonrpc: '2.0',
      id,
      result: { content: [{ type: 'text', text: JSON.stringify(result) }] },
    });

  } catch (error: any) {
    return Response.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message },
    });
  }
}
```

### 5.3 Firebase Admin SDK (Server-side)

Create `src/lib/firebase/admin.ts`:

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = getFirestore();
```

---

## Phase 6: Push Notifications

### 6.1 Service Worker

Create `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification;
  
  self.registration.showNotification(title, {
    body,
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: payload.data,
  });
});
```

### 6.2 Notification Hook

Create `src/lib/hooks/useNotifications.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessagingInstance } from '@/lib/firebase/config';
import { getToken, onMessage } from 'firebase/messaging';
import { useToast } from '@/components/ui/use-toast';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        const messaging = await getMessagingInstance();
        if (messaging) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          setFcmToken(token);
          // TODO: Save token to user's Firestore document
        }
      }
      
      return result;
    } catch (error) {
      console.error('Notification permission error:', error);
      return 'denied' as NotificationPermission;
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const setupListener = async () => {
      const messaging = await getMessagingInstance();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {};
          
          // Show toast for foreground notifications
          toast({
            title: title || 'Notification',
            description: body,
          });
        });
      }
    };
    
    setupListener();
    return () => unsubscribe?.();
  }, [toast]);

  // Show local notification (for budget alerts)
  const showLocalNotification = useCallback((title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
      });
    }
  }, [permission]);

  return {
    permission,
    fcmToken,
    requestPermission,
    showLocalNotification,
  };
}
```

### 6.3 Budget Alert Logic

Create `src/lib/utils/alerts.ts`:

```typescript
import { BudgetSummary } from '@/lib/types';

interface AlertCheck {
  threshold: number;
  triggered: boolean;
  message: string;
  type: 'info' | 'warning' | 'danger';
}

export function checkBudgetAlerts(
  summary: BudgetSummary,
  thresholds: number[] = [50, 75, 90, 100],
  previousPercent?: number
): AlertCheck | null {
  const { percentUsed, remaining, dailyBudget, cycle } = summary;
  
  // Find the threshold we just crossed
  for (const threshold of thresholds.sort((a, b) => b - a)) {
    if (percentUsed >= threshold && (!previousPercent || previousPercent < threshold)) {
      let message: string;
      let type: 'info' | 'warning' | 'danger';
      
      if (threshold >= 100) {
        message = `Budget exceeded! You're over by Rs. ${Math.abs(remaining).toLocaleString()}`;
        type = 'danger';
      } else if (threshold >= 90) {
        message = `90% of budget used. Only Rs. ${remaining.toLocaleString()} left for ${cycle.daysRemaining} days`;
        type = 'danger';
      } else if (threshold >= 75) {
        message = `75% spent. Rs. ${dailyBudget.toLocaleString()}/day to stay on track`;
        type = 'warning';
      } else {
        message = `Halfway there! Rs. ${remaining.toLocaleString()} remaining for ${cycle.daysRemaining} days 👍`;
        type = 'info';
      }
      
      return { threshold, triggered: true, message, type };
    }
  }
  
  return null;
}
```

---

## Phase 7: Dashboard Page Assembly

### 7.1 Main Dashboard

Create `src/app/(dashboard)/page.tsx`:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { checkBudgetAlerts } from '@/lib/utils/alerts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { expenses, loading, summary, addExpense } = useExpenses();
  const { permission, requestPermission, showLocalNotification } = useNotifications();
  const previousPercent = useRef<number>(0);

  // Check for budget alerts when summary changes
  useEffect(() => {
    if (!loading && summary.percentUsed !== previousPercent.current) {
      const alert = checkBudgetAlerts(
        summary,
        user?.settings.alertThresholds,
        previousPercent.current
      );
      
      if (alert && permission === 'granted') {
        showLocalNotification('SpendWise Alert', alert.message);
      }
      
      previousPercent.current = summary.percentUsed;
    }
  }, [summary, loading, permission, showLocalNotification, user]);

  // Request notification permission on first visit
  useEffect(() => {
    if (permission === 'default') {
      // Show permission prompt after a short delay
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [permission, requestPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      {/* Budget Overview */}
      <BudgetCard 
        summary={summary} 
        currency={user?.settings.currency} 
      />

      {/* Recent Expenses */}
      <div>
        <h2 className="font-semibold mb-4">Recent Expenses</h2>
        <ExpenseList
          expenses={expenses}
          categories={user?.settings.categories || []}
          currency={user?.settings.currency}
        />
      </div>

      {/* Add Expense FAB */}
      <AddExpenseSheet
        categories={user?.settings.categories || []}
        currency={user?.settings.currency}
        onAdd={async (expense) => {
          await addExpense({
            ...expense,
            date: new Date(),
            source: 'manual',
          });
        }}
      />
    </motion.div>
  );
}
```

### 7.2 Dashboard Layout

Create `src/app/(dashboard)/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { BottomNav } from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, Bell } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between px-4 h-14 max-w-md mx-auto">
          <h1 className="font-bold text-lg">SpendWise</h1>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full">
              <Bell className="w-5 h-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
```

---

## Phase 8: Settings & Insights Pages

### 8.1 Settings Page

Create `src/app/(dashboard)/settings/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency } from '@/lib/utils/currency';

export default function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const [limit, setLimit] = useState(String(user?.settings.monthlyLimit || 100000));
  const [billingDate, setBillingDate] = useState(String(user?.settings.billingDate || 15));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        monthlyLimit: Number(limit),
        billingDate: Number(billingDate),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Limit (Rs.)</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="billingDate">Billing Date</Label>
            <Input
              id="billingDate"
              type="number"
              min={1}
              max={28}
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Day of month when billing cycle starts
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified at 50%, 75%, 90%, 100%
              </p>
            </div>
            <Switch
              checked={user?.settings.notificationsEnabled}
              onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* MCP Connection Info */}
      <Card>
        <CardHeader>
          <CardTitle>Claude Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Add this MCP server to Claude to enable expense extraction from screenshots:
          </p>
          <code className="block bg-muted p-3 rounded-lg text-xs break-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : ''}
          </code>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 8.2 Insights Page

Create `src/app/(dashboard)/insights/page.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency } from '@/lib/utils/currency';

export default function InsightsPage() {
  const { user } = useAuth();
  const { expenses, summary } = useExpenses();

  // Category breakdown
  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    
    expenses.forEach((expense) => {
      const current = totals.get(expense.category) || 0;
      totals.set(expense.category, current + expense.amount);
    });

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => {
        const category = user?.settings.categories.find((c) => c.id === categoryId);
        return {
          id: categoryId,
          name: category?.name || categoryId,
          color: category?.color || 'bg-gray-500',
          amount,
          percent: (amount / summary.spent) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, summary.spent, user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Insights</h1>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryTotals.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{cat.name}</span>
                <span className="font-medium">
                  {formatCurrency(cat.amount, user?.settings.currency)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${cat.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}

          {categoryTotals.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No expenses yet this cycle
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{expenses.length}</p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {formatCurrency(
                expenses.length > 0 ? Math.round(summary.spent / expenses.length) : 0,
                user?.settings.currency
              )}
            </p>
            <p className="text-sm text-muted-foreground">Avg. Transaction</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
```

---

## Phase 9: Root Layout & Providers

### 9.1 Root Layout

Create `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpendWise - Track Your Expenses',
  description: 'Simple expense tracking to stay within your budget',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 9.2 Root Page (Redirect)

Create `src/app/page.tsx`:

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to dashboard - auth check happens in dashboard layout
  redirect('/');
}
```

Wait - this creates a loop. Let me fix:

```typescript
// src/app/page.tsx should just render the dashboard
// Move the dashboard page to here, and (dashboard) becomes a route group only for layout
```

Actually, cleaner approach - update the structure:

```
src/app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── layout.tsx        # Protected layout with nav
│   ├── page.tsx          # Dashboard home
│   ├── insights/page.tsx
│   └── settings/page.tsx
├── api/...
├── layout.tsx            # Root layout with providers
└── page.tsx              # Redirect to login or dashboard
```

Update `src/app/page.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
```

---

## Phase 10: PWA & Deployment

### 10.1 PWA Manifest

Create `public/manifest.json`:

```json
{
  "name": "SpendWise",
  "short_name": "SpendWise",
  "description": "Track expenses and stay within budget",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 10.2 Vercel Configuration

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/mcp",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

### 10.3 Firestore Security Rules

Create `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only read/write their own expenses
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## Deployment Checklist

### Firebase Setup
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication → Google sign-in
3. Create Firestore database (start in production mode)
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Set up Cloud Messaging (get VAPID key)
6. Get service account JSON for admin SDK

### Environment Variables (Vercel)
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_VAPID_KEY=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

---

## Claude Code Execution Instructions

**For Claude Code**: Execute this plan in phases. After each phase:
1. Test the components work correctly
2. Commit with a meaningful message
3. Move to the next phase

**Start with**: Phase 1 (Project Setup) → Phase 2 (Firebase) → Phase 3 (UI Components)

**Key files to create first**:
1. `/src/lib/types/index.ts` - All TypeScript interfaces
2. `/src/lib/firebase/config.ts` - Firebase initialization  
3. `/src/components/providers/AuthProvider.tsx` - Auth context
4. `/src/lib/utils/currency.ts` and `dates.ts` - Utilities

**Testing each phase**:
- Phase 1-2: Can sign in with Google
- Phase 3-4: Dashboard shows with mock data
- Phase 5: MCP endpoint responds to requests
- Phase 6: Notifications work in browser
- Phase 7-8: Full app is functional
- Phase 9-10: PWA installable, deployed

Good luck! 🚀
