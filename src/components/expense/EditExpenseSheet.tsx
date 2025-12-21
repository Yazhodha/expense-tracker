'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Expense, Category } from '@/lib/types';
import { Check, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';

interface EditExpenseSheetProps {
  expense: Expense | null;
  categories: Category[];
  currency?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  onDelete: (expenseId: string) => Promise<void>;
}

export function EditExpenseSheet({
  expense,
  categories,
  currency = 'Rs.',
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: EditExpenseSheetProps) {
  const [amount, setAmount] = useState(expense?.amount.toString() || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(expense?.category || null);
  const [merchant, setMerchant] = useState(expense?.merchant || '');
  const [note, setNote] = useState(expense?.note || '');
  const [date, setDate] = useState<Date>(expense?.date || new Date());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update state when expense changes
  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setSelectedCategory(expense.category);
      setMerchant(expense.merchant || '');
      setNote(expense.note || '');
      setDate(expense.date);
    }
  }, [expense]);

  const handleUpdate = async () => {
    if (!amount || !selectedCategory || !merchant || !expense) return;

    setLoading(true);
    try {
      await onUpdate(expense.id, {
        amount: Number(amount),
        category: selectedCategory,
        merchant: merchant,
        note: note || undefined,
        date: date,
      });
      toast.success('Expense updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expense) return;

    setDeleting(true);
    setShowDeleteDialog(false);

    try {
      await onDelete(expense.id);
      toast.success('Expense deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (!expense) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl !left-1/2 !right-auto !-translate-x-1/2 w-full max-w-md data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom flex flex-col"
      >
        <SheetHeader className="text-left flex-shrink-0">
          <SheetTitle>Edit Expense</SheetTitle>
          <SheetDescription className="sr-only">
            Edit the amount, category, merchant, note, and date for this expense, or delete it permanently.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Amount input */}
          <div className="text-center">
            <span className="text-2xl text-muted-foreground">{currency}</span>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="text-5xl font-bold text-center w-full bg-transparent border-none focus:outline-none"
              autoFocus
            />
          </div>

          {/* Category picker */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Category</p>
            <div className="grid grid-cols-5 gap-3">
              {categories.map((cat) => {
                const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;
                const isSelected = selectedCategory === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs truncate w-full text-center">{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Date picker */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      // Preserve current time, only update the date portion
                      const updatedDate = new Date(date);
                      updatedDate.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                      setDate(updatedDate);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Merchant (required) */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Merchant</p>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Keells, Dialog"
            />
          </div>

          {/* Note (optional) */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Note (optional)</p>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this expense"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              className="w-full h-12"
              size="lg"
              disabled={!amount || !selectedCategory || !merchant || loading}
              onClick={handleUpdate}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Update Expense
                </>
              )}
            </Button>

            <Button
              variant="destructive"
              className="w-full h-12"
              size="lg"
              disabled={deleting}
              onClick={handleDeleteClick}
            >
              {deleting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete Expense
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
