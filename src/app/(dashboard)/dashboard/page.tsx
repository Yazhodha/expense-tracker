'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.displayName}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your expense tracker is ready. Phase 1 and 2 are complete!
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p>✓ Firebase authentication working</p>
            <p>✓ User profile loaded</p>
            <p>✓ UI components initialized</p>
            <p className="text-xs text-muted-foreground mt-4">
              Monthly Limit: {user?.settings.currency} {user?.settings.monthlyLimit.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground">
              Billing Date: {user?.settings.billingDate}th of each month
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>• Phase 3: Core UI Components (Budget Ring, Expense List)</p>
          <p>• Phase 4: Firebase Integration & Data Hooks</p>
          <p>• Phase 5: MCP Server Integration</p>
          <p>• Phase 6: Push Notifications</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
