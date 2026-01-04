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
  currency: string;          // Currency symbol: "Rs.", "$", "₹", etc.
  currencyFormat: 'en-US' | 'en-IN' | 'en-GB' | 'en-EU' | 'en-LK'; // Default: 'en-LK'
  categories: Category[];
  notificationsEnabled: boolean;
  alertThresholds: number[]; // Default: [50, 75, 90, 100]
  theme: 'light' | 'dark' | 'system'; // Default: 'system'
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
