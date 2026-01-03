import { useEffect, useState, useCallback } from 'react';
import { CycleSummary, User, Expense, BillingCycle } from '@expense-tracker/shared-types';
import {
  getPastBillingCycles,
  getBillingCycle,
  calculateCycleSummary,
  getCycleId
} from '@expense-tracker/shared-utils';
import { subscribeToExpenses } from '@expense-tracker/shared-firebase';

interface UseCycleHistoryReturn {
  cycleSummaries: CycleSummary[];
  loading: boolean;
  currentCycle: CycleSummary | null;
  getCycleSummary: (cycleId: string) => CycleSummary | undefined;
  refreshCycles: () => void;
}

/**
 * Hook to fetch and manage historical billing cycle data
 * @param user Current user
 * @param historyCount Number of past cycles to fetch (default: 6)
 */
export function useCycleHistory(
  user: User | null,
  historyCount: number = 6
): UseCycleHistoryReturn {
  const [cycleSummaries, setCycleSummaries] = useState<CycleSummary[]>([]);
  const [currentCycle, setCurrentCycle] = useState<CycleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const billingDate = user?.settings.billingDate || 15;
  const budgetLimit = user?.settings.monthlyLimit || 100000;
  const categories = user?.settings.categories || [];

  // Fetch and calculate cycle summaries
  const fetchCycles = useCallback(async () => {
    if (!user) {
      setCycleSummaries([]);
      setCurrentCycle(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Get current and past cycles
      const currentBillingCycle = getBillingCycle(billingDate);
      const pastCycles = getPastBillingCycles(billingDate, historyCount);
      const allCycles = [currentBillingCycle, ...pastCycles];

      // Fetch expenses for all cycles
      const summaries: CycleSummary[] = [];

      for (const cycle of allCycles) {
        // For now, we'll fetch expenses synchronously
        // In a real implementation, you might want to fetch all in parallel
        const expenses = await fetchExpensesForCycle(user.uid, cycle);
        const summary = calculateCycleSummary(cycle, expenses, budgetLimit, categories);
        summaries.push(summary);
      }

      // Separate current cycle from history
      setCurrentCycle(summaries[0]);
      setCycleSummaries(summaries.slice(1)); // Past cycles only
    } catch (error) {
      console.error('Error fetching cycle history:', error);
    } finally {
      setLoading(false);
    }
  }, [user, billingDate, budgetLimit, categories, historyCount]);

  // Helper to fetch expenses for a specific cycle
  const fetchExpensesForCycle = (
    userId: string,
    cycle: BillingCycle
  ): Promise<Expense[]> => {
    return new Promise((resolve) => {
      const unsubscribe = subscribeToExpenses(
        userId,
        cycle.startDate,
        cycle.endDate,
        (expenses) => {
          unsubscribe();
          resolve(expenses);
        }
      );
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  // Get a specific cycle summary by ID
  const getCycleSummary = useCallback(
    (cycleId: string): CycleSummary | undefined => {
      if (currentCycle && getCycleId(currentCycle.cycle) === cycleId) {
        return currentCycle;
      }
      return cycleSummaries.find((c) => c.cycleId === cycleId);
    },
    [cycleSummaries, currentCycle]
  );

  return {
    cycleSummaries,
    loading,
    currentCycle,
    getCycleSummary,
    refreshCycles: fetchCycles,
  };
}
