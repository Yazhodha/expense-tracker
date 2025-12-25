import { BillingCycle } from '@expense-tracker/shared-types';
import { startOfDay, endOfDay, differenceInDays, addMonths, setDate, isAfter, isBefore } from 'date-fns';

export function getBillingCycle(billingDate: number, referenceDate = new Date()): BillingCycle {
  const today = startOfDay(referenceDate);

  // Determine current cycle start
  let cycleStart = setDate(today, billingDate);

  // If we're before the billing date this month, cycle started last month
  if (isBefore(today, cycleStart)) {
    cycleStart = addMonths(cycleStart, -1);
  }

  // Cycle ends one day before next billing date
  const cycleEnd = endOfDay(addMonths(setDate(cycleStart, billingDate), 1));
  cycleEnd.setDate(cycleEnd.getDate() - 1);

  const daysTotal = differenceInDays(cycleEnd, cycleStart) + 1;
  const daysElapsed = differenceInDays(today, cycleStart) + 1;
  const daysRemaining = daysTotal - daysElapsed;

  return {
    startDate: cycleStart,
    endDate: cycleEnd,
    daysTotal,
    daysElapsed,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

export function isInCurrentCycle(date: Date, billingDate: number): boolean {
  const cycle = getBillingCycle(billingDate);
  const checkDate = startOfDay(date);
  return !isBefore(checkDate, cycle.startDate) && !isAfter(checkDate, cycle.endDate);
}
