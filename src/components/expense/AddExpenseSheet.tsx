'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Category } from '@/lib/types';
import { Plus, Check } from 'lucide-react';
import * as Icons from 'lucide-react';

interface AddExpenseSheetProps {
  categories: Category[];
  onAdd: (expense: { amount: number; category: string; merchant?: string; note?: string }) => Promise<void>;
  currency?: string;
}

export function AddExpenseSheet({ categories, onAdd, currency = 'Rs.' }: AddExpenseSheetProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [merchant, setMerchant] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) return;

    setLoading(true);
    try {
      await onAdd({
        amount: Number(amount),
        category: selectedCategory,
        merchant: merchant || undefined,
      });

      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setMerchant('');
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
        className="h-[85vh] rounded-t-3xl !left-1/2 !right-auto !-translate-x-1/2 w-full max-w-md data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
      >
          <SheetHeader className="text-left">
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
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

          {/* Merchant (optional) */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Merchant (optional)</p>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Keells, Dialog"
            />
          </div>

          {/* Submit button */}
          <Button
            className="w-full h-12"
            size="lg"
            disabled={!amount || !selectedCategory || loading}
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
