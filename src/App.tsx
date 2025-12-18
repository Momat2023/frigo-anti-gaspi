import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import Settings from './pages/Settings'
import Scan from './pages/Scan'
import Onboarding from './pages/Onboarding'
import StatsPage from './pages/Stats'
import Recipes from './pages/Recipes'
import AdminStats from './pages/AdminStats'
import InstallPrompt from './ui/InstallPrompt'

export default function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="*" element={<div style={{ padding: 12 }}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}
