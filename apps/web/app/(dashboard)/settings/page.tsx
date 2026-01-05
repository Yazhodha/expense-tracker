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
import { SaveIcon, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

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
    if (!confirm('This will clear all cached data and reload the app. Continue?')) {
      return;
    }

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
      alert('Failed to clear cache. Please try again.');
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

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;

    // Prevent deleting default categories
    if (DEFAULT_CATEGORY_IDS.includes(categoryId)) {
      toast.error('Cannot delete default categories');
      return;
    }

    // Count expenses using this category
    const affectedExpenses = expenses.filter(e => e.category === categoryId);
    const expenseCount = affectedExpenses.length;

    // Confirm deletion
    const message = expenseCount > 0
      ? `This will delete the category and move ${expenseCount} expense${expenseCount > 1 ? 's' : ''} to "Other". Continue?`
      : 'Are you sure you want to delete this category?';

    if (!confirm(message)) {
      return;
    }

    setDeletingCategory(categoryId);
    try {
      // Reassign all expenses to "other" category
      if (expenseCount > 0) {
        await Promise.all(
          affectedExpenses.map(expense =>
            updateExpense(expense.id, { category: 'other' })
          )
        );
      }

      // Remove category from user settings
      const updatedCategories = user.settings.categories.filter(c => c.id !== categoryId);
      await updateSettings({ categories: updatedCategories });

      toast.success(`Category deleted${expenseCount > 0 ? ` and ${expenseCount} expense${expenseCount > 1 ? 's' : ''} moved to Other` : ''}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setDeletingCategory(null);
    }
  };

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
          <CardTitle>Manage Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Custom categories can be deleted. Expenses will be moved to "Other".
          </p>

          {user.settings.categories.map((category) => {
            const IconComponent = (Icons as any)[category.icon] || Icons.Circle;
            const isDefault = DEFAULT_CATEGORY_IDS.includes(category.id);
            const isDeleting = deletingCategory === category.id;
            const expenseCount = expenses.filter(e => e.category === category.id).length;

            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {expenseCount} expense{expenseCount !== 1 ? 's' : ''}
                      {isDefault && ' • Default category'}
                    </p>
                  </div>
                </div>

                {!isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={isDeleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

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
              onClick={handleClearCache}
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
