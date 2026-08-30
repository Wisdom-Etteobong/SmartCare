/**
 * Currency Formatter Utility
 * Formats monetary amounts to Nigerian Naira (₦) with a default baseline minimum of ₦10,000.
 */

export const MINIMUM_CONSULTATION_FEE = 10000;

export const formatNaira = (amount?: number | null, fallback = MINIMUM_CONSULTATION_FEE): string => {
  const value = typeof amount === 'number' && !isNaN(amount) && amount > 0 ? amount : fallback;
  return `₦${value.toLocaleString()}`;
};
