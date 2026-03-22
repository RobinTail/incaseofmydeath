import { z } from 'zod'

export const checkFreqSchema = z.enum(['day', 'week', 'month', 'quarter', 'year'])

export const msInDay = 86400000

export function checkFreqToDays(freq: string): number {
  switch (freq) {
    case 'day':
      return 1
    case 'week':
      return 7
    case 'month':
      return 30
    case 'quarter':
      return 90
    case 'year':
      return 365
    default:
      return 30
  }
}

export function getDefaultNextCheck(freq: string): Date {
  return new Date(Date.now() + checkFreqToDays(freq) * msInDay)
}
