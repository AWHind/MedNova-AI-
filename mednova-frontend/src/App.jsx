import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Clinicien from './pages/Clinicien'
import Exploration from './pages/Exploration'
import DashboardBI from './pages/DashboardBI'
import Modeles from './pages/Modeles'
import Admin from './pages/Admin'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="max-w-7xl mx-auto animate-fadeInUp">
            <Routes>
              <Route path="/" element={<Navigate to="/clinicien" replace />} />
              <Route path="/clinicien" element={<Clinicien />} />
              <Route path="/exploration" element={<Exploration />} />
              <Route path="/dashboard" element={<DashboardBI />} />
              <Route path="/modeles" element={<Modeles />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}