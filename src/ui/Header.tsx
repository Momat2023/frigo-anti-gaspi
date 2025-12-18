import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  return (
    <header style={{
      backgroundColor: '#6366f1',
      color: 'white',
      padding: '12px 16px',
      marginBottom: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            🧊 Frigo Anti-Gaspi
          </h1>
        </Link>

        <nav style={{ display: 'flex', gap: 16 }}>
          <Link
            to="/home"
            style={{
              color: location.pathname === '/home' ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/home' ? 600 : 400,
              fontSize: 14
            }}
          >
            🏠
          </Link>
          <Link
            to="/scan"
            style={{
              color: location.pathname === '/scan' ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/scan' ? 600 : 400,
              fontSize: 14
            }}
          >
            📷 Scan
          </Link>
          <Link
            to="/add"
            style={{
              color: location.pathname === '/add' ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/add' ? 600 : 400,
              fontSize: 14
            }}
          >
            ➕
          </Link>
          <Link
            to="/stats"
            style={{
              color: location.pathname === '/stats' ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/stats' ? 600 : 400,
              fontSize: 14
            }}
          >
            📊
          </Link>
          <Link
            to="/settings"
            style={{
              color: location.pathname === '/settings' ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontWeight: location.pathname === '/settings' ? 600 : 400,
              fontSize: 14
            }}
          >
            ⚙️
          </Link>
        </nav>
      </div>
    </header>
  )
}
