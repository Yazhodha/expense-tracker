import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency as baseFormatCurrency, CurrencyFormat } from '@expense-tracker/shared-utils';

/**
 * Hook to format currency values based on user settings
 */
export function useCurrency() {
  const { user } = useAuth();

  const formatCurrency = (amount: number, showDecimals = true): string => {
    const currencySymbol = user?.settings.currency || 'Rs.';
    const currencyFormat = (user?.settings.currencyFormat as CurrencyFormat) || 'en-LK';

    return baseFormatCurrency(amount, currencySymbol, currencyFormat, showDecimals);
  };

  return {
    formatCurrency,
    currency: user?.settings.currency || 'Rs.',
    currencyFormat: (user?.settings.currencyFormat as CurrencyFormat) || 'en-LK',
  };
}
