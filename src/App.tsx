import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AddItem from './pages/AddItem'
import ItemDetail from './pages/ItemDetail'
import Settings from './pages/Settings'
import Scan from './pages/Scan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="*" element={<div style={{ padding: 12 }}>Not Found</div>} />
      </Routes>
    </BrowserRouter>
  )
}
