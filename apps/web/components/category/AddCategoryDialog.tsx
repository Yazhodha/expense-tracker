'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, color: string) => void;
}

export function AddCategoryDialog({ open, onOpenChange, onAdd }: AddCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAdd(categoryName.trim(), selectedColor);
      setCategoryName('');
      setSelectedColor('#3b82f6');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl !left-1/2 !right-auto !-translate-x-1/2 w-full max-w-md h-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Custom Category</SheetTitle>
          <SheetDescription>
            Create a new category for your expenses
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Entertainment, Travel"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <Label>Color</Label>
              <div className="flex justify-center">
                <HexColorPicker color={selectedColor} onChange={setSelectedColor} style={{ width: '100%', height: '200px' }} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
                  style={{ backgroundColor: selectedColor }}
                />
                <Input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!categoryName.trim()} className="flex-1">
              Add Category
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
