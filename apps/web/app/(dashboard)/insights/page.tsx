'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, isToday } from 'date-fns';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, PieChart } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function InsightsPage() {
  const { user } = useAuth();
  const { expenses, loading, summary } = useExpenses();
  const { formatCurrency } = useCurrency();

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!user) return [];

    const breakdown = new Map<string, { name: string; icon: string; total: number; count: number }>();

    expenses.forEach((expense) => {
      const category = user.settings.categories.find(c => c.id === expense.category);
      if (category) {
        const existing = breakdown.get(category.id) || { name: category.name, icon: category.icon, total: 0, count: 0 };
        breakdown.set(category.id, {
          ...existing,
          total: existing.total + expense.amount,
          count: existing.count + 1,
        });
      }
    });

    return Array.from(breakdown.values())
      .sort((a, b) => b.total - a.total);
  }, [expenses, user]);

  // Calculate daily spending trend (last 7 days of current cycle)
  const dailyTrend = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({
      start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: today,
    });

    return days.map(day => {
      const dayExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate.toDateString() === day.toDateString();
      });

      return {
        date: day,
        total: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: dayExpenses.length,
      };
    });
  }, [expenses]);

  // Find top merchant
  const topMerchant = useMemo(() => {
    const merchantTotals = new Map<string, number>();

    expenses.forEach(expense => {
      if (expense.merchant) {
        merchantTotals.set(
          expense.merchant,
          (merchantTotals.get(expense.merchant) || 0) + expense.amount
        );
      }
    });

    let top = { name: 'N/A', total: 0 };
    merchantTotals.forEach((total, name) => {
      if (total > top.total) {
        top = { name, total };
      }
    });

    return top;
  }, [expenses]);

  // Calculate average daily spending
  const avgDailySpending = useMemo(() => {
    if (summary.cycle.daysElapsed === 0) return 0;
    return Math.round(summary.spent / summary.cycle.daysElapsed);
  }, [summary]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const maxCategoryAmount = categoryBreakdown[0]?.total || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Insights</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <p className="text-sm">Avg Daily</p>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(avgDailySpending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <PieChart className="w-4 h-4" />
              <p className="text-sm">Total Expenses</p>
            </div>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expenses yet in this billing cycle.</p>
          ) : (
            categoryBreakdown.map((category) => {
              const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
              const percentage = (category.total / summary.spent) * 100;
              const barWidth = (category.total / maxCategoryAmount) * 100;

              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(category.total)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{category.count} transaction{category.count !== 1 ? 's' : ''}</p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Daily Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyTrend.map((day, index) => {
              const maxDayAmount = Math.max(...dailyTrend.map(d => d.total), 1);
              const barWidth = (day.total / maxDayAmount) * 100;
              const isCurrentDay = isToday(day.date);

              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={isCurrentDay ? 'font-semibold' : 'text-muted-foreground'}>
                      {format(day.date, 'EEE, MMM d')}
                    </span>
                    <span className="font-medium">{formatCurrency(day.total)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isCurrentDay ? 'bg-primary' : 'bg-primary/60'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Merchant */}
      <Card>
        <CardHeader>
          <CardTitle>Top Merchant</CardTitle>
        </CardHeader>
        <CardContent>
          {topMerchant.name === 'N/A' ? (
            <p className="text-muted-foreground text-sm">No merchant data available.</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">{topMerchant.name}</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(topMerchant.total)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Health */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className={`text-2xl font-bold ${summary.isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                {summary.isOverBudget ? 'Over Budget' : 'On Track'}
              </p>
            </div>
            {summary.isOverBudget ? (
              <TrendingDown className="w-8 h-8 text-destructive" />
            ) : (
              <TrendingUp className="w-8 h-8 text-green-600" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-medium">{summary.percentUsed.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Days Remaining</span>
              <span className="font-medium">{summary.cycle.daysRemaining} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recommended Daily Budget</span>
              <span className="font-medium">{formatCurrency(summary.dailyBudget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
