'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCycleHistory } from '@expense-tracker/shared-hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CycleComparison as CycleComparisonComponent } from '@/components/cycles/CycleComparison';
import { compareCycles } from '@expense-tracker/shared-utils';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cycleSummaries, currentCycle, loading } = useCycleHistory(user, 12);

  // Only show cycles with expenses
  const allCycles = currentCycle ? [currentCycle, ...cycleSummaries] : cycleSummaries;
  const cyclesWithExpenses = allCycles.filter((c) => c.expenseCount > 0);

  // Get initial cycle IDs from URL params or default to current vs last
  const initialCycle1 = searchParams.get('cycle1') || cyclesWithExpenses[0]?.cycleId || '';
  const initialCycle2 = searchParams.get('cycle2') || cyclesWithExpenses[1]?.cycleId || '';

  const [selectedCycle1, setSelectedCycle1] = useState(initialCycle1);
  const [selectedCycle2, setSelectedCycle2] = useState(initialCycle2);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const cycle1Summary = allCycles.find((c) => c.cycleId === selectedCycle1);
  const cycle2Summary = allCycles.find((c) => c.cycleId === selectedCycle2);

  const comparison = useMemo(() => {
    if (!cycle1Summary || !cycle2Summary) return null;
    return compareCycles(cycle1Summary, cycle2Summary);
  }, [cycle1Summary, cycle2Summary]);

  // Get all unique categories from both cycles
  const allCategories = useMemo(() => {
    if (!comparison) return [];
    return comparison.categoryComparisons.map((c) => ({
      id: c.categoryId,
      name: c.categoryName,
    }));
  }, [comparison]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(allCategories.map((c) => c.id));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cyclesWithExpenses.length < 2) {
    return (
      <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Not enough cycles to compare</p>
          <p className="text-sm text-muted-foreground mt-1">
            You need at least 2 billing cycles with expenses to use this feature
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-1">Compare Billing Cycles</h1>
        <p className="text-muted-foreground text-sm">
          Compare your spending across different billing cycles
        </p>
      </div>

      {/* Cycle Selectors */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cycle 1 Selector */}
            <div>
              <Label htmlFor="cycle1-select" className="text-sm font-medium mb-2 block">
                Current Cycle
              </Label>
              <select
                id="cycle1-select"
                value={selectedCycle1}
                onChange={(e) => setSelectedCycle1(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {cyclesWithExpenses.map((cycle) => (
                  <option key={cycle.cycleId} value={cycle.cycleId}>
                    {format(cycle.cycle.startDate, 'MMM d')} - {format(cycle.cycle.endDate, 'MMM d, yyyy')}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle 2 Selector */}
            <div>
              <Label htmlFor="cycle2-select" className="text-sm font-medium mb-2 block">
                Compare With
              </Label>
              <select
                id="cycle2-select"
                value={selectedCycle2}
                onChange={(e) => setSelectedCycle2(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {cyclesWithExpenses
                  .filter((cycle) => cycle.cycleId !== selectedCycle1)
                  .map((cycle) => (
                    <option key={cycle.cycleId} value={cycle.cycleId}>
                      {format(cycle.cycle.startDate, 'MMM d')} - {format(cycle.cycle.endDate, 'MMM d, yyyy')}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      {allCategories.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Filter by Categories (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllCategories}
                  className="h-7 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllCategories}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparison ? (
        <CycleComparisonComponent
          comparison={comparison}
          currency={user?.settings.currency}
          selectedCategories={selectedCategories.length > 0 ? selectedCategories : undefined}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select two different cycles to compare</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
