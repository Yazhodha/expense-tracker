'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { EditExpenseSheet } from '@/components/expense/EditExpenseSheet';
import { Expense } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { expenses, loading, summary, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAddExpense = async (expense: {
    amount: number;
    category: string;
    merchant?: string;
    date?: Date;
  }) => {
    try {
      await addExpense({
        ...expense,
        date: expense.date || new Date(),
        source: 'manual',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, updates);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense. Please try again.');
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
          onEditExpense={setEditingExpense}
        />
      </div>

      {/* Add Expense FAB */}
      <AddExpenseSheet
        categories={user.settings.categories}
        currency={user.settings.currency}
        onAdd={handleAddExpense}
      />

      {/* Edit Expense Sheet */}
      <EditExpenseSheet
        expense={editingExpense}
        categories={user.settings.categories}
        currency={user.settings.currency}
        open={editingExpense !== null}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        onUpdate={handleUpdateExpense}
        onDelete={handleDeleteExpense}
      />
    </motion.div>
  );
}
