/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date with time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Calculates the weighted average of scores
 */
export function calculateWeightedAverage(
  scores: { criterion: string; score: number }[],
  weights: Record<string, number>
): number {
  if (scores.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const { criterion, score } of scores) {
    const weight = weights[criterion] || 1;
    weightedSum += score * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Determines Go/No Go decision based on weighted average and threshold
 */
export function determineDecision(
  weightedAverage: number,
  threshold: number = 3
): "go" | "no_go" {
  return weightedAverage >= threshold ? "go" : "no_go";
}

/**
 * Generates a color based on score (1-5)
 */
export function getScoreColor(score: number): string {
  if (score >= 4.5) return "bg-green-500";
  if (score >= 3.5) return "bg-green-400";
  if (score >= 2.5) return "bg-yellow-400";
  if (score >= 1.5) return "bg-orange-400";
  return "bg-red-500";
}

/**
 * Formats a score for display
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Formats a percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

