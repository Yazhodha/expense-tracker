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

// Cycle History & Comparison Types
export interface CycleSummary {
  cycle: BillingCycle;
  cycleId: string;           // Unique ID: YYYY-MM-DD
  totalSpent: number;
  budgetLimit: number;
  percentUsed: number;
  isOverBudget: boolean;
  expenseCount: number;
  avgDailySpending: number;
  categoryBreakdown: CategorySpending[];
  topExpenses: Expense[];    // Top 5 expenses
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  expenseCount: number;
  percentOfTotal: number;
}

export interface CycleComparison {
  cycle1: CycleSummary;
  cycle2: CycleSummary;
  totalSpentDiff: number;
  totalSpentDiffPercent: number;
  budgetPerformanceDiff: number; // Difference in percentUsed
  categoryComparisons: CategoryComparison[];
  metrics: MetricsComparison;
  overallTrend: 'improved' | 'stable' | 'worsened';
}

export interface CategoryComparison {
  categoryId: string;
  categoryName: string;
  cycle1Amount: number;
  cycle2Amount: number;
  difference: number;
  percentChange: number;
  trend: 'improved' | 'stable' | 'worsened';
}

export interface MetricsComparison {
  avgDailySpending: {
    cycle1: number;
    cycle2: number;
    difference: number;
    percentChange: number;
  };
  largestExpense: {
    cycle1: number;
    cycle2: number;
    difference: number;
  };
  expenseCount: {
    cycle1: number;
    cycle2: number;
    difference: number;
    percentChange: number;
  };
}

// MCP Tool Types (web-only, but included for completeness)
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
