'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Category } from '@/lib/types';
import { Plus, Check, Calendar as CalendarIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface AddExpenseSheetProps {
  categories: Category[];
  onAdd: (expense: { amount: number; category: string; merchant?: string; note?: string; date?: Date }) => Promise<void>;
  currency?: string;
}

export function AddExpenseSheet({ categories, onAdd, currency = 'Rs.' }: AddExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory || !merchant) return;

    setLoading(true);
    try {
      await onAdd({
        amount: Number(amount),
        category: selectedCategory,
        merchant: merchant,
        note: note || undefined,
        date: date,
      });

      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setMerchant('');
      setNote('');
      setDate(new Date());
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl !left-1/2 !right-auto !-translate-x-1/2 w-full max-w-md data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom flex flex-col"
      >
          <SheetHeader className="text-left flex-shrink-0">
            <SheetTitle>Add Expense</SheetTitle>
            <SheetDescription className="sr-only">
              Enter the amount, select a category, add a merchant name, optionally add a note and choose a date for this expense.
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

          {/* Submit button */}
          <Button
            className="w-full h-12"
            size="lg"
            disabled={!amount || !selectedCategory || !merchant || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Add Expense
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
