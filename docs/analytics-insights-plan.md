# SpendWise Analytics & Insights - Implementation Plan

## Overview
Transform SpendWise from basic expense tracking to an intelligent spending insights platform that helps users make better financial decisions through data-driven analytics.

## Core Philosophy
- **Informational over complexity** - Extract meaningful insights from spending data
- **Progressive insights** - More valuable insights as users accumulate data
- **Actionable recommendations** - Not just data, but what to do about it
- **Simple presentation** - Complex analysis, simple UI

---

## Current Status (Completed)

### ✅ Phase 1-4: Core Features (COMPLETE)
- Authentication & user management
- Expense tracking (CRUD operations)
- Real-time Firebase sync
- Budget monitoring with billing cycles
- Category-based organization
- Search functionality
- Edit/delete expenses

---

## New Features Implementation Plan

## Phase 5: Historical Cycle Comparison

### 5.1 Data Model Extension

Update `src/lib/types/index.ts`:

```typescript
export interface CycleSummary {
  cycleId: string;              // "2024-12-15_2025-01-14"
  userId: string;
  startDate: Date;
  endDate: Date;
  totalSpent: number;
  limit: number;
  percentUsed: number;
  categoryBreakdown: Record<string, number>;  // categoryId -> amount
  topMerchants: Array<{
    name: string;
    total: number;
    count: number;
  }>;
  expenseCount: number;
  avgDailySpending: number;
  peakSpendingDay: string;      // e.g., "Friday"
  status: 'under_budget' | 'near_limit' | 'over_budget';
  createdAt: Date;
}

export interface CycleComparison {
  current: CycleSummary;
  previous: CycleSummary | null;
  percentChange: number;
  amountDifference: number;
  trend: 'improving' | 'stable' | 'worsening';
  insights: string[];
}
```

### 5.2 Firestore Helper Functions

Create `src/lib/firebase/cycles.ts`:

```typescript
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './config';
import { CycleSummary } from '@/lib/types';
import { getBillingCycle } from '@/lib/utils/dates';
import { getExpensesForCycle } from './firestore';

export async function getPreviousCycleSummary(
  userId: string,
  billingDate: number
): Promise<CycleSummary | null> {
  const currentCycle = getBillingCycle(billingDate);
  const previousCycleStart = new Date(currentCycle.startDate);
  previousCycleStart.setMonth(previousCycleStart.getMonth() - 1);

  const previousCycle = getBillingCycle(billingDate, previousCycleStart);

  const expenses = await getExpensesForCycle(
    userId,
    previousCycle.startDate,
    previousCycle.endDate
  );

  if (expenses.length === 0) return null;

  // Calculate summary
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown: Record<string, number> = {};
  const merchantTotals = new Map<string, {total: number, count: number}>();

  expenses.forEach(expense => {
    categoryBreakdown[expense.category] =
      (categoryBreakdown[expense.category] || 0) + expense.amount;

    if (expense.merchant) {
      const current = merchantTotals.get(expense.merchant) || {total: 0, count: 0};
      merchantTotals.set(expense.merchant, {
        total: current.total + expense.amount,
        count: current.count + 1
      });
    }
  });

  const topMerchants = Array.from(merchantTotals.entries())
    .map(([name, data]) => ({name, ...data}))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    cycleId: `${previousCycle.startDate.toISOString()}_${previousCycle.endDate.toISOString()}`,
    userId,
    startDate: previousCycle.startDate,
    endDate: previousCycle.endDate,
    totalSpent,
    limit: 100000, // Get from user settings
    percentUsed: (totalSpent / 100000) * 100,
    categoryBreakdown,
    topMerchants,
    expenseCount: expenses.length,
    avgDailySpending: totalSpent / previousCycle.daysTotal,
    peakSpendingDay: '', // Calculate from expenses
    status: totalSpent > 100000 ? 'over_budget' : totalSpent > 90000 ? 'near_limit' : 'under_budget',
    createdAt: new Date(),
  };
}

export async function getCycleHistory(
  userId: string,
  billingDate: number,
  months: number = 6
): Promise<CycleSummary[]> {
  // Get last N cycles
  const summaries: CycleSummary[] = [];
  const currentDate = new Date();

  for (let i = 0; i < months; i++) {
    const cycleDate = new Date(currentDate);
    cycleDate.setMonth(cycleDate.getMonth() - i);

    const cycle = getBillingCycle(billingDate, cycleDate);
    const expenses = await getExpensesForCycle(userId, cycle.startDate, cycle.endDate);

    if (expenses.length > 0) {
      // Calculate summary (similar to above)
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      // ... rest of calculation
      summaries.push({
        cycleId: `${cycle.startDate.toISOString()}_${cycle.endDate.toISOString()}`,
        userId,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        totalSpent,
        limit: 100000,
        percentUsed: (totalSpent / 100000) * 100,
        categoryBreakdown: {},
        topMerchants: [],
        expenseCount: expenses.length,
        avgDailySpending: totalSpent / cycle.daysTotal,
        peakSpendingDay: '',
        status: totalSpent > 100000 ? 'over_budget' : 'under_budget',
        createdAt: new Date(),
      });
    }
  }

  return summaries;
}
```

### 5.3 Cycle Comparison Component

Create `src/components/dashboard/CycleComparison.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface CycleComparisonProps {
  current: {
    spent: number;
    startDate: Date;
    endDate: Date;
  };
  previous: {
    spent: number;
    startDate: Date;
    endDate: Date;
  } | null;
  currency?: string;
}

export function CycleComparison({ current, previous, currency = 'Rs.' }: CycleComparisonProps) {
  if (!previous) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Complete this cycle to see comparisons
          </p>
        </CardContent>
      </Card>
    );
  }

  const difference = current.spent - previous.spent;
  const percentChange = ((difference / previous.spent) * 100);
  const isImproving = difference < 0; // Spending less is good

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cycle Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Previous Cycle */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Previous</p>
            <p className="text-sm font-medium text-muted-foreground">
              {format(previous.startDate, 'MMM d')} - {format(previous.endDate, 'MMM d')}
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(previous.spent, currency)}
            </p>
          </div>

          {/* Current Cycle */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current</p>
            <p className="text-sm font-medium text-muted-foreground">
              {format(current.startDate, 'MMM d')} - {format(current.endDate, 'MMM d')}
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(current.spent, currency)}
            </p>
          </div>
        </div>

        {/* Change Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            isImproving
              ? 'bg-green-50 text-green-700'
              : difference === 0
              ? 'bg-gray-50 text-gray-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {isImproving ? (
            <TrendingDown className="w-5 h-5" />
          ) : difference === 0 ? (
            <Minus className="w-5 h-5" />
          ) : (
            <TrendingUp className="w-5 h-5" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isImproving && '🎉 '}
              {Math.abs(percentChange).toFixed(1)}% {isImproving ? 'less' : 'more'} than last cycle
            </p>
            <p className="text-xs opacity-80">
              {formatCurrency(Math.abs(difference), currency)} {isImproving ? 'saved' : 'extra'}
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
```

### 5.4 Update useExpenses Hook

Update `src/lib/hooks/useExpenses.ts` to include previous cycle data:

```typescript
// Add to the hook
const [previousCycleSummary, setPreviousCycleSummary] = useState<CycleSummary | null>(null);

useEffect(() => {
  if (!user) return;

  const fetchPreviousCycle = async () => {
    const prevSummary = await getPreviousCycleSummary(user.uid, user.settings.billingDate);
    setPreviousCycleSummary(prevSummary);
  };

  fetchPreviousCycle();
}, [user]);

return {
  // ... existing returns
  previousCycleSummary,
};
```

### 5.5 Add to Dashboard

Update `src/app/(dashboard)/dashboard/page.tsx`:

```typescript
// Import
import { CycleComparison } from '@/components/dashboard/CycleComparison';

// In component, after BudgetCard
{previousCycleSummary && (
  <CycleComparison
    current={{
      spent: summary.spent,
      startDate: summary.cycle.startDate,
      endDate: summary.cycle.endDate,
    }}
    previous={{
      spent: previousCycleSummary.totalSpent,
      startDate: previousCycleSummary.startDate,
      endDate: previousCycleSummary.endDate,
    }}
    currency={user.settings.currency}
  />
)}
```

---

## Phase 6: Cycle History Page

### 6.1 Create History Page

Create `src/app/(dashboard)/history/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCycleHistory } from '@/lib/firebase/cycles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { CycleSummary } from '@/lib/types';
import { TrendingUp, TrendingDown, Check, AlertCircle, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<CycleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      const history = await getCycleHistory(user.uid, user.settings.billingDate, 6);
      setCycles(history);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_budget':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'near_limit':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'over_budget':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'On Track';
      case 'near_limit':
        return 'Near Limit';
      case 'over_budget':
        return 'Over Budget';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Cycle History</h1>

      {cycles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No previous cycles found</p>
            <p className="text-sm mt-1">Complete your first billing cycle to see history</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cycles.map((cycle, index) => {
            const isCurrent = index === 0;

            return (
              <motion.div
                key={cycle.cycleId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={isCurrent ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d, yyyy')}
                        </CardTitle>
                        {isCurrent && (
                          <p className="text-xs text-primary mt-1">Current Cycle</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cycle.status)}
                        <span className={`text-sm font-medium ${
                          cycle.status === 'under_budget' ? 'text-green-600' :
                          cycle.status === 'near_limit' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {getStatusText(cycle.status)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Amount */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">
                        {formatCurrency(cycle.totalSpent, user.settings.currency)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        of {formatCurrency(cycle.limit, user.settings.currency)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          cycle.percentUsed >= 100 ? 'bg-red-500' :
                          cycle.percentUsed >= 90 ? 'bg-orange-500' :
                          'bg-primary'
                        }`}
                        style={{ width: `${Math.min(cycle.percentUsed, 100)}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t text-sm">
                      <div>
                        <p className="text-muted-foreground">Expenses</p>
                        <p className="font-semibold">{cycle.expenseCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Daily</p>
                        <p className="font-semibold">
                          {formatCurrency(Math.round(cycle.avgDailySpending), user.settings.currency)}
                        </p>
                      </div>
                    </div>

                    {/* Top Merchants */}
                    {cycle.topMerchants.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Top Merchants</p>
                        <div className="space-y-1">
                          {cycle.topMerchants.slice(0, 3).map((merchant, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="truncate">{merchant.name}</span>
                              <span className="font-medium">
                                {formatCurrency(merchant.total, user.settings.currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
```

### 6.2 Add History Tab to Navigation

Update `src/components/layout/BottomNav.tsx`:

```typescript
import { Home, PieChart, Settings, History } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/insights', icon: PieChart, label: 'Insights' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];
```

---

## Phase 7: Category Trends & Analytics

### 7.1 Category Trends Component

Create `src/components/insights/CategoryTrends.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import * as Icons from 'lucide-react';

interface CategoryTrendsProps {
  cycleHistory: Array<{
    cycleId: string;
    categoryBreakdown: Record<string, number>;
  }>;
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  currency?: string;
}

export function CategoryTrends({ cycleHistory, categories, currency = 'Rs.' }: CategoryTrendsProps) {
  const trends = useMemo(() => {
    if (cycleHistory.length < 2) return [];

    return categories.map(category => {
      const amounts = cycleHistory.map(cycle =>
        cycle.categoryBreakdown[category.id] || 0
      ).reverse(); // Oldest to newest

      if (amounts.every(a => a === 0)) return null;

      const latest = amounts[amounts.length - 1];
      const previous = amounts[amounts.length - 2] || 0;
      const change = previous > 0 ? ((latest - previous) / previous) * 100 : 0;

      return {
        category,
        amounts,
        latest,
        change,
        trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      };
    }).filter(Boolean);
  }, [cycleHistory, categories]);

  if (trends.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p className="text-sm">Need at least 2 billing cycles to show trends</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Trends (Last {cycleHistory.length} Cycles)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.map((trend) => {
          if (!trend) return null;

          const IconComponent = (Icons as any)[trend.category.icon] || Icons.Circle;

          return (
            <div key={trend.category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{trend.category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {formatCurrency(trend.latest, currency)}
                  </span>
                  {trend.trend === 'up' && (
                    <div className="flex items-center gap-1 text-red-600 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{Math.abs(trend.change).toFixed(0)}%</span>
                    </div>
                  )}
                  {trend.trend === 'down' && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <TrendingDown className="w-3 h-3" />
                      <span>-{Math.abs(trend.change).toFixed(0)}%</span>
                    </div>
                  )}
                  {trend.trend === 'stable' && (
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Minus className="w-3 h-3" />
                      <span>Stable</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="flex items-end gap-1 h-8">
                {trend.amounts.map((amount, i) => {
                  const maxAmount = Math.max(...trend.amounts);
                  const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex-1 rounded-t ${trend.category.color} opacity-60`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

### 7.2 Update Insights Page

Update `src/app/(dashboard)/insights/page.tsx` to include category trends.

---

## Phase 8: Spending Patterns & Smart Insights

### 8.1 Pattern Analysis Utilities

Create `src/lib/utils/analytics.ts`:

```typescript
import { Expense } from '@/lib/types';
import { isWeekend, getDay, format } from 'date-fns';

export interface SpendingPatterns {
  weekdayVsWeekend: {
    weekday: number;
    weekend: number;
    weekdayPercent: number;
    weekendPercent: number;
  };
  byDayOfWeek: Array<{
    day: string;
    total: number;
    count: number;
    average: number;
  }>;
  byTimeOfDay: {
    morning: number;    // 6-12
    afternoon: number;  // 12-18
    evening: number;    // 18-24
    night: number;      // 0-6
  };
  spendingVelocity: {
    current: number;
    projected: number;
    isAccelerating: boolean;
  };
}

export function analyzeSpendingPatterns(
  expenses: Expense[],
  cycleStartDate: Date,
  cycleEndDate: Date,
  daysElapsed: number,
  daysTotal: number
): SpendingPatterns {
  // Weekday vs Weekend
  let weekdayTotal = 0;
  let weekendTotal = 0;

  expenses.forEach(expense => {
    if (isWeekend(expense.date)) {
      weekendTotal += expense.amount;
    } else {
      weekdayTotal += expense.amount;
    }
  });

  const total = weekdayTotal + weekendTotal;

  // By day of week
  const dayTotals = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  expenses.forEach(expense => {
    const dayIndex = getDay(expense.date);
    dayTotals[dayIndex].total += expense.amount;
    dayTotals[dayIndex].count += 1;
  });

  const byDayOfWeek = dayTotals.map((data, i) => ({
    day: dayNames[i],
    total: data.total,
    count: data.count,
    average: data.count > 0 ? data.total / data.count : 0,
  }));

  // Spending velocity
  const currentRate = total / daysElapsed;
  const projected = currentRate * daysTotal;

  return {
    weekdayVsWeekend: {
      weekday: weekdayTotal,
      weekend: weekendTotal,
      weekdayPercent: total > 0 ? (weekdayTotal / total) * 100 : 0,
      weekendPercent: total > 0 ? (weekendTotal / total) * 100 : 0,
    },
    byDayOfWeek,
    byTimeOfDay: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
    spendingVelocity: {
      current: currentRate,
      projected,
      isAccelerating: projected > 100000, // Compare with limit
    },
  };
}

export function generateInsights(
  currentCycle: any,
  previousCycle: any,
  patterns: SpendingPatterns
): string[] {
  const insights: string[] = [];

  // Compare with previous cycle
  if (previousCycle) {
    const change = currentCycle.spent - previousCycle.spent;
    const percentChange = (change / previousCycle.spent) * 100;

    if (percentChange < -20) {
      insights.push(`🎉 Great job! You've reduced spending by ${Math.abs(percentChange).toFixed(0)}% compared to last cycle`);
    } else if (percentChange > 20) {
      insights.push(`⚠️ Spending is up ${percentChange.toFixed(0)}% from last cycle. Review your largest expenses.`);
    }
  }

  // Weekend spending
  if (patterns.weekdayVsWeekend.weekendPercent > 40) {
    insights.push(`💡 ${patterns.weekdayVsWeekend.weekendPercent.toFixed(0)}% of your spending happens on weekends`);
  }

  // Peak day
  const peakDay = patterns.byDayOfWeek.reduce((max, day) =>
    day.total > max.total ? day : max
  );
  if (peakDay.total > 0) {
    insights.push(`📊 ${peakDay.day} is your highest spending day (avg ${peakDay.average.toFixed(0)})`);
  }

  // Velocity warning
  if (patterns.spendingVelocity.isAccelerating) {
    insights.push(`🚨 At current rate, you'll spend Rs. ${patterns.spendingVelocity.projected.toFixed(0)} by cycle end`);
  }

  return insights;
}
```

### 8.2 Spending Patterns Component

Create `src/components/insights/SpendingPatterns.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpendingPatterns } from '@/lib/utils/analytics';
import { formatCurrency } from '@/lib/utils/currency';
import { Calendar, TrendingUp } from 'lucide-react';

interface SpendingPatternsProps {
  patterns: SpendingPatterns;
  currency?: string;
}

export function SpendingPatternsCard({ patterns, currency = 'Rs.' }: SpendingPatternsProps) {
  const topDays = [...patterns.byDayOfWeek]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Patterns</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekday vs Weekend */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Weekday vs Weekend</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Weekdays</p>
              <p className="text-lg font-bold">
                {patterns.weekdayVsWeekend.weekdayPercent.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(patterns.weekdayVsWeekend.weekday, currency)}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Weekends</p>
              <p className="text-lg font-bold">
                {patterns.weekdayVsWeekend.weekendPercent.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(patterns.weekdayVsWeekend.weekend, currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Peak Spending Days */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Peak Spending Days</p>
          <div className="space-y-2">
            {topDays.map((day, i) => (
              <div key={day.day} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    #{i + 1}
                  </span>
                  <span>{day.day}</span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(Math.round(day.average), currency)} avg
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Warning */}
        {patterns.spendingVelocity.isAccelerating && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900 text-sm">Spending Faster Than Usual</p>
                <p className="text-xs text-orange-700 mt-1">
                  At this rate: {formatCurrency(Math.round(patterns.spendingVelocity.projected), currency)} by cycle end
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Phase 9: Smart Insights Engine

### 9.1 Insights Component

Create `src/components/insights/SmartInsights.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartInsightsProps {
  insights: string[];
}

export function SmartInsights({ insights }: SmartInsightsProps) {
  const getInsightIcon = (insight: string) => {
    if (insight.includes('🎉')) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (insight.includes('⚠️') || insight.includes('🚨')) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <Lightbulb className="w-5 h-5 text-blue-600" />;
  };

  const getInsightStyle = (insight: string) => {
    if (insight.includes('🎉')) return 'bg-green-50 border-green-200 text-green-900';
    if (insight.includes('⚠️') || insight.includes('🚨')) return 'bg-orange-50 border-orange-200 text-orange-900';
    return 'bg-blue-50 border-blue-200 text-blue-900';
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p className="text-sm">Keep tracking expenses to get personalized insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg border flex items-start gap-3 ${getInsightStyle(insight)}`}
          >
            {getInsightIcon(insight)}
            <p className="text-sm flex-1">{insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

---

## Implementation Priority

### Week 1: Historical Comparison
- ✅ Previous cycle comparison component
- ✅ Cycle history page
- ✅ Update navigation

### Week 2: Category Trends
- ✅ Category trends component
- ✅ Sparkline visualizations
- ✅ Update insights page

### Week 3: Patterns & Analytics
- ✅ Pattern analysis utilities
- ✅ Spending patterns component
- ✅ Smart insights engine

### Week 4: Polish & Testing
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Performance optimization

---

## Success Metrics

- Users can see how current cycle compares to previous
- Users can view 6 months of cycle history
- Users can identify spending patterns (weekday/weekend, peak days)
- Users receive actionable insights based on behavior
- Users can track category spending trends over time

---

## Future Enhancements (Phase 10+)

- Spending score/gamification
- Monthly challenges
- Predictive forecasting
- Anomaly detection
- Export reports (PDF/CSV)
- Savings calculator
- Budget goals
- Merchant analysis deep-dive
- Time-of-day patterns (if timestamps available)

---

## Notes

- All features maintain mobile-first design
- Progressive disclosure - features appear when enough data exists
- No breaking changes to existing data model
- Backward compatible with current implementation
