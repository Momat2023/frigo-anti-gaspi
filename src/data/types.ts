export type Category =
  | 'Fruits & Légumes'
  | 'Viandes & Poissons'
  | 'Produits laitiers'
  | 'Boissons'
  | 'Conserves'
  | 'Surgelés'
  | 'Autre'

export type Location = 'Frigo' | 'Congélateur' | 'Placard'

export type Status = 'active' | 'eaten' | 'thrown'

export type Item = {
  id: number
  name: string
  category: Category
  openedAt: number
  expiresAt: number
  targetDays: number
  location: Location
  status: Status
  barcode?: string
  imageUrl?: string
}

export type Settings = {
  id: 'main'
  notificationsEnabled: boolean
}

export type Stats = {
  consumed: number
  thrown: number
  totalSaved: number
  totalWasted: number
  successRate: number
  streak: number
  lastActivityDate: number
}
