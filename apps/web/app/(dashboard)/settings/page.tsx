'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses } from '@/lib/hooks/useExpenses';
import { formatCurrency, CURRENCY_FORMATS, CurrencyFormat } from '@expense-tracker/shared-utils';
import { SaveIcon, RefreshCw, Trash2, ChevronDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

// Default category IDs that cannot be deleted
const DEFAULT_CATEGORY_IDS = [
  'groceries', 'dining', 'fuel', 'shopping', 'subscriptions',
  'health', 'entertainment', 'transport', 'utilities', 'other'
];

export default function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const { expenses, updateExpense } = useExpenses();
  const [monthlyLimit, setMonthlyLimit] = useState(String(user?.settings.monthlyLimit || 100000));
  const [billingDate, setBillingDate] = useState(String(user?.settings.billingDate || 15));
  const [currencyFormat, setCurrencyFormat] = useState<CurrencyFormat>(
    (user?.settings.currencyFormat as CurrencyFormat) || 'en-LK'
  );
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [clearingCache, setClearingCache] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [selectedCategoriesToDelete, setSelectedCategoriesToDelete] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Check if there's already an update waiting
        if (registration.waiting) {
          setUpdateAvailable(true);
        }
      });

      // Listen for cache cleared message
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          window.location.reload();
        }
      });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      const selectedCurrency = CURRENCY_FORMATS[currencyFormat];
      await updateSettings({
        monthlyLimit: Number(monthlyLimit),
        billingDate: Number(billingDate),
        currencyFormat: currencyFormat,
        currency: selectedCurrency.symbol,
      });
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
          // The reload will happen when we receive the CACHE_CLEARED message
        }
      } else {
        // Fallback if service worker is not available
        window.location.reload();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setClearingCache(false);
      toast.error('Failed to clear cache. Please try again.');
    } finally {
      setShowClearCacheDialog(false);
    }
  };

  const handleUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  const handleDeleteCategories = async () => {
    if (!user || selectedCategoriesToDelete.length === 0) return;

    setDeleting(true);
    try {
      // Count total affected expenses
      const affectedExpenses = expenses.filter(e => selectedCategoriesToDelete.includes(e.category));
      const expenseCount = affectedExpenses.length;

      // Reassign all expenses to "other" category
      if (expenseCount > 0) {
        await Promise.all(
          affectedExpenses.map(expense =>
            updateExpense(expense.id, { category: 'other' })
          )
        );
      }

      // Remove categories from user settings
      const updatedCategories = user.settings.categories.filter(
        c => !selectedCategoriesToDelete.includes(c.id)
      );
      await updateSettings({ categories: updatedCategories });

      const categoryCount = selectedCategoriesToDelete.length;
      toast.success(
        `${categoryCount} categor${categoryCount > 1 ? 'ies' : 'y'} deleted${
          expenseCount > 0 ? ` and ${expenseCount} expense${expenseCount > 1 ? 's' : ''} moved to Other` : ''
        }`
      );

      // Reset selection
      setSelectedCategoriesToDelete([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting categories:', error);
      toast.error('Failed to delete categories. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get custom categories (non-default)
  const customCategories = user?.settings.categories.filter(
    c => !DEFAULT_CATEGORY_IDS.includes(c.id)
  ) || [];

  // Calculate total expenses that will be affected
  const affectedExpenseCount = expenses.filter(
    e => selectedCategoriesToDelete.includes(e.category)
  ).length;

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Update Available Banner */}
      {updateAvailable && (
        <Card className="border-blue-500 bg-blue-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400">Update Available</p>
                <p className="text-sm text-muted-foreground">A new version is ready to install</p>
              </div>
              <Button onClick={handleUpdate} size="sm" variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <ThemeToggle />
            <p className="text-xs text-muted-foreground">
              Choose your preferred color scheme
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currencyFormat">Currency & Format</Label>
            <Select value={currencyFormat} onValueChange={(value) => setCurrencyFormat(value as CurrencyFormat)}>
              <SelectTrigger id="currencyFormat">
                <SelectValue placeholder="Select currency format" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCY_FORMATS).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name} ({value.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Preview: {formatCurrency(100000, CURRENCY_FORMATS[currencyFormat].symbol, currencyFormat)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Budget Limit</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{CURRENCY_FORMATS[currencyFormat].symbol}</span>
              <Input
                id="monthlyLimit"
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                placeholder="100000"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current: {formatCurrency(user.settings.monthlyLimit, user.settings.currency, user.settings.currencyFormat as CurrencyFormat)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingDate">Billing Cycle Start Date</Label>
            <Input
              id="billingDate"
              type="number"
              min={1}
              max={28}
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              placeholder="15"
            />
            <p className="text-xs text-muted-foreground">
              Day of the month when your billing cycle starts (1-28)
            </p>
          </div>

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-500/10 text-green-500 rounded-lg text-sm"
            >
              {successMessage}
            </motion.div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <SaveIcon className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Custom Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No custom categories yet. Add categories when creating expenses.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Select custom categories to delete. Affected expenses will be moved to "Other".
              </p>

              {/* Category Selection Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>
                      {selectedCategoriesToDelete.length === 0
                        ? 'Select categories...'
                        : `${selectedCategoriesToDelete.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {customCategories.map((category) => {
                      const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
                      const expenseCount = expenses.filter(e => e.category === category.id).length;
                      const isSelected = selectedCategoriesToDelete.includes(category.id);

                      return (
                        <div
                          key={category.id}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedCategoriesToDelete(prev =>
                              isSelected
                                ? prev.filter(id => id !== category.id)
                                : [...prev, category.id]
                            );
                          }}
                        >
                          <Checkbox checked={isSelected} />
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{category.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Delete Button */}
              {selectedCategoriesToDelete.length > 0 && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedCategoriesToDelete.length} categor
                  {selectedCategoriesToDelete.length > 1 ? 'ies' : 'y'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Categories</AlertDialogTitle>
            <AlertDialogDescription>
              {affectedExpenseCount > 0 ? (
                <>
                  This will delete {selectedCategoriesToDelete.length} categor
                  {selectedCategoriesToDelete.length > 1 ? 'ies' : 'y'} and move{' '}
                  {affectedExpenseCount} expense{affectedExpenseCount > 1 ? 's' : ''} to "Other".
                  This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete {selectedCategoriesToDelete.length} categor
                  {selectedCategoriesToDelete.length > 1 ? 'ies' : 'y'}? This action cannot be
                  undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategories}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Cache Confirmation Dialog */}
      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Cache & Reload</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all cached data and reload the app. Any unsaved changes will be lost. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearingCache}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={clearingCache}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingCache ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Clearing...
                </>
              ) : (
                'Clear Cache'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* App Data & Cache */}
      <Card>
        <CardHeader>
          <CardTitle>App Data & Cache</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Clear Cache</Label>
            <p className="text-xs text-muted-foreground">
              Clear all cached data and reload the app. Use this if you're experiencing issues or not seeing updates.
            </p>
            <Button
              onClick={() => setShowClearCacheDialog(true)}
              disabled={clearingCache}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {clearingCache ? 'Clearing Cache...' : 'Clear Cache & Reload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{user.displayName}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
