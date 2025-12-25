import { useEffect, useState, useCallback } from 'react';
import { Expense, BudgetSummary, User } from '@expense-tracker/shared-types';
import { getBillingCycle } from '@expense-tracker/shared-utils';
import {
  addExpense as addExpenseToDb,
  updateExpense as updateExpenseInDb,
  deleteExpense as deleteExpenseFromDb,
  subscribeToExpenses,
} from '@expense-tracker/shared-firebase';
import { isToday } from 'date-fns';

export function useExpenses(user: User | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current billing cycle
  const billingDate = user?.settings.billingDate || 15;
  const cycle = getBillingCycle(billingDate);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToExpenses(
      user.uid,
      cycle.startDate,
      cycle.endDate,
      (newExpenses) => {
        setExpenses(newExpenses);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, cycle.startDate.getTime(), cycle.endDate.getTime()]);

  // Calculate budget summary
  const summary: BudgetSummary = {
    cycle,
    spent: expenses.reduce((sum, e) => sum + e.amount, 0),
    limit: user?.settings.monthlyLimit || 100000,
    remaining: 0,
    percentUsed: 0,
    dailyBudget: 0,
    todaySpent: expenses.filter((e) => isToday(e.date)).reduce((sum, e) => sum + e.amount, 0),
    isOverBudget: false,
  };

  summary.remaining = summary.limit - summary.spent;
  summary.percentUsed = (summary.spent / summary.limit) * 100;
  summary.dailyBudget = cycle.daysRemaining > 0 ? Math.floor(summary.remaining / cycle.daysRemaining) : 0;
  summary.isOverBudget = summary.remaining < 0;

  // CRUD operations
  const addExpense = useCallback(async (
    expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    return addExpenseToDb(user.uid, expense);
  }, [user]);

  const updateExpense = useCallback(async (
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    return updateExpenseInDb(expenseId, updates);
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    return deleteExpenseFromDb(expenseId);
  }, []);

  return {
    expenses,
    loading,
    summary,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
