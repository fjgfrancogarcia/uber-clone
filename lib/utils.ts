import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina múltiples clases de Tailwind y resuelve conflictos entre ellas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 