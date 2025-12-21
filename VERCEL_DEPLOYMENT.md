# Vercel Deployment Guide

This guide explains how to deploy SpendWise to Vercel with MCP API support.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Firebase project with Admin SDK credentials
3. Git repository (already setup)

## Step 1: Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `spendwise-expense-tracker-app`
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file (keep it secure!)

From the downloaded JSON file, you'll need:
- `project_id`
- `client_email`
- `private_key`

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add Environment Variables:

   **Public Variables** (Frontend):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   **Secret Variables** (MCP API - Server-side only):
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   **Important**: The `FIREBASE_PRIVATE_KEY` must include the full key with line breaks. Copy the entire value from the JSON file including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`.

6. Click **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: spendwise-expense-tracker
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY

# Deploy to production
vercel --prod
```

## Step 3: Verify Deployment

After deployment, you'll get a URL like: `https://spendwise-expense-tracker.vercel.app`

### Test the MCP API

```bash
# Test the MCP endpoint
curl https://your-deployment-url.vercel.app/api/mcp

# Expected response:
{
  "protocolVersion": "2024-11-05",
  "capabilities": { "tools": {} },
  "serverInfo": {
    "name": "spendwise-expense-tracker",
    "version": "1.0.0"
  },
  "tools": [...]
}
```

## Step 4: Configure Claude Desktop (Optional)

To use the MCP server with Claude Desktop, add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "spendwise": {
      "url": "https://your-deployment-url.vercel.app/api/mcp",
      "headers": {
        "Content-Type": "application/json"
      }
    }
  }
}
```

## MCP API Endpoints

### GET /api/mcp
Returns MCP server info and available tools.

### POST /api/mcp
Execute MCP tools:

**Available Tools:**
1. `add_expenses` - Add one or more expenses
2. `get_summary` - Get current billing cycle budget summary
3. `get_expenses` - Get list of expenses with optional date range

**Example Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_summary",
    "arguments": {},
    "userId": "firebase_user_id"
  }
}
```

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Environment Variables Management

Update environment variables:
```bash
# Via CLI
vercel env add VARIABLE_NAME

# Or via dashboard
https://vercel.com/your-account/spendwise-expense-tracker/settings/environment-variables
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `FIREBASE_PRIVATE_KEY` has proper formatting with `\n` for line breaks

### MCP API Returns 500
- Verify Firebase Admin credentials are correct
- Check Vercel function logs
- Ensure `userId` is passed in the request

### Authentication Issues
- Verify public Firebase config variables
- Check Firebase Auth is enabled for your domain in Firebase Console

## Cost Considerations

Vercel Free Tier includes:
- 100GB bandwidth
- Unlimited deployments
- Serverless Functions (limited execution time)

For production with heavy MCP usage, consider upgrading to Pro plan.

## Migration from Firebase Hosting

The app has been migrated from Firebase Hosting to Vercel to support:
- MCP API routes (server-side functions)
- Better Next.js integration
- Automatic CI/CD from Git

Firebase services still used:
- Firestore (database)
- Firebase Auth (authentication)
- Firebase Admin SDK (server-side)

## Support

For issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
