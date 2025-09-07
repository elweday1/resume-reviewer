import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlertTriangle, CheckCircle, XCircle, AlertCircle, CircleMinus } from 'lucide-react'
import type { SeverityLevel } from "./schemas"
import React from "react"

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

export const SEVERITY_DATA: Record<SeverityLevel, {
  color: string, label: string, Icon: any, variant: string
}> = {
  Critical: { color: '#dc2626', label: 'Critical', Icon: XCircle, variant: 'destructive' },
  High: { color: '#ea580c', label: 'High', Icon: AlertTriangle, variant: 'destructive' },
  Medium: { color: '#ca8a04', label: 'Medium', Icon: AlertCircle, variant: 'secondary' },
  Low: { color: '#6b7280', label: 'Low', Icon: CircleMinus, variant: 'outline' },
  Good: { color: '#aaf323', label: "Good", Icon: CheckCircle, variant: "outline" }
} as const
