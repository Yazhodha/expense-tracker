'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { getBillingCycle } from '@/lib/utils/dates';
import { BudgetSummary, Expense } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock expenses for testing
  const mockExpenses: Expense[] = useMemo(() => [
    {
      id: '1',
      userId: user?.uid || '',
      amount: 2500,
      category: 'groceries',
      merchant: 'Keells Supermarket',
      note: 'Weekly groceries',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'manual',
    },
    {
      id: '2',
      userId: user?.uid || '',
      amount: 1200,
      category: 'dining',
      merchant: 'Pizza Hut',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'manual',
    },
    {
      id: '3',
      userId: user?.uid || '',
      amount: 3000,
      category: 'fuel',
      merchant: 'Ceylon Petroleum',
      date: new Date(Date.now() - 86400000), // Yesterday
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'manual',
    },
  ], [user?.uid]);

  // Calculate budget summary
  const summary: BudgetSummary = useMemo(() => {
    const billingDate = user?.settings.billingDate || 15;
    const cycle = getBillingCycle(billingDate);
    const spent = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    const limit = user?.settings.monthlyLimit || 100000;
    const remaining = limit - spent;
    const percentUsed = (spent / limit) * 100;
    const dailyBudget = cycle.daysRemaining > 0 ? Math.floor(remaining / cycle.daysRemaining) : 0;

    return {
      cycle,
      spent,
      limit,
      remaining,
      percentUsed,
      dailyBudget,
      todaySpent: mockExpenses
        .filter((e) => e.date.toDateString() === new Date().toDateString())
        .reduce((sum, e) => sum + e.amount, 0),
      isOverBudget: remaining < 0,
    };
  }, [user, mockExpenses]);

  const handleAddExpense = async (expense: {
    amount: number;
    category: string;
    merchant?: string;
  }) => {
    // TODO: In Phase 4, we'll add real Firebase integration
    console.log('Add expense:', expense);
    alert(`Expense added! (Phase 4 will save to Firebase)\nAmount: Rs. ${expense.amount}\nCategory: ${expense.category}`);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      {/* Budget Overview */}
      <BudgetCard summary={summary} currency={user.settings.currency} />

      {/* Recent Expenses */}
      <div>
        <h2 className="font-semibold mb-4">Recent Expenses</h2>
        <ExpenseList
          expenses={mockExpenses}
          categories={user.settings.categories}
          currency={user.settings.currency}
        />
      </div>

      {/* Add Expense FAB */}
      <AddExpenseSheet
        categories={user.settings.categories}
        currency={user.settings.currency}
        onAdd={handleAddExpense}
      />
    </motion.div>
  );
}
