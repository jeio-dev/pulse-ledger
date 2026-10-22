import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currencySymbol = "$",
  options?: { showSign?: boolean; decimals?: number }
): string {
  const decimals = options?.decimals ?? 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (amount < 0) {
    return `-${currencySymbol}${formatted}`;
  }
  if (options?.showSign && amount > 0) {
    return `+${currencySymbol}${formatted}`;
  }
  return `${currencySymbol}${formatted}`;
}
