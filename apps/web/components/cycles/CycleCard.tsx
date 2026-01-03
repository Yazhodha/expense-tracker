'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CycleSummary } from '@expense-tracker/shared-types';
import { formatCurrency } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface CycleCardProps {
  summary: CycleSummary;
  currency?: string;
  showDetails?: boolean;
}

export function CycleCard({ summary, currency = 'Rs.', showDetails = false }: CycleCardProps) {
  const { cycle, totalSpent, budgetLimit, percentUsed, isOverBudget, expenseCount } = summary;

  const statusColor = isOverBudget
    ? 'text-red-500'
    : percentUsed > 90
    ? 'text-orange-500'
    : percentUsed > 75
    ? 'text-yellow-500'
    : 'text-green-500';

  const statusText = isOverBudget
    ? 'Over Budget'
    : percentUsed > 90
    ? 'Nearly Exceeded'
    : percentUsed > 75
    ? 'On Track'
    : 'Under Budget';

  return (
    <Link href={`/cycles/detail?id=${summary.cycleId}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          {/* Cycle header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d, yyyy')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {expenseCount} transaction{expenseCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
              {isOverBudget ? (
                <TrendingUp className={`h-4 w-4 ${statusColor}`} />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Spending summary */}
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-2xl font-bold">
                {formatCurrency(totalSpent, currency)}
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatCurrency(budgetLimit, currency)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
            <p className="text-xs text-muted-foreground mt-1">{percentUsed.toFixed(1)}% used</p>
          </div>

          {/* Category breakdown preview (if enabled) */}
          {showDetails && summary.categoryBreakdown.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium mb-2">Top Categories</p>
              <div className="space-y-1">
                {summary.categoryBreakdown.slice(0, 3).map((cat) => (
                  <div key={cat.categoryId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat.categoryName}</span>
                    <span className="font-medium">{formatCurrency(cat.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View details link */}
          <div className="flex items-center justify-end mt-4 text-sm text-primary hover:underline">
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
