// Bambeh Marketplace - Currency utilities
// FILE: src/utils/currency.ts

export function formatXAF(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
} // FIX: was missing closing brace

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('fr-CM').format(amount);
} // FIX: was missing closing brace

export function parseXAF(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

export function xafToUSD(xaf: number): number {
  return Math.round((xaf / 600) * 100) / 100;
}

// FIX: body was completely garbled — reconstructed from intent
export function formatCurrency(amount: number, currency: string = 'XAF'): string {
  if (currency === 'Zerms') return `${amount} Zerms`;
  return formatXAF(amount);
}

const currencyUtils = { formatXAF, formatNumber, parseXAF, xafToUSD, formatCurrency };
export default currencyUtils;
