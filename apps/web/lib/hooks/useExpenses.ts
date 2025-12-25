'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useExpenses as useExpensesShared } from '@expense-tracker/shared-hooks';

export function useExpenses() {
  const { user } = useAuth();
  return useExpensesShared(user);
}
