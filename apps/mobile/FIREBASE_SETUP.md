# Firebase Setup for Mobile App

The mobile app uses **React Native Firebase** to connect to the **same Firebase project** as the web app.

## Prerequisites

You need to download Firebase configuration files from your Firebase Console.

### Step 1: Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your existing "expense-tracker" project (the same one used by the web app)

### Step 2: Add iOS App (if building for iOS)

1. Click the gear icon ⚙️ → **Project settings**
2. Scroll down to "Your apps"
3. Click **"Add app"** → Select **iOS**
4. Fill in:
   - **iOS bundle ID**: `com.expensetracker.app` (matches `apps/mobile/app.json`)
   - **App nickname**: "Expense Tracker iOS" (optional)
   - Skip the rest for now
5. **Download `GoogleService-Info.plist`**
6. Place it in: `/Users/yazhodha/expense-tracker/apps/mobile/GoogleService-Info.plist`

### Step 3: Add Android App (if building for Android)

1. In the same "Project settings" page
2. Click **"Add app"** → Select **Android**
3. Fill in:
   - **Android package name**: `com.expensetracker.app` (matches `apps/mobile/app.json`)
   - **App nickname**: "Expense Tracker Android" (optional)
   - **Debug signing certificate SHA-1**: Get this by running:
     ```bash
     cd apps/mobile
     npx expo run:android
     # or generate with:
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
4. **Download `google-services.json`**
5. Place it in: `/Users/yazhodha/expense-tracker/apps/mobile/google-services.json`

### Step 4: Enable Google Sign-In

Your Firebase project should already have Google Sign-In enabled from the web app setup.

Verify in Firebase Console:
1. Go to **Authentication** → **Sign-in method**
2. Ensure **Google** is enabled

### Step 5: Configure Google Sign-In for Mobile

You'll need the **Web Client ID** from your Firebase project:

1. In Firebase Console → **Authentication** → **Sign-in method** → **Google**
2. Copy the **Web client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
3. You'll use this in the AuthContext when initializing Google Sign-In

## File Structure After Setup

```
apps/mobile/
├── google-services.json          # Android (DO NOT commit)
├── GoogleService-Info.plist      # iOS (DO NOT commit)
└── app.json                      # Already configured
```

## Security Note

**IMPORTANT**: Both files are already listed in `.gitignore`. Never commit these files to version control!

## Next Steps

After placing these files:
1. Run `npx expo prebuild` to generate native projects
2. Test authentication on a device or simulator
3. Users who sign in on mobile will see the same data as on web!

## Same Database, Different SDK

- **Web app**: Uses Firebase Web SDK
- **Mobile app**: Uses React Native Firebase (native modules)
- **Both connect to**: The same Firebase project and Firestore database
- **Result**: Seamless data sync between platforms!
