import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = mode === 'signup' 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) alert(error.message)
    else navigate('/')
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>{mode === 'login' ? '🔑 Connexion' : '📝 Inscription'}</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd' }} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd' }} />
          <button type="submit" disabled={loading} style={{ padding: 14, backgroundColor: '#10b981', color: 'white', borderRadius: 8, fontWeight: 700 }}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginTop: 16, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
          {mode === 'login' ? "Créer un compte" : "Déjà un compte ?"}
        </button>
      </main>
    </>
  )
}
