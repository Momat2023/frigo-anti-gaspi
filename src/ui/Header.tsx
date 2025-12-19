import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: '🏠', title: 'Accueil' },
    { path: '/stats', label: '📊', title: 'Statistiques' },
    { path: '/leaderboard', label: '🏆', title: 'Classement' },
    { path: '/recipes', label: '🍳', title: 'Idées Recettes' },
    { path: '/settings', label: '⚙️', title: 'Paramètres' },
  ]

  return (
    <header style={{
      padding: '12px 16px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8 
      }}>
        <span style={{ fontSize: 24 }}>🧊</span>
        <span style={{ 
          fontWeight: 800, 
          fontSize: 18, 
          color: '#111',
          letterSpacing: '-0.5px'
        }}>
          FRIGO <span style={{ color: '#10b981' }}>SAFE</span>
        </span>
      </Link>

      <nav style={{ display: 'flex', gap: 4 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={item.title}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: location.pathname === item.path ? '#f3f4f6' : 'transparent',
              borderRadius: 10,
              textDecoration: 'none',
              fontSize: 18,
              transition: 'all 0.2s ease',
              border: location.pathname === item.path ? '1px solid #e5e7eb' : '1px solid transparent'
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        to="/add"
        style={{
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: 10,
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
        }}
      >
        + AJOUTER
      </Link>
    </header>
  )
}
