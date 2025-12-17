import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import { 
  searchByMultipleIngredients, 
  getRandomRecipes, 
  translateToEnglish,
  extractIngredients,
  type Recipe 
} from '../services/recipes'

export default function Recipes() {
  const location = useLocation()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [location])

  async function loadRecipes() {
    setLoading(true)
    const state = location.state as any
    
    if (state?.ingredients && state.ingredients.length > 0) {
      // Recherche basée sur les ingrédients urgents
      const translated = state.ingredients.map((ing: string) => translateToEnglish(ing))
      const results = await searchByMultipleIngredients(translated)
      setRecipes(results)
    } else {
      // Recettes aléatoires par défaut
      const results = await getRandomRecipes(6)
      setRecipes(results)
    }
    
    setLoading(false)
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setLoading(true)
    const translated = translateToEnglish(searchQuery)
    const results = await searchByMultipleIngredients([translated])
    setRecipes(results)
    setLoading(false)
  }

  if (selectedRecipe) {
    const ingredients = extractIngredients(selectedRecipe)
    
    return (
      <>
        <Header />
        <main style={{ padding: 12, maxWidth: 800, margin: '0 auto' }}>
          <button
            onClick={() => setSelectedRecipe(null)}
            style={{
              marginBottom: 16,
              padding: '8px 16px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            ← Retour
          </button>

          <h1 style={{ marginBottom: 16 }}>{selectedRecipe.strMeal}</h1>

          <img 
            src={selectedRecipe.strMealThumb} 
            alt={selectedRecipe.strMeal}
            style={{
              width: '100%',
              maxWidth: 500,
              height: 'auto',
              borderRadius: 12,
              marginBottom: 16
            }}
          />

          <div style={{ 
            display: 'flex', 
            gap: 12, 
            marginBottom: 24,
            fontSize: 14,
            color: '#6b7280'
          }}>
            <span>🍽️ {selectedRecipe.strCategory}</span>
            <span>🌍 {selectedRecipe.strArea}</span>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>📝 Ingrédients</h2>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              display: 'grid',
              gap: 8
            }}>
              {ingredients.map((ing, i) => (
                <li 
                  key={i}
                  style={{
                    padding: 12,
                    backgroundColor: '#f9fafb',
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{ing.name}</span>
                  <span style={{ color: '#6b7280' }}>{ing.measure}</span>
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>👨‍🍳 Instructions</h2>
            <div style={{ 
              padding: 16,
              backgroundColor: '#f9fafb',
              borderRadius: 12,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}>
              {selectedRecipe.strInstructions}
            </div>
          </section>

          {selectedRecipe.strYoutube && (
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>🎥 Vidéo</h2>
              <a 
                href={selectedRecipe.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                ▶️ Voir sur YouTube
              </a>
            </section>
          )}

          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✅ Retour à l'accueil
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main style={{ padding: 12, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 16 }}>🍳 Suggestions de Recettes</h1>

        <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par ingrédient (ex: poulet, tomate...)"
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 16
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🔍 Chercher
            </button>
          </div>
        </form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p>Recherche de recettes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <p>Aucune recette trouvée</p>
            <button
              onClick={() => loadRecipes()}
              style={{
                marginTop: 16,
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Voir des suggestions aléatoires
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16
          }}>
            {recipes.map(recipe => (
              <div
                key={recipe.idMeal}
                onClick={() => setSelectedRecipe(recipe)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={recipe.strMealThumb} 
                  alt={recipe.strMeal}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: 16 }}>
                  <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    marginBottom: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {recipe.strMeal}
                  </h3>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>
                    {recipe.strCategory} • {recipe.strArea}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
