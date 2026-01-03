'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CycleComparison as CycleComparisonType, CategoryComparison } from '@expense-tracker/shared-types';
import { formatCurrency } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CycleComparisonProps {
  comparison: CycleComparisonType;
  currency?: string;
  selectedCategories?: string[];
}

export function CycleComparison({
  comparison,
  currency = 'Rs.',
  selectedCategories,
}: CycleComparisonProps) {
  const { cycle1, cycle2, totalSpentDiff, totalSpentDiffPercent, categoryComparisons, metrics, overallTrend } = comparison;

  // Filter categories if specific ones are selected
  const filteredCategories = selectedCategories && selectedCategories.length > 0
    ? categoryComparisons.filter((c) => selectedCategories.includes(c.categoryId))
    : categoryComparisons;

  const getTrendIcon = (trend: 'improved' | 'stable' | 'worsened') => {
    if (trend === 'improved') return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (trend === 'worsened') return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendBadge = (trend: 'improved' | 'stable' | 'worsened') => {
    const variants = {
      improved: 'default',
      stable: 'secondary',
      worsened: 'destructive',
    } as const;

    return (
      <Badge variant={variants[trend]} className="capitalize">
        {trend}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall Spending</CardTitle>
            {getTrendBadge(overallTrend)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {format(cycle1.cycle.startDate, 'MMM d')} - {format(cycle1.cycle.endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(cycle1.totalSpent, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {cycle1.percentUsed.toFixed(1)}% of budget
              </p>
            </div>

            <div className="flex flex-col items-center px-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center mt-2">
                <p className={`text-sm font-semibold ${totalSpentDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalSpentDiff > 0 ? '+' : ''}{formatCurrency(totalSpentDiff, currency)}
                </p>
                <p className={`text-xs ${totalSpentDiffPercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalSpentDiffPercent > 0 ? '+' : ''}{totalSpentDiffPercent.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="text-center flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {format(cycle2.cycle.startDate, 'MMM d')} - {format(cycle2.cycle.endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(cycle2.totalSpent, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {cycle2.percentUsed.toFixed(1)}% of budget
              </p>
            </div>
          </div>

          {/* Budget performance bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Current</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${cycle1.isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(cycle1.percentUsed, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium w-12 text-right">{cycle1.percentUsed.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20">Previous</span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${cycle2.isOverBudget ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(cycle2.percentUsed, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium w-12 text-right">{cycle2.percentUsed.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          {selectedCategories && selectedCategories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredCategories.length} selected categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No categories to compare</p>
          ) : (
            <div className="space-y-6">
              {filteredCategories.map((cat: CategoryComparison) => (
                <div key={cat.categoryId} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{cat.categoryName}</h4>
                      {getTrendIcon(cat.trend)}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${cat.difference > 0 ? 'text-red-500' : cat.difference < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {cat.difference > 0 ? '+' : ''}{formatCurrency(cat.difference, currency)}
                      </p>
                      <p className={`text-xs ${cat.percentChange > 0 ? 'text-red-500' : cat.percentChange < 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {cat.percentChange > 0 ? '+' : ''}{cat.percentChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20">Current</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.max((cat.cycle1Amount / Math.max(cat.cycle1Amount, cat.cycle2Amount)) * 100, 0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[60px] text-right">
                        {formatCurrency(cat.cycle1Amount, currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20">Previous</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{
                            width: `${Math.max((cat.cycle2Amount / Math.max(cat.cycle1Amount, cat.cycle2Amount)) * 100, 0)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium min-w-[60px] text-right">
                        {formatCurrency(cat.cycle2Amount, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Avg Daily Spending */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Average Daily Spending</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-semibold">
                    {formatCurrency(metrics.avgDailySpending.cycle1, currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {formatCurrency(metrics.avgDailySpending.cycle2, currency)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${metrics.avgDailySpending.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.avgDailySpending.difference > 0 ? '+' : ''}
                  {formatCurrency(metrics.avgDailySpending.difference, currency)}
                </p>
                <p className={`text-xs ${metrics.avgDailySpending.percentChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.avgDailySpending.percentChange > 0 ? '+' : ''}
                  {metrics.avgDailySpending.percentChange.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Largest Expense */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Largest Single Expense</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-semibold">
                    {formatCurrency(metrics.largestExpense.cycle1, currency)}
                  </span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {formatCurrency(metrics.largestExpense.cycle2, currency)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${metrics.largestExpense.difference > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.largestExpense.difference > 0 ? '+' : ''}
                  {formatCurrency(metrics.largestExpense.difference, currency)}
                </p>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Number of Transactions</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-lg font-semibold">{metrics.expenseCount.cycle1}</span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {metrics.expenseCount.cycle2}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${metrics.expenseCount.difference > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                  {metrics.expenseCount.difference > 0 ? '+' : ''}
                  {metrics.expenseCount.difference}
                </p>
                <p className={`text-xs ${metrics.expenseCount.percentChange > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                  {metrics.expenseCount.percentChange > 0 ? '+' : ''}
                  {metrics.expenseCount.percentChange.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
