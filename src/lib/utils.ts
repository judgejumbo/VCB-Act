import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateWebhookSignature(): boolean {
  // This will be implemented when we add webhook functionality
  // signature: string, body: string, secret: string will be parameters
  // For now, return false to prevent unauthorized access
  return false;
}
