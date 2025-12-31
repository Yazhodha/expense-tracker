# Expense Tracker - Mobile App (React Native with Expo)

A native mobile app for iOS and Android that syncs with the web app using the same Firebase backend.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (workspace already configured)
- Expo CLI
- Firebase configuration files (see Setup below)

### Setup Firebase

**You must complete this before running the app:**

1. Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions
2. Download `google-services.json` and `GoogleService-Info.plist` from Firebase Console
3. Place them in this directory (`apps/mobile/`)
4. Create `.env` file with your Google Web Client ID

### Install Dependencies

```bash
# From workspace root
pnpm install

# Or from this directory
cd apps/mobile && pnpm install
```

### Run the App

```bash
# Start Expo development server
pnpm start

# Run on specific platform
pnpm ios        # iOS simulator (Mac only)
pnpm android    # Android emulator
pnpm web        # Web browser (for testing)
```

### Development Commands

```bash
pnpm start      # Start Expo dev server
pnpm ios        # Run on iOS
pnpm android    # Run on Android
pnpm web        # Run on web browser
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Entry point with auth check
│   └── (auth)/            # Authentication screens
│       └── login.tsx      # Google Sign-In screen
├── src/
│   ├── components/        # Reusable UI components (Phase 4+)
│   ├── providers/
│   │   └── AuthContext.tsx    # Authentication provider
│   ├── utils/
│   │   ├── firebase.ts        # Firebase initialization
│   │   └── googleSignIn.ts    # Google Sign-In helpers
│   └── types/             # Local TypeScript types
├── assets/                # Images, fonts, icons
├── .env                   # Environment variables (create this)
├── .env.example          # Environment variables template
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
└── package.json          # Dependencies
```

## Technology Stack

- **Framework:** React Native 0.81 with Expo ~54.0
- **Navigation:** Expo Router (file-based routing)
- **UI Library:** React Native Paper 5.12 (Material Design 3)
- **Backend:** Firebase (same project as web app)
  - @react-native-firebase/auth
  - @react-native-firebase/firestore
- **Authentication:** Google Sign-In
- **Animations:** React Native Reanimated 3.16
- **State:** React Context + Shared packages
- **Language:** TypeScript 5.9

## Shared Packages

This app imports from workspace packages:

- `@expense-tracker/shared-types` - TypeScript interfaces
- `@expense-tracker/shared-utils` - Utility functions
- `@expense-tracker/shared-firebase` - Firebase operations (web SDK)
- `@expense-tracker/shared-hooks` - React hooks

Note: The mobile app uses React Native Firebase instead of the web SDK, but connects to the same Firebase project.

## Features Implemented

### ✅ Phase 1: Monorepo Setup
- Workspace packages created
- Code extraction complete

### ✅ Phase 2: Expo App & Authentication
- Expo app initialized
- Google Sign-In working
- Firebase authentication
- User profile auto-creation
- Login screen

### 🚧 Phase 3: Navigation & Theme (Next)
- Bottom tabs navigation
- Dark mode support
- Settings screen
- Theme persistence

### 📋 Future Phases
- Phase 4: Core UI Components
- Phase 5: Expense Management
- Phase 6: Dashboard & Insights
- Phase 7: Settings & Configuration
- Phase 8: Polish & Optimization
- Phase 9: Testing & QA
- Phase 10: Deployment

## Same Data as Web App

**Important:** This mobile app connects to the **same Firebase project** as the web app.

✅ Same user accounts
✅ Same Firestore database
✅ Same expenses and settings
✅ Automatic sync between platforms

Users can seamlessly switch between web and mobile - all data is shared!

## Configuration Files Needed

Before running the app, you need these files (not in version control):

1. **google-services.json** (Android) - From Firebase Console
2. **GoogleService-Info.plist** (iOS) - From Firebase Console
3. **.env** - Copy from `.env.example` and fill in values

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for instructions.

## Development Notes

### Hot Reloading
- Changes to files in `app/` or `src/` trigger fast refresh
- Changes to shared packages also trigger reload
- Press `r` in terminal to reload manually

### Platform-Specific Code
Use Platform API for platform-specific implementations:
```typescript
import { Platform } from 'react-native';

const value = Platform.select({
  ios: 'iOS value',
  android: 'Android value',
  default: 'Default value',
});
```

### Debugging
- Press `j` to open Chrome DevTools
- Use React Native Debugger for better experience
- `console.log()` appears in terminal and browser console

## Documentation

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration guide
- [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) - Phase 2 completion summary
- [../docs/MOBILE_APP_IMPLEMENTATION_PLAN.md](../../docs/MOBILE_APP_IMPLEMENTATION_PLAN.md) - Full implementation plan

## Current Status

**Phase 2 Complete** - Authentication working, ready for Phase 3 (Navigation & Theme)

See [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) for detailed status.

## Troubleshooting

### "Firebase configuration not found"
- Make sure `google-services.json` and `GoogleService-Info.plist` are in `apps/mobile/`
- Run `npx expo prebuild` to generate native folders

### "Google Sign-In failed"
- Check that `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is set in `.env`
- Verify the Web Client ID is correct in Firebase Console
- Make sure Google Sign-In is enabled in Firebase Authentication

### "Module not found: @expense-tracker/..."
- Run `pnpm install` from workspace root
- Shared packages must be built first

### iOS build errors
- Run `npx pod-install` in `apps/mobile/ios/` after `npx expo prebuild`
- Clean build: `cd ios && pod deintegrate && pod install`

### Android build errors
- Make sure Android SDK is installed
- Check that `google-services.json` is in the correct location
- Run `cd android && ./gradlew clean`

## License

Part of the Expense Tracker monorepo.
