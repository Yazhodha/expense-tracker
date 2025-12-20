'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';

export default function DashboardPage() {
  const { user } = useAuth();
  const { expenses, loading, summary, addExpense } = useExpenses();

  const handleAddExpense = async (expense: {
    amount: number;
    category: string;
    merchant?: string;
  }) => {
    try {
      await addExpense({
        ...expense,
        date: new Date(),
        source: 'manual',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
          expenses={expenses}
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
