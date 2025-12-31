# Mobile App Quick Start Guide

Follow these steps to run the mobile app with **real Firebase authentication**.

## Prerequisites

Before starting, make sure you have:
- ✅ Node.js and pnpm installed
- ✅ Xcode installed (for iOS, Mac only) OR Android Studio (for Android)
- ✅ Your Firebase project from the web app

---

## Step 1: Download Firebase Configuration Files

You need to get two files from your Firebase Console.

### 1A. Get google-services.json (Android)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your **expense-tracker** project (the same one used by your web app)
3. Click the ⚙️ gear icon → **Project settings**
4. Scroll down to **"Your apps"** section
5. Click **"Add app"** → Select **Android** (robot icon)
6. Fill in the form:
   - **Android package name**: `com.expensetracker.app` (copy this exactly!)
   - **App nickname**: "Expense Tracker Android" (optional)
   - **Debug signing certificate SHA-1**: Leave blank for now (we'll add it later)
7. Click **"Register app"**
8. Click **"Download google-services.json"**
9. **Save it to**: `/Users/yazhodha/expense-tracker/apps/mobile/google-services.json`

### 1B. Get GoogleService-Info.plist (iOS)

1. In the same Firebase Console → Project settings
2. In **"Your apps"** section, click **"Add app"** → Select **iOS** (Apple icon)
3. Fill in the form:
   - **iOS bundle ID**: `com.expensetracker.app` (copy this exactly!)
   - **App nickname**: "Expense Tracker iOS" (optional)
   - **App Store ID**: Leave blank
4. Click **"Register app"**
5. Click **"Download GoogleService-Info.plist"**
6. **Save it to**: `/Users/yazhodha/expense-tracker/apps/mobile/GoogleService-Info.plist`

**Important**: Both files must be in the `apps/mobile/` directory, not in subfolders!

---

## Step 2: Get Google Web Client ID

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Find **Google** in the providers list
3. If not enabled, enable it now
4. Click on **Google** to expand it
5. You'll see **"Web client ID"** - it looks like: `123456789-abc123def456.apps.googleusercontent.com`
6. **Copy this ID** (you'll need it in the next step)

39820487912-bt6i6o5fecvp18gvfjok5rh2rjqrvv10.apps.googleusercontent.com

---

## Step 3: Create .env File

1. In your terminal, go to the mobile app directory:
   ```bash
   cd /Users/yazhodha/expense-tracker/apps/mobile
   ```

2. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and add your Web Client ID:
   ```bash
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR-ACTUAL-WEB-CLIENT-ID-HERE.apps.googleusercontent.com
   ```

   Replace `YOUR-ACTUAL-WEB-CLIENT-ID-HERE` with the ID you copied in Step 2.

---

## Step 4: Verify File Locations

Make sure you have these files in the correct locations:

```
apps/mobile/
├── google-services.json          ✅ Must be here
├── GoogleService-Info.plist      ✅ Must be here
└── .env                          ✅ Must be here
```

Check with this command:
```bash
cd /Users/yazhodha/expense-tracker/apps/mobile
ls -la google-services.json GoogleService-Info.plist .env
```

You should see all three files listed. If any are missing, go back to the relevant step.

---

## Step 5: Build the Development App

Now we'll generate the native iOS and Android projects.

```bash
cd /Users/yazhodha/expense-tracker/apps/mobile

# Generate native projects (this takes 2-3 minutes)
npx expo prebuild --clean
```

This will:
- Create `ios/` and `android/` folders
- Install native dependencies
- Configure Firebase
- Setup Google Sign-In

**Expected output**: You should see ✅ checkmarks for iOS and Android setup.

---

## Step 6A: Run on iOS Simulator (Mac Only)

```bash
# Make sure you're in the mobile directory
cd /Users/yazhodha/expense-tracker/apps/mobile

# Run on iOS simulator
npx expo run:ios
```

This will:
1. Build the iOS app (first time takes 5-10 minutes)
2. Launch iOS Simulator
3. Install and run the app

**First time?** The build will take longer. Subsequent runs are faster!

---

## Step 6B: Run on Android Emulator (Alternative)

If you prefer Android or don't have a Mac:

```bash
# Make sure Android Studio and an emulator are set up
# Then run:
cd /Users/yazhodha/expense-tracker/apps/mobile
npx expo run:android
```

---

## Step 7: Test Authentication

Once the app launches:

1. You'll see a loading screen briefly
2. Then the **login screen** with "Sign in with Google" button
3. Tap the button
4. Google Sign-In sheet will appear
5. Select your Google account (same one you use on web)
6. ✅ **Success!** You're now authenticated

**Important**: The app connects to your **same Firebase database** as the web app. Your data syncs automatically!

---

## Troubleshooting

### "Command PhaseScriptExecution failed" (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

### "Task :app:processDebugGoogleServices FAILED" (Android)
- Make sure `google-services.json` is in `apps/mobile/` (not in `android/app/`)
- Run `npx expo prebuild --clean` again

### "Google Sign-In failed"
- Check that `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is correct in `.env`
- Verify Google Sign-In is enabled in Firebase Console
- Make sure you're using the **Web client ID**, not iOS or Android client ID

### "No Firebase App '[DEFAULT]' has been created"
- Make sure Firebase config files are in the right location
- Run `npx expo prebuild --clean` to regenerate native projects

### App crashes on launch
- Check Terminal for error messages
- Make sure both Firebase config files are valid JSON/plist
- Try cleaning and rebuilding:
  ```bash
  npx expo prebuild --clean
  npx expo run:ios  # or run:android
  ```

---

## Development Workflow

After initial setup, your daily workflow is simple:

```bash
# Start developing
cd /Users/yazhodha/expense-tracker/apps/mobile

# Run on iOS
npx expo run:ios

# OR run on Android
npx expo run:android

# Make code changes → Hot reload happens automatically!
```

**Fast Refresh**: When you edit files, changes appear instantly without rebuilding!

---

## What's Working Now

✅ App launches successfully
✅ Login screen displays
✅ Google Sign-In authentication
✅ Firebase connection (same database as web)
✅ User profile creation/loading
✅ Navigation routing
✅ Toast notifications

---

## Next Steps - Phase 3

After you've tested authentication, we'll continue with:
- Bottom tabs navigation (Dashboard, Insights, Settings)
- Dark mode theme system
- Settings screen
- More features!

---

## Need Help?

If you run into issues:
1. Check the error message in Terminal
2. Look in the Troubleshooting section above
3. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for more details
4. Make sure all files are in the correct locations

**Remember**: You only need to do Steps 1-5 once. After that, just `npx expo run:ios` or `npx expo run:android` to launch!
