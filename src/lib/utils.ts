import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility helper combining clsx conditional classes and tailwind-merge conflict resolution.
 * Required by shadcn/ui and Kokonut UI components.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
