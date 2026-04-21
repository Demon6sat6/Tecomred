import { useAdmin } from '../context/AdminContext';

const SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
  COP: 'COP$',
  MXN: 'MX$',
  ARS: 'AR$',
  VES: 'Bs.',
};

export function useCurrency() {
  const { settings } = useAdmin();
  const symbol = SYMBOLS[settings.currency] ?? settings.currency;

  const format = (amount: number) =>
    `${symbol} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatShort = (amount: number) =>
    `${symbol}${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return { symbol, format, formatShort };
}
