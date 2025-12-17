export type OpenFoodFactsProduct = {
  product_name?: string
  brands?: string
  categories?: string
  categories_tags?: string[]
  ingredients_text?: string
  image_url?: string
  nutrition_grades?: string
  quantity?: string
  code?: string
}

export type OpenFoodFactsResponse = {
  status: number
  status_verbose: string
  code?: string
  product?: OpenFoodFactsProduct
}

const BASE_URL = 'https://world.openfoodfacts.org/api/v2'

/**
 * Récupère les infos d'un produit depuis Open Food Facts
 */
export async function getProductByBarcode(barcode: string): Promise<OpenFoodFactsResponse> {
  try {
    const fields = [
      'product_name',
      'brands',
      'categories',
      'categories_tags',
      'ingredients_text',
      'image_url',
      'nutrition_grades',
      'quantity',
      'code'
    ].join(',')

    const url = `${BASE_URL}/product/${barcode}?fields=${fields}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: OpenFoodFactsResponse = await response.json()
    return data
  } catch (error) {
    console.error('Erreur Open Food Facts:', error)
    return {
      status: 0,
      status_verbose: 'Network error'
    }
  }
}

/**
 * Détermine la catégorie de l'aliment pour l'app
 */
export function mapToAppCategory(categories?: string, categoriesTags?: string[]): string {
  if (!categories && !categoriesTags) return 'Autre'
  
  const allCategories = [
    categories?.toLowerCase() || '',
    ...(categoriesTags?.map(t => t.toLowerCase()) || [])
  ].join(' ')

  // Mapping intelligent vers les catégories de l'app
  if (allCategories.includes('fruit') || allCategories.includes('légume') || allCategories.includes('vegetable')) {
    return 'Fruits & Légumes'
  }
  if (allCategories.includes('viande') || allCategories.includes('meat') || allCategories.includes('poisson') || allCategories.includes('fish')) {
    return 'Viandes & Poissons'
  }
  if (allCategories.includes('produit laitier') || allCategories.includes('dairy') || allCategories.includes('yaourt') || allCategories.includes('fromage') || allCategories.includes('cheese')) {
    return 'Produits laitiers'
  }
  if (allCategories.includes('boisson') || allCategories.includes('beverage') || allCategories.includes('drink')) {
    return 'Boissons'
  }
  if (allCategories.includes('conserve') || allCategories.includes('canned')) {
    return 'Conserves'
  }
  if (allCategories.includes('surgelé') || allCategories.includes('frozen')) {
    return 'Surgelés'
  }
  
  return 'Autre'
}

/**
 * Suggère une durée de conservation en jours selon la catégorie
 */
export function suggestExpirationDays(category: string): number {
  const defaults: Record<string, number> = {
    'Fruits & Légumes': 7,
    'Viandes & Poissons': 3,
    'Produits laitiers': 7,
    'Boissons': 30,
    'Conserves': 365,
    'Surgelés': 90,
    'Autre': 14
  }
  
  return defaults[category] || 14
}

/**
 * Formate le nom du produit (avec la marque si disponible)
 */
export function formatProductName(product: OpenFoodFactsProduct): string {
  const name = product.product_name || 'Produit inconnu'
  const brand = product.brands?.split(',')[0]?.trim()
  
  if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
    return `${brand} ${name}`
  }
  
  return name
}
