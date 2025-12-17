import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header style={{ display: 'flex', gap: 12, padding: 12, overflowX: 'auto' }}>
      <Link to="/">Accueil</Link>
      <Link to="/add">Ajouter</Link>
      <Link to="/scan">Scan</Link>
      <Link to="/recipes">Recettes</Link>
      <Link to="/stats">Stats</Link>
      <Link to="/settings">Réglages</Link>
    </header>
  )
}
