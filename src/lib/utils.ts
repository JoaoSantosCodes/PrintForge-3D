import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}m`;
}

export function getFilamentLength(weightG: number, type = 'PLA'): number {
  const densityMap: { [key: string]: number } = {
    PLA: 1.24,
    PETG: 1.27,
    ABS: 1.04,
    ASA: 1.07,
    TPU: 1.21,
  };
  // Default to PLA density if type is not in map
  const materialType = type.toUpperCase().trim();
  const density = densityMap[materialType] || 1.24;
  const radiusCm = 0.175 / 2; // 1.75mm diameter standard
  const areaSqCm = Math.PI * Math.pow(radiusCm, 2);
  const weightPerMeterG = areaSqCm * 100 * density; // Volume of 1m * density
  return Math.round(weightG / weightPerMeterG);
}
