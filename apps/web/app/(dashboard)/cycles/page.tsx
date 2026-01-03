'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useCycleHistory } from '@expense-tracker/shared-hooks';
import { CycleCard } from '@/components/cycles/CycleCard';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CyclesPage() {
  const { user } = useAuth();
  const { cycleSummaries, currentCycle, loading } = useCycleHistory(user, 12);
  const currency = user?.settings.currency || 'Rs.';

  // Filter out cycles with no expenses
  const filteredCycleSummaries = cycleSummaries.filter((cycle) => cycle.expenseCount > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Billing Cycles</h1>
        <p className="text-muted-foreground text-sm mb-4">
          View and compare your spending across billing cycles
        </p>

        {/* Compare Button */}
        <Link href="/cycles/compare">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Compare Cycles
          </Button>
        </Link>
      </div>

      {/* Current Cycle */}
      {currentCycle && currentCycle.expenseCount > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Current Cycle</h2>
          <CycleCard summary={currentCycle} currency={currency} showDetails />
        </div>
      )}

      {/* Past Cycles */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Past Cycles</h2>
        {filteredCycleSummaries.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No past billing cycles yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your cycle history will appear here as you track expenses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCycleSummaries.map((summary) => (
              <CycleCard
                key={summary.cycleId}
                summary={summary}
                currency={currency}
                showDetails
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
