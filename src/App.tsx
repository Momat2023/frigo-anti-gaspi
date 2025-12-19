import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import Stats from './pages/Stats'
import Recipes from './pages/Recipes'
import Settings from './pages/Settings'
import Leaderboard from './pages/Leaderboard'
import Onboarding from './pages/Onboarding'
import { initNotifications } from './services/notifications'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    // Initialisation des notifications intelligentes au démarrage
    initNotifications()
    
    // Initialisation du thème
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.body.className = savedTheme
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}
