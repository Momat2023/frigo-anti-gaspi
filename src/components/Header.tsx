import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  return (
    <header style={{ display: 'flex', gap: '12px', padding: '12px' }}>
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Accueil
      </Link>
      <Link to="/add" className={location.pathname === '/add' ? 'active' : ''}>
        Ajouter
      </Link>
      <Link to="/scan" className={location.pathname === '/scan' ? 'active' : ''}>
        Scan
      </Link>
      <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
        Stats
      </Link>
      <Link to="/recipes" className={location.pathname === '/recipes' ? 'active' : ''}>
        Recettes
      </Link>
      <Link to="/leaderboard" className={location.pathname === '/leaderboard' ? 'active' : ''}>
        Classement
      </Link>
      <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
        Réglages
      </Link>
    </header>
  )
}
