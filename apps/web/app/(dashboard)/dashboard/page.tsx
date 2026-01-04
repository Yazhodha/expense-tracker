'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { AddExpenseSheet } from '@/components/expense/AddExpenseSheet';
import { EditExpenseSheet } from '@/components/expense/EditExpenseSheet';
import { Input } from '@/components/ui/input';
import { Expense } from '@expense-tracker/shared-types';
import { Search, X } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { expenses, loading, summary, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddExpense = async (expense: {
    amount: number;
    category: string;
    merchant?: string;
    note?: string;
    date?: Date;
  }) => {
    try {
      await addExpense({
        ...expense,
        date: expense.date || new Date(),
        source: 'manual',
      });
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    }
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, updates);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    }
  };

  // Filter expenses based on search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;

    const query = searchQuery.toLowerCase();
    return expenses.filter((expense) => {
      const merchant = expense.merchant?.toLowerCase() || '';
      const note = expense.note?.toLowerCase() || '';
      const category = user?.settings.categories.find(c => c.id === expense.category)?.name.toLowerCase() || '';
      const amount = expense.amount.toString();

      return (
        merchant.includes(query) ||
        note.includes(query) ||
        category.includes(query) ||
        amount.includes(query)
      );
    });
  }, [expenses, searchQuery, user?.settings.categories]);

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
      <BudgetCard
        summary={summary}
        currency={user.settings.currency}
        currencyFormat={user.settings.currencyFormat as any}
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by merchant, category, note, or amount..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Recent Expenses</h2>
          {searchQuery && (
            <span className="text-sm text-muted-foreground">
              {filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <ExpenseList
          expenses={filteredExpenses}
          categories={user.settings.categories}
          currency={user.settings.currency}
          currencyFormat={user.settings.currencyFormat as any}
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
