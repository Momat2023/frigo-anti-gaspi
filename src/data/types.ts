export type Item = {
  id: number
  name: string
  category: Category
  expiresAt: number
  location: Location
  status: 'active' | 'eaten' | 'thrown'
  createdAt: number
  openedAt: number
  targetDays: number
  barcode?: string
  imageUrl?: string
}

export type Category = 
  | 'Fruits & Légumes'
  | 'Viandes & Poissons'
  | 'Produits laitiers'
  | 'Boissons'
  | 'Conserves'
  | 'Surgelés'
  | 'Autre'
  | 'cooked_dish'
  | 'soup'
  | 'cooked_fish_poultry'
  | 'meat_sauce'

export type Location = 'Frigo' | 'Congélateur' | 'Placard'

export type Settings = {
  key: string
  notificationsEnabled: boolean
  defaultLocation: Location
  defaultTargetDays: number
  defaultDaysByCategory?: Record<string, number>
  updatedAt?: number
}
