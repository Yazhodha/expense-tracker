# React Native with Expo - Mobile App Implementation Plan

## Overview

Convert the Next.js expense tracker to a native mobile app using React Native with Expo. Implementation follows a monorepo strategy with maximum code reuse (~60% shared), enabling iOS and Android apps while maintaining the existing web app.

**Timeline**: 10 weeks to production-ready mobile app
**Architecture**: Monorepo with shared packages + separate mobile app

---

## Monorepo Structure

```
expense-tracker/
├── apps/
│   ├── web/                    # Existing Next.js app (unchanged)
│   └── mobile/                 # New React Native Expo app
├── packages/
│   ├── shared-types/           # TypeScript interfaces
│   ├── shared-firebase/        # Firebase client logic
│   ├── shared-utils/           # Business logic utilities
│   └── shared-hooks/           # React hooks (expenses, auth logic)
├── package.json                # Root workspace config
└── pnpm-workspace.yaml         # Workspace configuration
```

---

## Technology Stack

### Core Framework
- **expo**: ~52.0.0
- **react-native**: 0.76.5
- **typescript**: ^5.9.3

### Navigation
- **@react-navigation/native**: ^7.0.15
- **@react-navigation/bottom-tabs**: ^7.2.0
- **@react-navigation/native-stack**: ^7.2.0

### UI Library
- **react-native-paper**: ^5.12.5 (Material Design 3, includes theming)

### Key Libraries
- **@react-native-firebase/app**: ^21.8.1
- **@react-native-firebase/auth**: ^21.8.1
- **@react-native-firebase/firestore**: ^21.8.1
- **@react-native-google-signin/google-signin**: ^14.2.0
- **react-native-reanimated**: ^3.16.6 (animations)
- **@gorhom/bottom-sheet**: ^5.0.5
- **react-native-calendars**: ^1.1309.0
- **react-native-toast-message**: ^2.2.1
- **@expo/vector-icons**: ^14.0.0

---

## Code Sharing Strategy

### Shared Packages

**1. @expense-tracker/shared-types**
- Source: Direct copy from [src/lib/types/index.ts](src/lib/types/index.ts)
- All TypeScript interfaces (User, Expense, BudgetSummary, etc.)
- 100% portable, zero modifications

**2. @expense-tracker/shared-utils**
- Source: [src/lib/utils/currency.ts](src/lib/utils/currency.ts), [src/lib/utils/dates.ts](src/lib/utils/dates.ts)
- Pure utility functions (formatCurrency, getBillingCycle, etc.)
- 100% portable with date-fns

**3. @expense-tracker/shared-firebase**
- Source: Adapted from [src/lib/firebase/firestore.ts](src/lib/firebase/firestore.ts)
- Firebase operations with platform adapter pattern
- Supports both web Firebase SDK and @react-native-firebase

**4. @expense-tracker/shared-hooks**
- Source: Adapted from [src/lib/hooks/useExpenses.ts](src/lib/hooks/useExpenses.ts)
- Business logic hooks (useExpenses, useBudgetCalculations)
- Remove 'use client', accept user as parameter

### Platform-Specific Code

**Web** ([apps/web/](apps/web/))
- All UI components remain unchanged
- Import from shared packages
- Keep Next.js routing, Tailwind, shadcn/ui

**Mobile** ([apps/mobile/](apps/mobile/))
- New UI components with React Native Paper
- React Navigation for routing
- Recreation of: BudgetCard, ExpenseList, AddExpenseSheet, etc.

---

## Implementation Phases

### Phase 1: Monorepo Setup & Code Extraction (Week 1)

**Goal**: Create monorepo structure with shared packages extracted

**Tasks**:
1. Create monorepo folder structure
2. Setup pnpm workspace (pnpm-workspace.yaml)
3. Extract shared-types package from [src/lib/types/index.ts](src/lib/types/index.ts)
4. Extract shared-utils from [src/lib/utils/](src/lib/utils/)
5. Create shared-firebase with adapter pattern
6. Extract shared-hooks from [src/lib/hooks/useExpenses.ts](src/lib/hooks/useExpenses.ts)
7. Update web app to import from shared packages
8. Verify web app still works

**Critical Files**:
- [src/lib/types/index.ts](src/lib/types/index.ts) → packages/shared-types
- [src/lib/utils/currency.ts](src/lib/utils/currency.ts) → packages/shared-utils
- [src/lib/utils/dates.ts](src/lib/utils/dates.ts) → packages/shared-utils
- [src/lib/firebase/firestore.ts](src/lib/firebase/firestore.ts) → packages/shared-firebase
- [src/lib/hooks/useExpenses.ts](src/lib/hooks/useExpenses.ts) → packages/shared-hooks

---

### Phase 2: Expo App & Firebase Authentication (Week 2)

**Goal**: Working Expo app with Google Sign-In

**Tasks**:
1. Initialize Expo app in apps/mobile
2. Install dependencies (React Navigation, Firebase, etc.)
3. Configure Firebase (google-services.json, GoogleService-Info.plist)
4. Setup @react-native-google-signin
5. Create mobile AuthProvider using shared hooks
6. Build login screen with Google Sign-In button
7. Test authentication flow on iOS and Android

**Critical Files**:
- [src/components/providers/AuthProvider.tsx](src/components/providers/AuthProvider.tsx) → adapt for mobile

---

### Phase 3: Navigation & Theme System (Week 3)

**Goal**: Bottom tabs navigation with dark mode

**Tasks**:
1. Setup Expo Router (file-based routing)
2. Create bottom tabs layout (Dashboard, Insights, Settings)
3. Setup React Native Paper theme provider
4. Create theme toggle component with AsyncStorage
5. Build basic Settings screen (profile, theme toggle, sign out)
6. Add navigation animations

**Critical Files**:
- [src/components/layout/BottomNav.tsx](src/components/layout/BottomNav.tsx) → recreate with React Navigation
- [src/components/providers/ThemeProvider.tsx](src/components/providers/ThemeProvider.tsx) → adapt with Paper theme

---

### Phase 4: Core UI Components (Week 4)

**Goal**: Reusable UI component library

**Tasks**:
1. Create wrapper components (Button, Card, Input) around Paper
2. Build BudgetCard component with Paper.Card
3. Build BudgetRing with react-native-svg + Reanimated
4. Create icon mapping utility (lucide → MaterialCommunityIcons)
5. Build category picker grid component
6. Test animations at 60fps

**Critical Files**:
- [src/components/dashboard/BudgetCard.tsx](src/components/dashboard/BudgetCard.tsx) → recreate for mobile
- [src/components/dashboard/BudgetRing.tsx](src/components/dashboard/BudgetRing.tsx) → recreate with Reanimated

---

### Phase 5: Expense Management (Week 5)

**Goal**: Full CRUD operations with bottom sheets

**Tasks**:
1. Setup @gorhom/bottom-sheet
2. Create AddExpenseSheet with category picker and date picker
3. Build ExpenseList with FlatList (virtualized)
4. Create EditExpenseSheet with pre-filled data
5. Integrate useExpenses hook from shared-hooks
6. Add swipe-to-delete functionality
7. Implement loading states and toast messages

**Critical Files**:
- [src/components/expense/AddExpenseSheet.tsx](src/components/expense/AddExpenseSheet.tsx) → recreate with Bottom Sheet
- [src/components/expense/EditExpenseSheet.tsx](src/components/expense/EditExpenseSheet.tsx) → recreate
- [src/components/dashboard/ExpenseList.tsx](src/components/dashboard/ExpenseList.tsx) → recreate with FlatList

---

### Phase 6: Dashboard & Insights (Week 6)

**Goal**: Complete dashboard and insights screens

**Tasks**:
1. Complete Dashboard layout (BudgetCard + ExpenseList)
2. Add floating action button for AddExpenseSheet
3. Build insights charts (category breakdown, trends)
4. Add search functionality with debounce
5. Implement pull-to-refresh
6. Match web layout and functionality

---

### Phase 7: Settings & Configuration (Week 7)

**Goal**: Full settings management

**Tasks**:
1. Build settings sections (budget, billing date, currency)
2. Create category editor (add/edit/delete categories)
3. Add notification settings (toggles, permissions)
4. Build profile section (display user info, sign out)
5. Add About section (version, terms, privacy)
6. Ensure all settings sync with Firebase

---

### Phase 8: Polish & Optimization (Week 8)

**Goal**: Production-ready UX

**Tasks**:
1. Add animations (screen transitions, list items, loading skeletons)
2. Implement toast notifications for all actions
3. Add haptic feedback on interactions
4. Optimize performance (memoization, lazy loading)
5. Add splash screen and app icon
6. Implement error boundaries and crash tracking
7. Enhance accessibility (screen readers, touch targets)

---

### Phase 9: Testing & QA (Week 9)

**Goal**: Comprehensive testing

**Tasks**:
1. Write unit tests for shared packages
2. Integration tests for auth and expense CRUD
3. Manual testing on multiple devices (iOS/Android)
4. Test dark mode, offline mode, edge cases
5. Performance testing (1000+ expenses)
6. Test with real Firebase data

---

### Phase 10: Deployment (Week 10)

**Goal**: Apps published to stores

**Tasks**:
1. Setup EAS Build (eas build:configure)
2. Configure app.json (bundle identifiers, version)
3. Build production versions for iOS and Android
4. Test production builds on real devices
5. Submit to App Store and Google Play
6. Setup OTA updates for future patches

---

## Firebase Setup for Mobile

### Authentication
**Web** uses `signInWithPopup(auth, GoogleAuthProvider)`
**Mobile** uses `@react-native-google-signin/google-signin` with native credentials

**Setup Requirements**:
- iOS: Configure URL scheme in Info.plist
- Android: Add SHA-1 fingerprint to Firebase Console
- Download google-services.json (Android) and GoogleService-Info.plist (iOS)

### Firestore
Same API as web, using @react-native-firebase for better performance

### No Admin SDK
All operations are client-side (no API routes needed for mobile)

---

## Migration Strategy

### Coexistence
- Web app remains in apps/web/ unchanged during mobile development
- Both apps share same Firebase project
- Users can use both platforms simultaneously
- Shared package changes affect both apps

### Development Workflow
```bash
# Work on web
cd apps/web && npm run dev

# Work on mobile
cd apps/mobile && npx expo start

# Work on shared code
cd packages/shared-utils
# Both apps hot reload automatically
```

### Deployment Strategy
1. **Soft Launch** (Months 1-2): Mobile in beta via TestFlight/Internal Testing
2. **Parallel Run** (Months 3-4): Both apps in production
3. **Full Production** (Month 5+): Equal support, platform-specific optimizations

---

## Key Architectural Decisions (CONFIRMED)

### 1. Monorepo with pnpm workspaces ✅
**Why**: Single source of truth, atomic commits, easy dependency management
**Decision**: Using pnpm for best performance and disk space efficiency

### 2. React Native Paper for UI and Theming ✅
**Why**: Material Design 3, built-in theming, comprehensive components (80% time savings vs custom)
**Decision**: Using Paper's theming system exclusively (not NativeWind) for simpler implementation

### 3. Adapter pattern for Firebase
**Why**: Abstraction allows switching between web SDK and @react-native-firebase

### 4. Reanimated over Framer Motion
**Why**: Native thread performance (60fps), critical for mobile UX

### 5. Bottom Sheet over Modal
**Why**: Native mobile pattern, better gesture handling, matches iOS/Android standards

### 6. Implementation Approach ✅
**Decision**: Full implementation by Claude Code across all 10 phases

---

## Critical Files to Reference

1. [src/lib/types/index.ts](src/lib/types/index.ts) - All TypeScript interfaces
2. [src/lib/firebase/firestore.ts](src/lib/firebase/firestore.ts) - Firebase operations
3. [src/lib/hooks/useExpenses.ts](src/lib/hooks/useExpenses.ts) - Core business logic hook
4. [src/components/providers/AuthProvider.tsx](src/components/providers/AuthProvider.tsx) - Authentication pattern
5. [src/components/expense/AddExpenseSheet.tsx](src/components/expense/AddExpenseSheet.tsx) - Complex form component template

---

## Success Metrics

- **Development velocity**: Complete in 10 weeks or less
- **Performance**: 60fps animations, <2s time to interactive
- **Code reuse**: >60% shared code
- **Crash-free rate**: >99.5%
- **Test coverage**: >70% for shared packages

---

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Firebase adapter complexity | Start with web SDK, migrate to native later |
| Icon mapping incomplete | Create comprehensive mapping early, default icon fallback |
| Calendar picker UX mismatch | Prototype early, simple date input as alternative |
| Shared hooks break web | Keep web using local hooks until mobile stable |
| App store approval delays | Submit early, allow 2 weeks buffer |

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Setup | Monorepo + shared packages |
| 2 | Auth | Expo app + Google Sign-In |
| 3 | Navigation | Bottom tabs + theme system |
| 4 | UI | Component library |
| 5 | Expenses | CRUD with bottom sheets |
| 6 | Features | Dashboard + Insights |
| 7 | Settings | Full configuration |
| 8 | Polish | Animations + optimization |
| 9 | Testing | QA across platforms |
| 10 | Deploy | App Store + Google Play |

**Total**: 10 weeks to production-ready mobile apps for iOS and Android
