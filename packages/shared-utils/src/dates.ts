import {
  BillingCycle,
  CycleSummary,
  CycleComparison,
  CategoryComparison,
  CategorySpending,
  Expense,
  Category
} from '@expense-tracker/shared-types';
import { startOfDay, endOfDay, differenceInDays, addMonths, setDate, isAfter, isBefore } from 'date-fns';

export function getBillingCycle(billingDate: number, referenceDate = new Date()): BillingCycle {
  const today = startOfDay(referenceDate);

  // Determine current cycle start
  let cycleStart = setDate(today, billingDate);

  // If we're before the billing date this month, cycle started last month
  if (isBefore(today, cycleStart)) {
    cycleStart = addMonths(cycleStart, -1);
  }

  // Cycle ends one day before next billing date
  const cycleEnd = endOfDay(addMonths(setDate(cycleStart, billingDate), 1));
  cycleEnd.setDate(cycleEnd.getDate() - 1);

  const daysTotal = differenceInDays(cycleEnd, cycleStart) + 1;
  const daysElapsed = differenceInDays(today, cycleStart) + 1;
  const daysRemaining = daysTotal - daysElapsed;

  return {
    startDate: cycleStart,
    endDate: cycleEnd,
    daysTotal,
    daysElapsed,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

export function isInCurrentCycle(date: Date, billingDate: number): boolean {
  const cycle = getBillingCycle(billingDate);
  const checkDate = startOfDay(date);
  return !isBefore(checkDate, cycle.startDate) && !isAfter(checkDate, cycle.endDate);
}

/**
 * Get past billing cycles going back N months from the current date
 * @param billingDate Day of month when billing cycle starts (1-28)
 * @param count Number of past cycles to retrieve
 * @returns Array of billing cycles, most recent first (not including current cycle)
 */
export function getPastBillingCycles(billingDate: number, count: number): BillingCycle[] {
  const cycles: BillingCycle[] = [];
  const today = new Date();

  for (let i = 1; i <= count; i++) {
    // Go back i months from today
    const referenceDate = addMonths(today, -i);
    const cycle = getBillingCycle(billingDate, referenceDate);
    cycles.push(cycle);
  }

  return cycles;
}

/**
 * Get a billing cycle for a specific date
 * @param billingDate Day of month when billing cycle starts (1-28)
 * @param date The date to get the cycle for
 * @returns The billing cycle containing the specified date
 */
export function getBillingCycleForDate(billingDate: number, date: Date): BillingCycle {
  return getBillingCycle(billingDate, date);
}

/**
 * Generate a unique ID for a billing cycle based on its start date
 * Format: YYYY-MM-DD
 */
export function getCycleId(cycle: BillingCycle): string {
  const year = cycle.startDate.getFullYear();
  const month = String(cycle.startDate.getMonth() + 1).padStart(2, '0');
  const day = String(cycle.startDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a cycle ID back into a billing cycle
 */
export function parseCycleId(cycleId: string, billingDate: number): BillingCycle {
  const [year, month, day] = cycleId.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return getBillingCycle(billingDate, date);
}

/**
 * Calculate a summary for a billing cycle based on expenses
 */
export function calculateCycleSummary(
  cycle: BillingCycle,
  expenses: Expense[],
  budgetLimit: number,
  categories: Category[]
): CycleSummary {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentUsed = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;
  const isOverBudget = totalSpent > budgetLimit;

  // Calculate category breakdown
  const categoryMap = new Map<string, { amount: number; count: number }>();
  expenses.forEach(exp => {
    const existing = categoryMap.get(exp.category) || { amount: 0, count: 0 };
    categoryMap.set(exp.category, {
      amount: existing.amount + exp.amount,
      count: existing.count + 1
    });
  });

  const categoryBreakdown: CategorySpending[] = Array.from(categoryMap.entries()).map(
    ([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || 'Unknown',
        amount: data.amount,
        expenseCount: data.count,
        percentOfTotal: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0
      };
    }
  ).sort((a, b) => b.amount - a.amount);

  // Get top 5 expenses
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const avgDailySpending = cycle.daysElapsed > 0 ? totalSpent / cycle.daysElapsed : 0;

  return {
    cycle,
    cycleId: getCycleId(cycle),
    totalSpent,
    budgetLimit,
    percentUsed,
    isOverBudget,
    expenseCount: expenses.length,
    avgDailySpending,
    categoryBreakdown,
    topExpenses
  };
}

/**
 * Compare two billing cycles
 */
export function compareCycles(
  summary1: CycleSummary,
  summary2: CycleSummary
): CycleComparison {
  const totalSpentDiff = summary1.totalSpent - summary2.totalSpent;
  const totalSpentDiffPercent = summary2.totalSpent > 0
    ? (totalSpentDiff / summary2.totalSpent) * 100
    : 0;

  const budgetPerformanceDiff = summary1.percentUsed - summary2.percentUsed;

  // Determine overall trend based on spending
  let overallTrend: 'improved' | 'stable' | 'worsened';
  if (totalSpentDiffPercent < -5) {
    overallTrend = 'improved'; // Spent significantly less
  } else if (totalSpentDiffPercent > 5) {
    overallTrend = 'worsened'; // Spent significantly more
  } else {
    overallTrend = 'stable'; // Within 5% range
  }

  // Compare categories
  const allCategoryIds = new Set([
    ...summary1.categoryBreakdown.map(c => c.categoryId),
    ...summary2.categoryBreakdown.map(c => c.categoryId)
  ]);

  const categoryComparisons: CategoryComparison[] = Array.from(allCategoryIds).map(categoryId => {
    const cat1 = summary1.categoryBreakdown.find(c => c.categoryId === categoryId);
    const cat2 = summary2.categoryBreakdown.find(c => c.categoryId === categoryId);

    const cycle1Amount = cat1?.amount || 0;
    const cycle2Amount = cat2?.amount || 0;
    const difference = cycle1Amount - cycle2Amount;
    const percentChange = cycle2Amount > 0 ? (difference / cycle2Amount) * 100 : 0;

    let trend: 'improved' | 'stable' | 'worsened';
    if (percentChange < -5) {
      trend = 'improved';
    } else if (percentChange > 5) {
      trend = 'worsened';
    } else {
      trend = 'stable';
    }

    return {
      categoryId,
      categoryName: cat1?.categoryName || cat2?.categoryName || 'Unknown',
      cycle1Amount,
      cycle2Amount,
      difference,
      percentChange,
      trend
    };
  }).sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  // Compare metrics
  const avgDailySpendingDiff = summary1.avgDailySpending - summary2.avgDailySpending;
  const avgDailySpendingPercent = summary2.avgDailySpending > 0
    ? (avgDailySpendingDiff / summary2.avgDailySpending) * 100
    : 0;

  const largestExpense1 = summary1.topExpenses[0]?.amount || 0;
  const largestExpense2 = summary2.topExpenses[0]?.amount || 0;

  const expenseCountDiff = summary1.expenseCount - summary2.expenseCount;
  const expenseCountPercent = summary2.expenseCount > 0
    ? (expenseCountDiff / summary2.expenseCount) * 100
    : 0;

  return {
    cycle1: summary1,
    cycle2: summary2,
    totalSpentDiff,
    totalSpentDiffPercent,
    budgetPerformanceDiff,
    categoryComparisons,
    metrics: {
      avgDailySpending: {
        cycle1: summary1.avgDailySpending,
        cycle2: summary2.avgDailySpending,
        difference: avgDailySpendingDiff,
        percentChange: avgDailySpendingPercent
      },
      largestExpense: {
        cycle1: largestExpense1,
        cycle2: largestExpense2,
        difference: largestExpense1 - largestExpense2
      },
      expenseCount: {
        cycle1: summary1.expenseCount,
        cycle2: summary2.expenseCount,
        difference: expenseCountDiff,
        percentChange: expenseCountPercent
      }
    },
    overallTrend
  };
}
