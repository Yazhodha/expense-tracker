# How to Run and Test the Mobile App

This guide explains how to run and test the mobile app with **real Firebase authentication**.

## TL;DR - Quick Commands

**After you've set up Firebase (see below):**

```bash
cd apps/mobile

# First time only: generate native projects
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

---

## Why Development Build?

We're using **React Native Firebase** and **native Google Sign-In**, which require native code. This means:

❌ **Won't work with Expo Go** (Expo Go doesn't have native modules)
✅ **Works with Development Build** (includes all native code)

---

## Before You Start - Firebase Setup Required

You need **3 files** before the app will run:

### 1. `google-services.json` (Android config)
- Download from Firebase Console
- Location: `apps/mobile/google-services.json`

### 2. `GoogleService-Info.plist` (iOS config)
- Download from Firebase Console
- Location: `apps/mobile/GoogleService-Info.plist`

### 3. `.env` (Google Sign-In config)
- Create from `.env.example`
- Location: `apps/mobile/.env`
- Contains your Google Web Client ID

**Don't have these yet?**
→ See [QUICKSTART.md](./QUICKSTART.md) for step-by-step instructions
→ Or [CHECKLIST.md](./CHECKLIST.md) for a quick checklist

---

## Step-by-Step: First Time Setup

### 1. Get Firebase Files

Follow [QUICKSTART.md](./QUICKSTART.md) Step 1 to download:
- `google-services.json`
- `GoogleService-Info.plist`

Place both in `apps/mobile/` directory.

### 2. Configure Google Sign-In

Create `.env` file:
```bash
cd apps/mobile
cp .env.example .env
# Edit .env and add your Google Web Client ID
```

### 3. Generate Native Projects

```bash
cd apps/mobile
npx expo prebuild --clean
```

This creates `ios/` and `android/` folders with all native code.

**Expected output:**
```
✔ Created native directories
✔ Updated package.json
✔ Config synced
✔ Installed pods (iOS only)
```

---

## Running the App

### Option A: iOS Simulator (Mac + Xcode Required)

```bash
cd apps/mobile
npx expo run:ios
```

**What happens:**
1. Builds iOS app (5-10 min first time, then faster)
2. Opens iOS Simulator
3. Installs and launches app

**Simulator controls:**
- Cmd+D = Developer menu
- Cmd+R = Reload app
- Cmd+Ctrl+Z = Shake gesture (for React Native dev menu)

### Option B: Android Emulator (Any OS + Android Studio)

```bash
cd apps/mobile
npx expo run:android
```

**Prerequisites:**
- Android Studio installed
- Android emulator created and running
- ANDROID_HOME environment variable set

**What happens:**
1. Builds Android app
2. Finds running emulator
3. Installs and launches app

### Option C: Physical Device (Advanced)

**iOS (requires Apple Developer account):**
```bash
# Connect iPhone via USB
npx expo run:ios --device
```

**Android:**
```bash
# Enable USB debugging on Android phone
# Connect via USB
npx expo run:android --device
```

---

## What to Expect

### 1. Loading Screen (1 second)
- Shows "Loading Expense Tracker..."
- Checks authentication state

### 2. Login Screen
- Shows app logo (wallet icon)
- "Expense Tracker" title
- "Sign in with Google" button

### 3. Tap "Sign in with Google"
- Google Sign-In sheet appears
- Select your Google account
- Grants permissions

### 4. Authentication Success
- Toast: "Welcome! Signed in successfully"
- App loads user profile from Firebase
- **Currently stays on loading screen** (Phase 3 will add main screens)

### 5. Console Logs
Check Terminal for:
```
User authenticated: your-email@gmail.com
```

---

## Development Workflow

After initial setup, daily workflow is simple:

```bash
# Start working
cd apps/mobile

# Run app (fast after first time!)
npx expo run:ios  # or run:android

# Edit code → Changes appear automatically (Fast Refresh)
# No need to rebuild unless you change native code
```

**Fast Refresh:**
- Edit `.tsx` files → Changes appear in ~1 second
- Edit styles → Updates instantly
- Syntax error → Error overlay appears

**When to rebuild:**
- Added new native dependency
- Changed `app.json`
- Modified native code in `ios/` or `android/`

---

## Testing Checklist

Use this to verify everything works:

- [ ] App builds without errors
- [ ] Loading screen appears
- [ ] Redirects to login screen
- [ ] Login screen UI looks good
- [ ] "Sign in with Google" button visible
- [ ] Tapping button shows Google Sign-In
- [ ] Can select Google account
- [ ] Success toast appears
- [ ] Console shows "User authenticated"
- [ ] No crash or errors

---

## Troubleshooting

### Build Errors

**"Unable to resolve module"**
```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
npx expo prebuild --clean
```

**"Command PhaseScriptExecution failed" (iOS)**
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

**"Task :app:processDebugGoogleServices FAILED" (Android)**
- Verify `google-services.json` is in `apps/mobile/` (not `android/app/`)
- File must be valid JSON
- Run `npx expo prebuild --clean`

### Runtime Errors

**"No Firebase App '[DEFAULT]' has been created"**
- Firebase config files missing or in wrong location
- Run `ls apps/mobile/google-services.json apps/mobile/GoogleService-Info.plist`
- Both should exist

**"Google Sign-In failed"**
- Check `.env` has correct `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Must be the **Web client ID** from Firebase, not iOS or Android
- Firebase Console → Authentication → Sign-in method → Google → Web client ID

**App crashes immediately**
- Check Terminal for error stack trace
- Look in Xcode/Android Studio logs
- Common issue: Invalid Firebase config file format

### Development Server Issues

**Metro bundler won't start**
```bash
# Kill existing Metro processes
lsof -ti:8081 | xargs kill -9
npx expo start
```

**Changes not appearing**
- Press `R` in iOS Simulator (or Cmd+R)
- Shake Android device → Reload
- Or in Terminal: press `r`

---

## Comparing to Web App

| Feature | Web App | Mobile App | Same? |
|---------|---------|------------|-------|
| Firebase Project | ✅ | ✅ | ✅ Same project |
| Firestore Database | ✅ | ✅ | ✅ Same database |
| User Authentication | ✅ | ✅ | ✅ Same accounts |
| Google Sign-In | ✅ | ✅ | ✅ Same method |
| User Data | ✅ | ✅ | ✅ Syncs automatically |
| Technology | Next.js + Web SDK | React Native + Native SDK | ❌ Different SDKs |

**Result:** Sign in on mobile → See same expenses as web! 🎉

---

## Performance Notes

**First build:**
- iOS: 5-10 minutes
- Android: 5-8 minutes

**Subsequent builds:**
- iOS: 1-2 minutes
- Android: 30-60 seconds

**Fast Refresh (code changes):**
- ~1 second for most changes

**App startup:**
- ~2-3 seconds on simulator/emulator
- ~1-2 seconds on physical device

---

## What's Built (Phase 2 Complete)

✅ Expo app with TypeScript
✅ Expo Router navigation
✅ React Native Paper UI
✅ Firebase authentication
✅ Google Sign-In integration
✅ Auth state management
✅ User profile creation/loading
✅ Toast notifications
✅ Loading/login screens

---

## What's Next (Phase 3)

After you test authentication:

🚧 Bottom tabs navigation
🚧 Dashboard screen
🚧 Settings screen
🚧 Dark mode theme
🚧 Theme persistence

---

## Need More Help?

📖 **[QUICKSTART.md](./QUICKSTART.md)** - Detailed step-by-step setup
📋 **[CHECKLIST.md](./CHECKLIST.md)** - Track your progress
🔥 **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase-specific instructions
📱 **[README.md](./README.md)** - General project overview

---

## Quick Reference

```bash
# Setup (one time)
npx expo prebuild --clean

# Run
npx expo run:ios
npx expo run:android

# Clean build
rm -rf ios android
npx expo prebuild --clean

# Reinstall
rm -rf node_modules
pnpm install
npx expo prebuild --clean

# View logs
npx expo run:ios --no-build-cache
npx expo run:android --verbose
```

---

**Ready to test?** 🚀

1. Get Firebase files from [Firebase Console](https://console.firebase.google.com/)
2. Follow [QUICKSTART.md](./QUICKSTART.md)
3. Run `npx expo run:ios` or `npx expo run:android`
4. Test authentication!
