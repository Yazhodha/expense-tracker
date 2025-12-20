'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsightsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Insights</h1>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Category breakdown and spending trends will appear here.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
