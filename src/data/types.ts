export type Location = 'fridge' | 'freezer'
export type ItemStatus = 'active' | 'eaten' | 'thrown'

// Catégories simples (tu peux en ajouter après)
export type Category =
  | 'cooked_dish' // plat cuisiné (œufs/viande/légumes)
  | 'soup'
  | 'cooked_fish_poultry'
  | 'meat_sauce' // bouillon/fond/sauce de viande

export type Item = {
  id: string
  name: string
  category: Category
  location: Location
  openedAt: number
  targetDays: number
  status: ItemStatus
  createdAt: number
}

