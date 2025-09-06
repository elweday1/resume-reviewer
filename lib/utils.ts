import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { SeverityLevel } from "./schemas"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export const SEVERITY_DATA = {
  Critical: { color: '#dc2626', label: 'Critical', Icon: XCircle, variant: 'destructive' } as const,
  High: { color: '#ea580c', label: 'High', Icon: AlertTriangle, variant: 'destructive' } as const,
  Medium: { color: '#ca8a04', label: 'Medium', Icon: AlertCircle, variant: 'secondary' } as const,
  Low: { color: '#6b7280', label: 'Low', Icon: CheckCircle, variant: 'outline' } as const,
} as const
