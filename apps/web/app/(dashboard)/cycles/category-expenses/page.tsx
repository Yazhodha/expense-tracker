'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import { ArrowLeft, Receipt, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEffect, useState } from 'react';
import { Expense } from '@expense-tracker/shared-types';
import { subscribeToExpenses, updateExpense, deleteExpense } from '@expense-tracker/shared-firebase';
import { EditExpenseSheet } from '@/components/expense/EditExpenseSheet';
import { toast } from 'sonner';

export default function CategoryExpensesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const currency = user?.settings.currency || 'Rs.';
  const currencyFormat = user?.settings.currencyFormat;

  const cycleId = searchParams.get('cycleId');
  const categoryId = searchParams.get('categoryId');
  const categoryName = searchParams.get('categoryName');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  useEffect(() => {
    if (!user || !startDate || !endDate || !categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const start = new Date(startDate);
    const end = new Date(endDate);

    const unsubscribe = subscribeToExpenses(
      user.uid,
      start,
      end,
      (allExpenses) => {
        // Filter by category
        const categoryExpenses = allExpenses.filter((exp) => exp.category === categoryId);
        // Sort by date descending (newest first)
        categoryExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
        setExpenses(categoryExpenses);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, startDate, endDate, categoryId]);

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditSheetOpen(true);
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, updates);
      toast.success('Expense updated successfully');
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      toast.success('Expense deleted successfully');
      setIsEditSheetOpen(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categoryId || !categoryName) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Category not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Category Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{categoryName}</h1>
        {startDate && endDate && (
          <p className="text-muted-foreground text-sm">
            {format(new Date(startDate), 'MMM d')} - {format(new Date(endDate), 'MMM d, yyyy')}
          </p>
        )}
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-4xl font-bold mb-1">{formatCurrency(totalAmount, currency, currencyFormat)}</p>
            <p className="text-muted-foreground">Total Spent</p>
          </div>
          <div className="grid grid-cols-1 gap-2 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-semibold">{expenses.length}</p>
              <p className="text-xs text-muted-foreground">
                Transaction{expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            All Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No expenses in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const category = user?.settings.categories.find((c) => c.id === expense.category);
                const IconComponent = category?.icon ? (Icons as any)[category.icon] || Icons.Circle : Icons.Circle;
                return (
                  <div
                    key={expense.id}
                    onClick={() => handleExpenseClick(expense)}
                    className="flex items-center justify-between cursor-pointer hover:bg-accent/50 -mx-2 px-2 py-3 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: category?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{expense.merchant || category?.name || 'Expense'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {format(expense.date, 'MMM d, yyyy')}
                          {expense.note && ` • ${expense.note}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-right shrink-0 ml-2">{formatCurrency(expense.amount, currency, currencyFormat)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Sheet */}
      {selectedExpense && (
        <EditExpenseSheet
          expense={selectedExpense}
          categories={user?.settings.categories || []}
          currency={currency}
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          onUpdate={handleUpdateExpense}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
}
