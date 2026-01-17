'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useCycleHistory } from '@expense-tracker/shared-hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import { ArrowLeft, TrendingUp, Receipt, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function CycleDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cycleSummaries, currentCycle, loading } = useCycleHistory(user, 12);
  const currency = user?.settings.currency || 'Rs.';

  const cycleId = searchParams.get('id');

  const cycleSummary = useMemo(() => {
    if (!cycleId) return null;
    if (currentCycle?.cycleId === cycleId) return currentCycle;
    return cycleSummaries.find((c) => c.cycleId === cycleId);
  }, [cycleId, currentCycle, cycleSummaries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cycleSummary) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Cycle not found</p>
        </div>
      </div>
    );
  }

  const {
    cycle,
    totalSpent,
    budgetLimit,
    percentUsed,
    isOverBudget,
    expenseCount,
    avgDailySpending,
    categoryBreakdown,
    topExpenses,
  } = cycleSummary;

  const statusColor = isOverBudget
    ? 'text-red-500'
    : percentUsed > 90
    ? 'text-orange-500'
    : percentUsed > 75
    ? 'text-yellow-500'
    : 'text-green-500';

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Link href={`/cycles/compare?cycle1=${cycleId}`}>
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Compare
          </Button>
        </Link>
      </div>

      {/* Cycle Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          {format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d, yyyy')}
        </h1>
        <p className="text-muted-foreground">
          {cycle.daysTotal} days • {expenseCount} transaction{expenseCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-4xl font-bold mb-1">{formatCurrency(totalSpent, currency)}</p>
            <p className="text-muted-foreground">of {formatCurrency(budgetLimit, currency)}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget
                    ? 'bg-red-500'
                    : percentUsed > 90
                    ? 'bg-orange-500'
                    : percentUsed > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-muted-foreground">{percentUsed.toFixed(1)}% used</span>
              <span className={`text-sm font-medium ${statusColor}`}>
                {isOverBudget
                  ? `${formatCurrency(totalSpent - budgetLimit, currency)} over`
                  : `${formatCurrency(budgetLimit - totalSpent, currency)} remaining`}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-semibold">{formatCurrency(avgDailySpending, currency)}</p>
              <p className="text-xs text-muted-foreground">Avg. Daily Spending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">{expenseCount}</p>
              <p className="text-xs text-muted-foreground">Total Transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryBreakdown.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No expenses in this cycle</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <Link
                  key={cat.categoryId}
                  href={`/cycles/category-expenses?cycleId=${cycleId}&categoryId=${cat.categoryId}&categoryName=${encodeURIComponent(cat.categoryName)}&startDate=${cycle.startDate.toISOString()}&endDate=${cycle.endDate.toISOString()}`}
                  className="block hover:bg-accent/50 -mx-2 px-2 py-2 rounded-md transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{cat.categoryName}</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(cat.amount, currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${cat.percentOfTotal}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {cat.percentOfTotal.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cat.expenseCount} transaction{cat.expenseCount !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Top Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenses.map((expense, index) => {
                const category = user?.settings.categories.find((c) => c.id === expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {expense.merchant || category?.name || 'Expense'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(expense.date, 'MMM d, yyyy')}
                          {expense.note && ` • ${expense.note}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(expense.amount, currency)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
