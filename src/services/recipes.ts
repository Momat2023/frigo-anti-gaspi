export type Recipe = {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strInstructions: string
  strMealThumb: string
  strYoutube?: string
  strIngredient1?: string
  strIngredient2?: string
  strIngredient3?: string
  strIngredient4?: string
  strIngredient5?: string
  strIngredient6?: string
  strIngredient7?: string
  strIngredient8?: string
  strIngredient9?: string
  strIngredient10?: string
  strIngredient11?: string
  strIngredient12?: string
  strIngredient13?: string
  strIngredient14?: string
  strIngredient15?: string
  strIngredient16?: string
  strIngredient17?: string
  strIngredient18?: string
  strIngredient19?: string
  strIngredient20?: string
  strMeasure1?: string
  strMeasure2?: string
  strMeasure3?: string
  strMeasure4?: string
  strMeasure5?: string
  strMeasure6?: string
  strMeasure7?: string
  strMeasure8?: string
  strMeasure9?: string
  strMeasure10?: string
  strMeasure11?: string
  strMeasure12?: string
  strMeasure13?: string
  strMeasure14?: string
  strMeasure15?: string
  strMeasure16?: string
  strMeasure17?: string
  strMeasure18?: string
  strMeasure19?: string
  strMeasure20?: string
}

export type RecipeIngredient = {
  name: string
  measure: string
}

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

/**
 * Recherche des recettes par ingrédient principal
 */
export async function searchByIngredient(ingredient: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`)
    const data = await response.json()
    
    if (!data.meals) return []
    
    // Récupérer les détails complets de chaque recette
    const detailsPromises = data.meals.slice(0, 6).map((meal: any) => 
      getRecipeById(meal.idMeal)
    )
    
    const recipes = await Promise.all(detailsPromises)
    return recipes.filter(r => r !== null) as Recipe[]
  } catch (error) {
    console.error('Erreur recherche recettes:', error)
    return []
  }
}

/**
 * Récupère les détails d'une recette par ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`)
    const data = await response.json()
    return data.meals ? data.meals[0] : null
  } catch (error) {
    console.error('Erreur détail recette:', error)
    return null
  }
}

/**
 * Récupère des recettes aléatoires
 */
export async function getRandomRecipes(count: number = 3): Promise<Recipe[]> {
  try {
    const promises = Array(count).fill(null).map(() => 
      fetch(`${BASE_URL}/random.php`).then(r => r.json())
    )
    
    const results = await Promise.all(promises)
    return results.map(r => r.meals[0]).filter(Boolean)
  } catch (error) {
    console.error('Erreur recettes aléatoires:', error)
    return []
  }
}

/**
 * Extrait les ingrédients d'une recette
 */
export function extractIngredients(recipe: Recipe): RecipeIngredient[] {
  const ingredients: RecipeIngredient[] = []
  
  for (let i = 1; i <= 20; i++) {
    const ingredientKey = `strIngredient${i}` as keyof Recipe
    const measureKey = `strMeasure${i}` as keyof Recipe
    
    const ingredient = recipe[ingredientKey]
    const measure = recipe[measureKey]
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || ''
      })
    }
  }
  
  return ingredients
}

/**
 * Trouve des recettes basées sur plusieurs ingrédients
 */
export async function searchByMultipleIngredients(ingredients: string[]): Promise<Recipe[]> {
  if (ingredients.length === 0) return getRandomRecipes(6)
  
  // Chercher avec le premier ingrédient (TheMealDB ne supporte qu'un ingrédient à la fois)
  const mainIngredient = ingredients[0]
  const recipes = await searchByIngredient(mainIngredient)
  
  // Filtrer les recettes qui contiennent au moins un autre ingrédient
  if (ingredients.length > 1) {
    return recipes.filter(recipe => {
      const recipeIngredients = extractIngredients(recipe)
        .map(ing => ing.name.toLowerCase())
      
      return ingredients.slice(1).some(ing => 
        recipeIngredients.some(rIng => 
          rIng.includes(ing.toLowerCase()) || ing.toLowerCase().includes(rIng)
        )
      )
    })
  }
  
  return recipes
}

/**
 * Traduit un nom d'aliment français vers l'anglais (basique)
 */
export function translateToEnglish(ingredient: string): string {
  const translations: Record<string, string> = {
    'tomate': 'tomato',
    'tomates': 'tomato',
    'poulet': 'chicken',
    'boeuf': 'beef',
    'porc': 'pork',
    'poisson': 'fish',
    'saumon': 'salmon',
    'crevette': 'shrimp',
    'crevettes': 'shrimp',
    'oeuf': 'egg',
    'oeufs': 'egg',
    'lait': 'milk',
    'fromage': 'cheese',
    'beurre': 'butter',
    'pomme de terre': 'potato',
    'pommes de terre': 'potato',
    'carotte': 'carrot',
    'carottes': 'carrot',
    'oignon': 'onion',
    'oignons': 'onion',
    'ail': 'garlic',
    'poivron': 'pepper',
    'riz': 'rice',
    'pâtes': 'pasta',
    'pain': 'bread',
    'chocolat': 'chocolate',
    'banane': 'banana',
    'pomme': 'apple',
    'orange': 'orange',
    'citron': 'lemon',
    'fraise': 'strawberry',
    'fraises': 'strawberry'
  }
  
  const lower = ingredient.toLowerCase().trim()
  return translations[lower] || ingredient
}
