import type { Category } from './types'

// Valeurs “proposées” (pas une garantie sanitaire)
// Basé sur repères grand public (ex. Santé Canada) [web:217]
export const DEFAULT_DAYS: Record<Category, number> = {
  cooked_dish: 4,          // 3-4 jours
  soup: 3,                 // 2-3 jours
  cooked_fish_poultry: 4,  // 3-4 jours
  meat_sauce: 4,           // 3-4 jours
}

export const CATEGORY_LABEL: Record<Category, string> = {
  cooked_dish: 'Plat cuisiné',
  soup: 'Soupe',
  cooked_fish_poultry: 'Poisson / volaille cuits',
  meat_sauce: 'Sauce / bouillon viande',
}

