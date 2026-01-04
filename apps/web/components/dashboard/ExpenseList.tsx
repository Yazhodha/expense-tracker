'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Expense, Category } from '@expense-tracker/shared-types';
import { ExpenseItem } from './ExpenseItem';
import { formatCurrency, CurrencyFormat } from '@expense-tracker/shared-utils';
import { format, isToday, isYesterday } from 'date-fns';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  currency?: string;
  currencyFormat?: CurrencyFormat;
  onEditExpense?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, categories, currency, currencyFormat = 'en-LK', onEditExpense }: ExpenseListProps) {
  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups = new Map<string, Expense[]>();

    expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((expense) => {
        const dateKey = format(expense.date, 'yyyy-MM-dd');
        const existing = groups.get(dateKey) || [];
        groups.set(dateKey, [...existing, expense]);
      });

    return groups;
  }, [expenses]);

  const getCategoryById = (id: string) =>
    categories.find((c) => c.id === id) || categories[categories.length - 1];

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  const getDayTotal = (expenses: Expense[]) =>
    expenses.reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses yet</p>
        <p className="text-sm">Tap + to add your first expense</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedExpenses.entries()).map(([dateStr, dayExpenses]) => (
        <motion.div
          key={dateStr}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Date header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-sm">{getDateLabel(dateStr)}</h3>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(getDayTotal(dayExpenses), currency, currencyFormat)}
            </span>
          </div>

          {/* Expenses for this day */}
          <div className="bg-card rounded-lg border divide-y">
            {dayExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                category={getCategoryById(expense.category)}
                currency={currency}
                currencyFormat={currencyFormat}
                onEdit={onEditExpense}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
