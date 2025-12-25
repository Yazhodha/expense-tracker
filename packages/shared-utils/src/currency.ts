export function formatCurrency(amount: number, currency = 'Rs.'): string {
  return `${currency} ${amount.toLocaleString('en-IN')}`;
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}
