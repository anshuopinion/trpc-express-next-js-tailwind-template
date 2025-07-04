import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function setToLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}