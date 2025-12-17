import type { Category } from './types'

export const CATEGORY_DURATIONS: Record<Category, number> = {
  'Fruits & Légumes': 5,
  'Viandes & Poissons': 2,
  'Produits laitiers': 7,
  'Boissons': 30,
  'Conserves': 365,
  'Surgelés': 180,
  'Autre': 7
}

export const CATEGORY_COLORS: Record<Category, string> = {
  'Fruits & Légumes': '#22c55e',
  'Viandes & Poissons': '#ef4444',
  'Produits laitiers': '#3b82f6',
  'Boissons': '#a855f7',
  'Conserves': '#f59e0b',
  'Surgelés': '#06b6d4',
  'Autre': '#6b7280'
}
