// Currency configuration
export const CURRENCY_FORMATS = {
  'en-US': { locale: 'en-US', name: 'US Dollar', symbol: '$' },
  'en-IN': { locale: 'en-IN', name: 'Indian Rupee', symbol: '₹' },
  'en-GB': { locale: 'en-GB', name: 'British Pound', symbol: '£' },
  'en-EU': { locale: 'en-EU', name: 'Euro', symbol: '€' },
  'en-LK': { locale: 'en-US', name: 'Sri Lankan Rupee', symbol: 'Rs.' }, // Uses US formatting
} as const;

export type CurrencyFormat = keyof typeof CURRENCY_FORMATS;

// Default currency format (can be overridden by user settings)
export const DEFAULT_CURRENCY_FORMAT: CurrencyFormat = 'en-LK';

/**
 * Formats a number as currency with consistent decimal places
 * @param amount - The monetary amount to format
 * @param currencySymbol - The currency symbol (e.g., 'Rs.', '$', '₹')
 * @param localeFormat - The locale format for number formatting (default: 'en-LK')
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string with 2 decimal places
 */
export function formatCurrency(
  amount: number,
  currencySymbol = 'Rs.',
  localeFormat: CurrencyFormat = DEFAULT_CURRENCY_FORMAT,
  showDecimals = true
): string {
  const options: Intl.NumberFormatOptions = showDecimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { minimumFractionDigits: 0, maximumFractionDigits: 0 };

  const locale = CURRENCY_FORMATS[localeFormat]?.locale || 'en-US';
  return `${currencySymbol} ${amount.toLocaleString(locale, options)}`;
}

/**
 * Parses a currency string to a number
 * @param value - The currency string to parse
 * @returns Parsed number value
 */
export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}

/**
 * Rounds a number to 2 decimal places for financial precision
 * @param amount - The amount to round
 * @param decimals - Number of decimal places (default: 2)
 * @returns Number rounded to specified decimal places
 */
export function roundToDecimals(amount: number, decimals = 2): number {
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
