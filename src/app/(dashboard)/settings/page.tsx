'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency } from '@/lib/utils/currency';
import { SaveIcon } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateSettings } = useAuth();
  const [monthlyLimit, setMonthlyLimit] = useState(String(user?.settings.monthlyLimit || 100000));
  const [billingDate, setBillingDate] = useState(String(user?.settings.billingDate || 15));
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    try {
      await updateSettings({
        monthlyLimit: Number(monthlyLimit),
        billingDate: Number(billingDate),
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

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Settings</h1>

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
            <Label htmlFor="monthlyLimit">Monthly Budget Limit</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{user.settings.currency}</span>
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
              Current: {formatCurrency(user.settings.monthlyLimit, user.settings.currency)}
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
