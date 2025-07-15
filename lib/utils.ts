/**
 * Utility Functions
 * 
 * This module provides utility functions used throughout the application.
 * Currently includes class name merging utilities for dynamic styling.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Class Name Utility Function
 * 
 * Combines and merges class names intelligently using clsx and tailwind-merge.
 * This function is essential for dynamic styling throughout the application,
 * especially for theme-aware components and conditional styling.
 * 
 * Features:
 * - Combines multiple class values using clsx
 * - Resolves Tailwind CSS class conflicts using twMerge
 * - Supports conditional classes, arrays, and objects
 * - Ensures proper precedence for conflicting Tailwind classes
 * 
 * @param inputs - Any number of class values (strings, objects, arrays, conditionals)
 * @returns A merged string of class names with conflicts resolved
 * 
 * @example
 * cn('text-red-500', 'text-blue-500') // Returns 'text-blue-500' (last wins)
 * cn('p-4', condition && 'p-8') // Conditionally applies classes
 * cn({ 'bg-red-500': isError, 'bg-green-500': isSuccess }) // Object syntax
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
