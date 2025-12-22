# SpendWise - Expense Tracker App

A modern expense tracking application built with Next.js, Firebase, and Tailwind CSS.

## ✅ Implementation Status

### Core Features - **COMPLETE** ✅
- ✅ Next.js 14 with TypeScript and App Router
- ✅ Firebase Authentication (Google Sign-in)
- ✅ Real-time Firestore database sync
- ✅ Expense tracking (Add, Edit, Delete, Search)
- ✅ Budget monitoring with billing cycles
- ✅ Category-based organization
- ✅ Animated UI components (Framer Motion)
- ✅ Mobile-first responsive design
- ✅ Protected routes & user settings

### Enhanced Features - **COMPLETE** ✅
- ✅ Expense search (merchant, category, note, amount)
- ✅ Basic insights (category breakdown, daily trends)
- ✅ Settings page (budget configuration)
- ✅ Edit/Delete expense functionality

### Next Up: Analytics & Insights 📊
See [`docs/analytics-insights-plan.md`](docs/analytics-insights-plan.md) for detailed roadmap

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

### Phase 5: Historical Cycle Comparison - **IN PROGRESS**
- Previous vs current cycle comparison
- Cycle history page (last 6 months)
- Trend indicators and insights

### Phase 6-9: Analytics & Insights - **PLANNED**
- Category spending trends over time
- Spending pattern analysis (weekday/weekend, peak days)
- Smart insights engine with recommendations
- Spending velocity & projections

### Future Enhancements
- Push notifications & budget alerts
- Spending score & gamification
- Export reports (PDF/CSV)
- MCP integration for Claude AI (optional)

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

### Current Features
- 🔐 Google Authentication
- 💰 Monthly budget tracking with customizable limits
- 📅 Flexible billing cycle (configurable start date)
- 📊 Real-time expense tracking with search
- ✏️ Edit and delete expenses
- 📈 Category breakdown and spending insights
- 🎨 Beautiful, animated UI (Framer Motion)
- 📱 Mobile-first responsive design
- ⚡ Instant sync across devices (Firebase)

### Coming Soon
- 📊 Historical cycle comparisons
- 📈 Category spending trends
- 🎯 Smart spending insights
- 🔔 Budget alerts & notifications
- 💯 Spending score
- 📥 Export data (CSV/PDF)

## 📚 Documentation

- [`docs/analytics-insights-plan.md`](docs/analytics-insights-plan.md) - Detailed plan for analytics features
- [`docs/archive-original-implementation-plan.md`](docs/archive-original-implementation-plan.md) - Original implementation plan (archived)

## 📄 License

MIT

## 👤 Author

Yashodha

---

**Status:** Core Complete ✅ | Analytics In Progress 📊 | Build Status: ✅ Passing | Firebase: ✅ Deployed
