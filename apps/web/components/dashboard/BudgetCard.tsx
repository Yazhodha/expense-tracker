'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BudgetRing } from './BudgetRing';
import { BudgetSummary } from '@expense-tracker/shared-types';
import { formatCurrency, CurrencyFormat } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';

interface BudgetCardProps {
  summary: BudgetSummary;
  currency?: string;
  currencyFormat?: CurrencyFormat;
}

export function BudgetCard({ summary, currency = 'Rs.', currencyFormat = 'en-LK' }: BudgetCardProps) {
  const { cycle, spent, limit, remaining, percentUsed, dailyBudget } = summary;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        {/* Cycle header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium">
            {format(cycle.startDate, 'MMM d')} - {format(cycle.endDate, 'MMM d')}
          </h2>
          <p className="text-sm text-muted-foreground">Current billing cycle</p>
        </div>

        {/* Budget ring */}
        <div className="flex justify-center mb-6">
          <BudgetRing percent={percentUsed} />
        </div>

        {/* Amount details */}
        <div className="text-center space-y-1 mb-6">
          <motion.p
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {formatCurrency(spent, currency, currencyFormat)}
          </motion.p>
          <p className="text-muted-foreground">
            of {formatCurrency(limit, currency, currencyFormat)}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className={`text-xl font-semibold ${remaining < 0 ? 'text-red-500' : ''}`}>
              {formatCurrency(Math.abs(remaining), currency, currencyFormat)}
            </p>
            <p className="text-xs text-muted-foreground">
              {remaining < 0 ? 'over budget' : 'remaining'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">
              {formatCurrency(dailyBudget, currency, currencyFormat)}
            </p>
            <p className="text-xs text-muted-foreground">
              daily budget ({cycle.daysRemaining} days left)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
