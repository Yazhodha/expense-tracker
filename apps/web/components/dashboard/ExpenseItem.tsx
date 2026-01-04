'use client';

import { motion } from 'framer-motion';
import { Expense, Category } from '@expense-tracker/shared-types';
import { formatCurrency, CurrencyFormat } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import * as Icons from 'lucide-react';
import { getCategoryColorById } from '@/lib/utils/categoryColors';

interface ExpenseItemProps {
  expense: Expense;
  category: Category;
  currency?: string;
  currencyFormat?: CurrencyFormat;
  onEdit?: (expense: Expense) => void;
  categories?: Category[];
}

export function ExpenseItem({ expense, category, currency = 'Rs.', currencyFormat = 'en-LK', onEdit, categories }: ExpenseItemProps) {
  // Dynamic icon component
  const IconComponent = (Icons as any)[category.icon] || Icons.Circle;

  // Get color - if it's a hex color use it directly, otherwise get from utility
  const categoryColor = category.color?.startsWith('#')
    ? category.color
    : (categories ? getCategoryColorById(category.id, categories) : '#3b82f6');

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 px-1 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
      onClick={() => onEdit?.(expense)}
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: categoryColor }}
      >
        <IconComponent className="w-5 h-5 text-white" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {expense.merchant || category.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {expense.note || format(expense.date, 'h:mm a')}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="font-semibold">
          {formatCurrency(expense.amount, currency, currencyFormat)}
        </p>
        {expense.source === 'claude' && (
          <p className="text-xs text-muted-foreground">via Claude</p>
        )}
      </div>
    </motion.div>
  );
}
