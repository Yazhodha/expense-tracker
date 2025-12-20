# SpendWise - Expense Tracker App

A modern expense tracking application built with Next.js, Firebase, and Tailwind CSS.

## ✅ Implementation Status

### Phase 1: Project Setup & Foundation - **COMPLETE**
- ✅ Next.js 14 with TypeScript and App Router
- ✅ Tailwind CSS v3 with shadcn/ui components
- ✅ Project structure with organized folders
- ✅ TypeScript type definitions
- ✅ Environment variables template

### Phase 2: Firebase Setup & Authentication - **COMPLETE**
- ✅ Firebase configuration
- ✅ Google Authentication with AuthProvider
- ✅ Utility functions (currency formatting, billing cycles)
- ✅ Login page with animations
- ✅ Protected dashboard layout

### Completed Components
- ✅ Button, Card, Input, Label
- ✅ Avatar, Dropdown Menu, Switch
- ✅ Sheet (Bottom Sheet)
- ✅ Bottom Navigation
- ✅ Dashboard Layout with Header

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (use `nvm use 20` if you have nvm)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository and install dependencies:
```bash
cd expense-tracker
npm install
```

2. Set up Firebase:
   - Create a new project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication → Google sign-in
   - Create a Firestore database
   - Copy your configuration

3. Create `.env.local` from the template:
```bash
cp .env.local.example .env.local
```

4. Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
expense-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # Login page
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── insights/       # Analytics (coming soon)
│   │   │   ├── settings/       # Settings (coming soon)
│   │   │   └── layout.tsx      # Protected layout
│   │   ├── api/                # API routes (future MCP)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Root redirect
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── dashboard/          # Dashboard-specific components (future)
│   │   ├── expense/            # Expense-related components (future)
│   │   ├── layout/
│   │   │   └── BottomNav.tsx   # Bottom navigation
│   │   └── providers/
│   │       └── AuthProvider.tsx # Authentication context
│   └── lib/
│       ├── firebase/
│       │   └── config.ts       # Firebase initialization
│       ├── types/
│       │   └── index.ts        # TypeScript interfaces
│       ├── utils/
│       │   ├── currency.ts     # Currency formatting
│       │   └── dates.ts        # Billing cycle calculations
│       └── utils.ts            # Utility functions (cn)
├── .env.local.example          # Environment variables template
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## 🎯 Next Steps

### Phase 3: Core UI Components
- Budget Ring (circular progress indicator)
- Expense List with grouping
- Expense Item component
- Add Expense Sheet (bottom drawer)
- Category Picker

### Phase 4: Firebase Integration & Data Hooks
- Firestore functions for CRUD operations
- Real-time expense subscription
- Budget calculation hooks
- User settings management

### Phase 5: MCP Server Integration
- MCP server for Claude integration
- Expense extraction from screenshots
- Tools: add_expenses, get_summary, get_expenses

### Phase 6: Push Notifications
- Service worker for FCM
- Budget threshold alerts
- Notification permissions

### Phase 7-10: Complete Features
- Insights page with charts
- Settings page
- PWA setup
- Vercel deployment

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **UI Components:** shadcn/ui + Radix UI
- **Animations:** Framer Motion
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google)
- **Icons:** Lucide React
- **Deployment:** Vercel (planned)

## 📝 Features

- 🔐 Google Authentication
- 💰 Monthly budget tracking (Rs. 100,000 default)
- 📅 Billing cycle management (15th - 14th)
- 📊 Real-time expense tracking
- 🎨 Beautiful, responsive UI
- 🌙 Mobile-first design
- 🔔 Budget alerts (planned)
- 🤖 Claude AI integration via MCP (planned)

## 🐛 Known Issues

- Firebase environment variables need to be configured
- Insights and Settings pages are placeholders
- MCP integration pending

## 📄 License

MIT

## 👤 Author

Yashodha

---

**Status:** Phase 1 & 2 Complete ✅ | Build Status: ✅ Passing
