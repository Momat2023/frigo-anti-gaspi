import type { Category } from './types'

// Durées de conservation recommandées par catégorie (en jours)
export const DEFAULT_DAYS: Record<Category, number> = {
  'Fruits & Légumes': 7,
  'Viandes & Poissons': 3,
  'Produits laitiers': 7,
  'Boissons': 30,
  'Conserves': 365,
  'Surgelés': 90,
  'Autre': 14,
  cooked_dish: 4,
  soup: 3,
  cooked_fish_poultry: 4,
  meat_sauce: 4
}

export const CATEGORY_LABEL: Record<Category, string> = {
  'Fruits & Légumes': 'Fruits & Légumes',
  'Viandes & Poissons': 'Viandes & Poissons',
  'Produits laitiers': 'Produits laitiers',
  'Boissons': 'Boissons',
  'Conserves': 'Conserves',
  'Surgelés': 'Surgelés',
  'Autre': 'Autre',
  cooked_dish: 'Plat cuisiné',
  soup: 'Soupe',
  cooked_fish_poultry: 'Poisson / volaille cuits',
  meat_sauce: 'Sauce / bouillon viande'
}
