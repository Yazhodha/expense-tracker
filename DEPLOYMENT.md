# Deployment Instructions - Firebase Hosting

## Prerequisites
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project already created: `spendwise-expense-tracker-app`

## First-Time Setup

1. **Login to Firebase** (one-time):
   ```bash
   firebase login
   ```
   This will open a browser for authentication.

2. **Verify project connection**:
   ```bash
   firebase projects:list
   ```
   You should see `spendwise-expense-tracker-app` in the list.

## Deploy to Production

Run the deployment script:
```bash
npm run deploy
```

This will:
1. Build the Next.js app with static export
2. Generate files in the `out/` directory
3. Deploy to Firebase Hosting

## Manual Deployment Steps

If you prefer to deploy manually:

```bash
# 1. Build the app
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

## After Deployment

Your app will be live at:
- **Firebase URL**: `https://spendwise-expense-tracker-app.web.app`
- **Custom domain** (if configured): Your custom domain

## Testing Before Deploy

To test the production build locally:

```bash
# Build the app
npm run build

# Serve locally using Firebase emulator
firebase serve --only hosting
```

Or use a simple HTTP server:
```bash
cd out
python3 -m http.server 8080
# Visit http://localhost:8080
```

## Important Notes

- ✅ Firebase Hosting serves from the `out/` directory (static export)
- ✅ All routes are rewritten to `index.html` for client-side routing
- ✅ Images are set to `unoptimized: true` for static export
- ⚠️ Make sure `.env.local` has correct Firebase config (not deployed to hosting)
- ⚠️ Environment variables are baked into the build at build time

## Troubleshooting

**Build fails?**
- Check that `next.config.js` has `output: 'export'`
- Ensure all dynamic features are compatible with static export

**Login issues?**
```bash
firebase logout
firebase login
```

**Wrong project?**
Check `.firebaserc` file - should point to `spendwise-expense-tracker-app`
