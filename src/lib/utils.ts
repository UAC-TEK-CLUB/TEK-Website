import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "MMM d, yyyy") {
  return format(new Date(date), pattern);
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim();
}

export function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}
