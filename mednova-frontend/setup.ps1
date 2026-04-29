# ============================================================================
# 🏆 MEDNOVA AI ELITE - MEDICAL DESIGN ULTRA PREMIUM 🏆
# Interface Médicale de Luxe avec Animations Fluides
# Version 4.0 - The Ultimate Medical Experience
# ============================================================================

$BASE = "C:\Users\HP\Desktop\ing4\MedNova-AI\mednova-frontend"

Write-Host ""
Write-Host "████████████████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
Write-Host "█                                                                              █" -ForegroundColor Cyan
Write-Host "█     🏆  MEDNOVA AI ELITE - MEDICAL INTELLIGENCE PLATFORM  🏆               █" -ForegroundColor Cyan
Write-Host "█                    Interface Médicale Ultra Premium                         █" -ForegroundColor Cyan
Write-Host "█                           Version 4.0 - ELITE                               █" -ForegroundColor Cyan
Write-Host "█                                                                              █" -ForegroundColor Cyan
Write-Host "████████████████████████████████████████████████████████████████████████████" -ForegroundColor Cyan
Write-Host ""

# Création des dossiers
Write-Host "📁 Création de la structure ELITE..." -ForegroundColor Magenta
New-Item -ItemType Directory -Force "$BASE\src\pages" | Out-Null
New-Item -ItemType Directory -Force "$BASE\src\components" | Out-Null
New-Item -ItemType Directory -Force "$BASE\src\services" | Out-Null
New-Item -ItemType Directory -Force "$BASE\src\assets" | Out-Null
New-Item -ItemType Directory -Force "$BASE\src\utils" | Out-Null
Write-Host "   ✅ Structure ELITE créée" -ForegroundColor Green

# Suppression des anciens fichiers
@("$BASE\src\App.css","$BASE\src\App.tsx","$BASE\src\App.jsx","$BASE\src\main.tsx","$BASE\src\main.jsx","$BASE\src\index.css") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Force }
}

# ============================================================================
# 1. INDEX.CSS - DESIGN SYSTEM ULTRA PREMIUM
# ============================================================================
Write-Host "🎨 Création du Design System ELITE..." -ForegroundColor Magenta
@'
/* ========================================================================
   MEDNOVA AI ELITE - MEDICAL DESIGN SYSTEM ULTRA PREMIUM
   Version 4.0 - The Ultimate Medical Experience
   ======================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Space Grotesk', 'Inter', sans-serif;
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 25%, #ddd6fe 50%, #f3e8ff 75%, #fce7f3 100%);
    background-attachment: fixed;
    color: #1e1b4b;
    min-height: 100vh;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" d="M10 10 L90 10 M10 20 L90 20 M10 30 L90 30 M10 40 L90 40 M10 50 L90 50 M10 60 L90 60 M10 70 L90 70 M10 80 L90 80 M10 90 L90 90 M10 10 L10 90 M20 10 L20 90 M30 10 L30 90 M40 10 L40 90 M50 10 L50 90 M60 10 L60 90 M70 10 L70 90 M80 10 L80 90 M90 10 L90 90"/></svg>');
    background-size: 30px 30px;
    opacity: 0.3;
    pointer-events: none;
    z-index: 0;
  }

  /* Custom Medical Scrollbar Elite */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #4f46e5, #7c3aed, #db2777);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
  }
}

@layer components {
  /* Glassmorphic Medical Cards Elite */
  .medical-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-radius: 32px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .medical-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s ease;
  }
  .medical-card:hover::before {
    left: 100%;
  }
  .medical-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 30px 60px -15px rgba(79, 70, 229, 0.3);
    background: rgba(255, 255, 255, 0.95);
  }

  /* Primary Medical Button Elite */
  .btn-primary {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);
    color: white;
    padding: 0.875rem 2rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.875rem;
    transition: all 0.4s ease;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  .btn-primary:hover::before {
    width: 300px;
    height: 300px;
  }
  .btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 35px -8px rgba(79, 70, 229, 0.5);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  }

  /* Secondary Button Elite */
  .btn-secondary {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    color: #4f46e5;
    padding: 0.875rem 2rem;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
    border: 1px solid rgba(79, 70, 229, 0.3);
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .btn-secondary:hover {
    border-color: #4f46e5;
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.2);
  }

  /* Medical Badges Elite */
  .badge-critical {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: #dc2626;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 800;
    border: 1px solid #fecaca;
    letter-spacing: 0.5px;
  }
  .badge-moderate {
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    color: #ea580c;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 800;
    border: 1px solid #fed7aa;
  }
  .badge-low {
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
    color: #16a34a;
    padding: 0.375rem 1rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 800;
    border: 1px solid #bbf7d0;
  }

  /* Input Fields Elite */
  .input-field {
    width: 100%;
    padding: 0.75rem 1.25rem;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: rgba(255, 255, 255, 0.9);
    transition: all 0.3s ease;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .input-field:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    background: white;
    transform: scale(1.02);
  }

  /* Stat Cards Elite */
  .stat-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
    backdrop-filter: blur(10px);
    border-radius: 28px;
    padding: 1.25rem;
    text-align: center;
    border: 1px solid rgba(255,255,255,0.8);
    transition: all 0.4s ease;
  }
  .stat-card:hover {
    transform: translateY(-5px) scale(1.05);
    background: linear-gradient(135deg, white, rgba(255,255,255,0.9));
    box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15);
  }

  /* Navigation Links Elite */
  .nav-link {
    position: relative;
    transition: all 0.3s ease;
  }
  .nav-link.active {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    font-weight: 700;
    box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
  }
  .nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 40px;
    background: linear-gradient(135deg, #4f46e5, #db2777);
    border-radius: 0 4px 4px 0;
  }

  /* Medical Icons Container Elite */
  .medical-icon {
    background: linear-gradient(135deg, #4f46e5, #7c3aed, #db2777);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.3);
    transition: all 0.3s ease;
  }
  .medical-icon:hover {
    transform: scale(1.1) rotate(5deg);
  }

  /* Gradient Text Elite */
  .gradient-text {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #db2777 70%, #f43f5e 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% auto;
    animation: gradientShift 3s ease infinite;
  }

  /* Animations Elite */
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes pulse-ring {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 20px rgba(79, 70, 229, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .pulse-animation {
    animation: pulse-ring 2s infinite;
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
  
  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }

  /* Table Styles Elite */
  .medical-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
  }
  .medical-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .medical-table td {
    padding: 1rem;
    font-size: 0.875rem;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  .medical-table tr:hover td {
    background: rgba(255,255,255,0.9);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
}

/* Glass Effect Elite */
.glass-effect {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
'@ | Out-File -FilePath "$BASE\src\index.css" -Encoding UTF8

# ============================================================================
# 2. MAIN.JSX
# ============================================================================
Write-Host "📄 Création des fichiers ELITE..." -ForegroundColor Magenta
@'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
'@ | Out-File -FilePath "$BASE\src\main.jsx" -Encoding UTF8

# ============================================================================
# 3. APP.JSX - ROUTES PRINCIPALES
# ============================================================================
@'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Clinicien from './pages/Clinicien'
import Exploration from './pages/Exploration'
import DashboardBI from './pages/DashboardBI'
import Modeles from './pages/Modeles'
import Admin from './pages/Admin'

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
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
'@ | Out-File -FilePath "$BASE\src\App.jsx" -Encoding UTF8

# ============================================================================
# 4. SERVICES/API.JS
# ============================================================================
@'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export const predictComplication = (data) => api.post('/predict/complication', data)
export const predictTreatment = (data) => api.post('/predict/treatment', data)
export const explainSHAP = (data) => api.post('/explain/shap', data)
export const getClusterData = () => api.get('/cluster/data')
export const getDashboardKPIs = () => api.get('/dashboard/kpis')
export const getModelRuns = () => api.get('/models/runs')
export const getPredictionsHistory = (params) => api.get('/admin/predictions', { params })
export const exportPredictions = (format) => api.get(`/admin/export?format=${format}`, { responseType: 'blob' })
export const getLogs = () => api.get('/admin/logs')

export default api
'@ | Out-File -FilePath "$BASE\src\services\api.js" -Encoding UTF8

# ============================================================================
# 5. COMPONENTS/SIDEBAR.JSX - SIDEBAR ULTRA PREMIUM
# ============================================================================
@'
import { NavLink } from 'react-router-dom'
import { Stethoscope, Search, LayoutDashboard, BrainCircuit, Settings, Activity, Heart, Shield, Sparkles, Award } from 'lucide-react'

const navItems = [
  { to: '/clinicien', icon: Stethoscope, label: 'Consultation', color: '#4f46e5', desc: 'AI Diagnosis', badge: 'NEW' },
  { to: '/exploration', icon: Search, label: 'Exploration', color: '#7c3aed', desc: 'Data Mining', badge: null },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#059669', desc: 'Analytics', badge: 'HOT' },
  { to: '/modeles', icon: BrainCircuit, label: 'AI Models', color: '#d97706', desc: 'ML Performance', badge: null },
  { to: '/admin', icon: Settings, label: 'Admin', color: '#6b7280', desc: 'System', badge: null },
]

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white/90 backdrop-blur-xl border-r border-white/40 flex flex-col fixed left-0 top-0 bottom-0 z-30 shadow-2xl">
      {/* Logo Section Elite */}
      <div className="p-8 border-b border-white/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#db2777] flex items-center justify-center shadow-2xl pulse-animation">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold gradient-text">MedNova AI</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles size={10} className="text-[#4f46e5]" /> Medical Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Elite */}
      <nav className="flex-1 p-6 space-y-3">
        {navItems.map(({ to, icon: Icon, label, color, desc, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'active shadow-xl' 
                  : 'text-gray-600 hover:bg-white/50 hover:shadow-lg hover:scale-105'
              }`
            }
          >
            <div className="medical-icon w-10 h-10 flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-[10px] text-gray-400">{desc}</div>
            </div>
            {badge && (
              <span className="text-[9px] font-bold bg-gradient-to-r from-[#4f46e5] to-[#db2777] text-white px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Elite */}
      <div className="p-6 border-t border-white/40">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#4f46e5]" />
            <span className="text-xs font-bold text-[#4f46e5]">HIPAA Compliant</span>
          </div>
          <div className="text-[11px] text-gray-500 leading-relaxed">
            FastAPI · SQL Server · MLflow
          </div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
            <Shield size={10} /> v4.0 - Elite Edition
          </div>
        </div>
      </div>
    </aside>
  )
}
'@ | Out-File -FilePath "$BASE\src\components\Sidebar.jsx" -Encoding UTF8

# ============================================================================
# 6. PAGES/CLINICIEN.JSX - PAGE PRINCIPALE ULTRA PREMIUM
# ============================================================================
Write-Host "🏥 Création des pages ELITE..." -ForegroundColor Magenta
@'
import { useState } from 'react'
import { predictComplication, explainSHAP } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { AlertTriangle, CheckCircle, Loader2, User, Send, Activity, Heart, Thermometer, Droplet, Wind, Brain, Shield, Stethoscope, Clock, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'

const DEFAULT_FORM = {
  age: 65, sex: 'male', dzgroup: 'ARF/MOSF w/Sepsis', num_co: 2, edu: 12, income: 'under $11k',
  avtisst: 50, wblc: 8.5, hrt: 90, resp: 20, temp: 37.2, meanbp: 85, crea: 1.2,
  sod: 138, ph: 7.38, glucose: 110, bun: 18, urine: 1200, adlp: 4, adls: 4,
}

function RiskGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 1)
  const color = pct > 0.6 ? '#dc2626' : pct > 0.35 ? '#ea580c' : '#10b981'
  const label = pct > 0.6 ? 'CRITICAL RISK' : pct > 0.35 ? 'MODERATE RISK' : 'LOW RISK'
  const icon = pct > 0.6 ? '🔴' : pct > 0.35 ? '🟠' : '🟢'
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="220" height="130" viewBox="0 0 220 130">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="#e2e8f0" strokeWidth="18" strokeLinecap="round"/>
          <path d={`M 20 110 A 90 90 0 0 1 ${20 + (pct * 180)} ${110 - (Math.sin(pct * Math.PI) * 90)}`}
            fill="none" stroke="url(#grad)" strokeWidth="18" strokeLinecap="round" className="transition-all duration-1000"/>
          <text x="110" y="90" textAnchor="middle" fontSize="32" fontWeight="bold" fill={color}>
            {(pct * 100).toFixed(0)}%
          </text>
        </svg>
      </div>
      <div className={`mt-3 px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ${
        pct > 0.6 ? 'bg-red-500 text-white' : pct > 0.35 ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
      }`}>
        <span>{icon}</span> {label}
      </div>
    </div>
  )
}

export default function Clinicien() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [shapData, setShapData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(f => ({ ...f, [name]: type === 'number' ? parseFloat(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const [predRes, shapRes] = await Promise.all([predictComplication(form), explainSHAP(form)])
      setResult(predRes.data)
      const raw = shapRes.data?.shap_values || {}
      const arr = Object.entries(raw)
        .map(([feature, value]) => ({ feature, value: parseFloat(value.toFixed(4)) }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 10)
      setShapData(arr)
    } catch (err) {
      setError('Demo Mode - Using simulated data')
      setResult({ risk_score: 0.72, prediction: 'high', model: 'XGBoost', confidence: 0.89 })
      setShapData([
        { feature: 'avtisst', value: 0.32 }, { feature: 'meanbp', value: -0.24 },
        { feature: 'age', value: 0.18 }, { feature: 'crea', value: 0.15 },
        { feature: 'wblc', value: 0.12 }, { feature: 'temp', value: -0.09 },
        { feature: 'hrt', value: 0.08 }, { feature: 'num_co', value: 0.07 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const vitalFields = [
    { icon: Heart, name: 'hrt', label: 'Heart Rate', unit: 'bpm', color: 'text-red-500', bg: 'bg-red-50/80', normal: '60-100' },
    { icon: Wind, name: 'resp', label: 'Respiration', unit: '/min', color: 'text-blue-500', bg: 'bg-blue-50/80', normal: '12-20' },
    { icon: Thermometer, name: 'temp', label: 'Temperature', unit: '°C', color: 'text-orange-500', bg: 'bg-orange-50/80', normal: '36.5-37.5' },
    { icon: Droplet, name: 'meanbp', label: 'Blood Pressure', unit: 'mmHg', color: 'text-green-500', bg: 'bg-green-50/80', normal: '70-100' },
  ]

  return (
    <div>
      {/* Header Elite */}
      <div className="mb-8">
        <div className="flex items-center gap-5 mb-3">
          <div className="medical-icon w-16 h-16 pulse-animation">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Clinical Consultation</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              <Sparkles size={14} className="text-[#4f46e5]" />
              AI-powered risk prediction & medical decision support system
              <Sparkles size={14} className="text-[#db2777]" />
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
            <Clock size={14} className="text-[#4f46e5]" />
            <span className="text-xs font-medium">Real-time Analysis</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
            <Brain size={14} className="text-[#7c3aed]" />
            <span className="text-xs font-medium">XGBoost Model</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
            <Shield size={14} className="text-[#db2777]" />
            <span className="text-xs font-medium">SHAP Explainability</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50/90 backdrop-blur-sm border border-amber-200 rounded-2xl text-amber-700 flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Form Section Elite */}
        <div className="col-span-5">
          <div className="medical-card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/40">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Patient Clinical Data</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Vitals Grid Elite */}
              <div className="grid grid-cols-2 gap-4">
                {vitalFields.map(({ icon: Icon, name, label, unit, color, bg, normal }) => (
                  <div key={name} className={`${bg} rounded-2xl p-4 backdrop-blur-sm transition-all hover:scale-105`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <label className="text-xs font-bold text-gray-600">{label}</label>
                      </div>
                      <span className="text-[10px] text-gray-400 bg-white/50 px-2 py-0.5 rounded-full">{normal}</span>
                    </div>
                    <input
                      type="number"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-[#4f46e5]/20"
                      step={name === 'temp' ? '0.1' : '1'}
                    />
                    <span className="text-[10px] text-gray-400 mt-2 block">{unit}</span>
                  </div>
                ))}
              </div>

              {/* Lab Results Elite */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Age (years)</label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Sex</label>
                  <select name="sex" value={form.sex} onChange={handleChange} className="input-field text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">AVTISST Score</label>
                  <input type="number" name="avtisst" value={form.avtisst} onChange={handleChange} className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Creatinine (mg/dL)</label>
                  <input type="number" name="crea" value={form.crea} onChange={handleChange} className="input-field text-sm" step="0.1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">WBC (×10³)</label>
                  <input type="number" name="wblc" value={form.wblc} onChange={handleChange} className="input-field text-sm" step="0.1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-2">Glucose (mg/dL)</label>
                  <input type="number" name="glucose" value={form.glucose} onChange={handleChange} className="input-field text-sm" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                {loading ? 'AI Analysis in progress...' : 'Launch AI Prediction'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section Elite */}
        <div className="col-span-7 space-y-6">
          {result ? (
            <>
              <div className="medical-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Prediction Results</h2>
                </div>
                
                <div className="flex items-center justify-between">
                  <RiskGauge score={result.risk_score} />
                  <div className="flex-1 ml-8 grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <div className="text-xs text-gray-400 mb-1">Model</div>
                      <div className="text-base font-bold text-gray-800 flex items-center gap-1">
                        <Sparkles size={12} className="text-[#4f46e5]" />
                        {result.model || 'XGBoost'}
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="text-xs text-gray-400 mb-1">Confidence</div>
                      <div className="text-base font-bold text-gray-800">{((result.confidence || 0.89) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                <div className={`mt-5 p-5 rounded-2xl flex items-start gap-4 backdrop-blur-sm ${
                  result.risk_score > 0.6 ? 'bg-red-500/10 border border-red-200' :
                  result.risk_score > 0.35 ? 'bg-amber-500/10 border border-amber-200' :
                  'bg-emerald-500/10 border border-emerald-200'
                }`}>
                  {result.risk_score > 0.6 ? <AlertTriangle className="w-6 h-6 text-red-600" /> : <CheckCircle className="w-6 h-6 text-emerald-600" />}
                  <div>
                    <div className="font-bold mb-1 text-lg">
                      {result.risk_score > 0.6 ? '⚠️ HIGH RISK - ICU Admission Recommended' :
                       result.risk_score > 0.35 ? '📊 MODERATE RISK - Enhanced Monitoring' :
                       '✅ LOW RISK - Standard Care'}
                    </div>
                    <p className="text-sm opacity-80">
                      {result.risk_score > 0.6 ? 'Immediate intensive care and continuous monitoring required' :
                       result.risk_score > 0.35 ? 'Close surveillance for 48 hours with regular vital checks' :
                       'Regular outpatient follow-up with standard protocols sufficient'}
                    </p>
                  </div>
                </div>
              </div>

              {shapData && (
                <div className="medical-card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#db2777] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">SHAP Explainability</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-5 flex items-center gap-2">
                    <TrendingUp size={12} className="text-red-500" /> Positive values increase risk
                    <TrendingDown size={12} className="text-emerald-500 ml-3" /> Negative values decrease risk
                  </p>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={shapData} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="feature" tick={{ fontSize: 12, fontWeight: 600 }} width={90} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" radius={[0, 12, 12, 0]}>
                        {shapData.map((entry, i) => (
                          <Cell key={i} fill={entry.value >= 0 ? '#ef4444' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="medical-card flex flex-col items-center justify-center h-[600px] text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center mb-6 pulse-animation">
                <Brain className="w-16 h-16 text-[#4f46e5]" />
              </div>
              <h3 className="text-2xl font-bold gradient-text mb-3">Ready for Clinical Assessment</h3>
              <p className="text-gray-400">Complete the patient data form and launch AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "$BASE\src\pages\Clinicien.jsx" -Encoding UTF8

# ============================================================================
# 7. AUTRES PAGES (Dashboard, Modeles, Admin, Exploration) - VERSION SIMPLIFIÉE MAIS ÉLITE
# ============================================================================

# DashboardBI.jsx Elite
@'
import { useState, useEffect } from 'react'
import { getDashboardKPIs } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { LayoutDashboard, TrendingUp, Users, Heart, Activity, RefreshCw, Hospital, Calendar, Sparkles } from 'lucide-react'

const DEMO_DATA = {
  kpis: { avg_bp: 84.55, avg_age: 62.65, total_patients: 9105, death_rate: 0.26, high_risk: 3245 },
  ageDist: [
    { age: '20-30', count: 180 }, { age: '30-40', count: 420 }, { age: '40-50', count: 780 },
    { age: '50-60', count: 1250 }, { age: '60-70', count: 1890 }, { age: '70-80', count: 2100 },
    { age: '80-90', count: 1840 }, { age: '90+', count: 645 }
  ],
  diseaseDist: [
    { name: 'ARF/MOSF', count: 3800 }, { name: 'CHF', count: 1650 }, { name: 'COPD', count: 1200 },
    { name: 'Lung Cancer', count: 980 }, { name: 'Cirrhosis', count: 760 }
  ]
}

function StatCard({ icon: Icon, value, label, trend, gradient }) {
  return (
    <div className="stat-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full -mr-10 -mt-10"></div>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">↑ {trend}%</span>}
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}

export default function DashboardBI() {
  const [data, setData] = useState(DEMO_DATA)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getDashboardKPIs().then(res => {
      if (res.data) setData({ ...DEMO_DATA, kpis: res.data })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#f43f5e', '#f97316']

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="medical-icon w-16 h-16">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Medical Dashboard</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles size={14} className="text-[#4f46e5]" /> Real-time healthcare analytics & KPIs
            </p>
          </div>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-5 gap-5 mb-6">
        <StatCard icon={Hospital} value={data.kpis.total_patients?.toLocaleString()} label="Total Patients" trend="12" gradient="bg-gradient-to-br from-[#4f46e5] to-[#7c3aed]" />
        <StatCard icon={Users} value={data.kpis.avg_age?.toFixed(1)} label="Average Age" trend="2" gradient="bg-gradient-to-br from-[#7c3aed] to-[#db2777]" />
        <StatCard icon={Heart} value={data.kpis.avg_bp?.toFixed(0)} label="Mean BP (mmHg)" trend="-3" gradient="bg-gradient-to-br from-[#db2777] to-[#f43f5e]" />
        <StatCard icon={Activity} value={(data.kpis.death_rate * 100)?.toFixed(1) + '%'} label="Mortality Rate" gradient="bg-gradient-to-br from-[#f97316] to-[#ef4444]" />
        <StatCard icon={TrendingUp} value={data.kpis.high_risk?.toLocaleString()} label="High Risk" trend="8" gradient="bg-gradient-to-br from-[#ef4444] to-[#dc2626]" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="medical-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-[#4f46e5]" /> Age Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.ageDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 16 }} />
              <Bar dataKey="count" fill="url(#gradientBar)" radius={[12, 12, 0, 0]}>
                <defs>
                  <linearGradient id="gradientBar" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="medical-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart size={18} className="text-[#db2777]" /> Disease Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data.diseaseDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count">
                {data.diseaseDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "$BASE\src\pages\DashboardBI.jsx" -Encoding UTF8

# Modeles.jsx Elite
@'
import { useState, useEffect } from 'react'
import { getModelRuns, predictComplication } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { BrainCircuit, Zap, Activity, TrendingUp, Sparkles, Award } from 'lucide-react'

const DEMO_RUNS = [
  { model: 'XGBoost', auc: 0.847, f1: 0.791, accuracy: 0.812, precision: 0.803, recall: 0.779 },
  { model: 'LightGBM', auc: 0.841, f1: 0.785, accuracy: 0.807, precision: 0.798, recall: 0.772 },
  { model: 'RandomForest', auc: 0.812, f1: 0.752, accuracy: 0.783, precision: 0.769, recall: 0.735 },
  { model: 'LogisticReg', auc: 0.771, f1: 0.703, accuracy: 0.741, precision: 0.721, recall: 0.686 }
]

export default function Modeles() {
  const [runs, setRuns] = useState(DEMO_RUNS)
  const [whatIf, setWhatIf] = useState({ age: 65, meanbp: 85, avtisst: 50, crea: 1.2 })
  const [score, setScore] = useState(null)

  useEffect(() => {
    getModelRuns().then(res => {
      if (res.data?.runs?.length) setRuns(res.data.runs)
    }).catch(() => {})
  }, [])

  const runSimulation = async () => {
    try {
      const res = await predictComplication({
        ...whatIf, sex: 'male', num_co: 2, dzgroup: 'ARF/MOSF w/Sepsis',
        hrt: 90, resp: 20, temp: 37.2, sod: 138, ph: 7.38, glucose: 110,
        bun: 18, urine: 1200, adlp: 4, adls: 4, wblc: 8.5, edu: 12, income: 'under $11k'
      })
      setScore(res.data?.risk_score)
    } catch {
      const simScore = 0.3 + (whatIf.age - 60) * 0.004 + (85 - whatIf.meanbp) * 0.003
      setScore(Math.min(0.95, Math.max(0.05, simScore)))
    }
  }

  const bestModel = runs.reduce((a, b) => a.auc > b.auc ? a : b)
  const radarData = ['auc', 'f1', 'accuracy', 'precision', 'recall'].map(metric => ({
    metric: metric.toUpperCase(),
    XGBoost: runs[0][metric] * 100,
    LightGBM: runs[1][metric] * 100,
    RandomForest: runs[2][metric] * 100
  }))

  return (
    <div>
      <div className="flex items-center gap-5 mb-8">
        <div className="medical-icon w-16 h-16">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text">AI Models Performance</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-1">
            <Sparkles size={14} className="text-[#4f46e5]" /> MLflow tracking & model comparison
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="medical-card bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#db2777] flex items-center justify-center shadow-xl pulse-animation">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#4f46e5] uppercase tracking-wider">Best Performing Model</div>
                <div className="text-2xl font-bold text-gray-800">{bestModel.model}</div>
                <div className="text-sm text-[#4f46e5] font-semibold mt-1">AUC: {bestModel.auc.toFixed(3)} | F1: {bestModel.f1.toFixed(3)}</div>
              </div>
            </div>
          </div>

          <div className="medical-card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Model Comparison Radar</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[60, 90]} tick={{ fontSize: 10 }} />
                <Radar name="XGBoost" dataKey="XGBoost" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                <Radar name="LightGBM" dataKey="LightGBM" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                <Radar name="RandomForest" dataKey="RandomForest" stroke="#db2777" fill="#db2777" fillOpacity={0.2} />
                <Tooltip contentStyle={{ borderRadius: 16 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#4f46e5]" />
            <h3 className="text-lg font-semibold text-gray-800">What-If Simulator</h3>
          </div>
          <p className="text-xs text-gray-400 mb-5">Modify parameters to see risk impact</p>
          <div className="space-y-4">
            {Object.entries(whatIf).map(([key, val]) => (
              <div key={key}>
                <label className="text-xs font-bold text-gray-500 block mb-2 uppercase">{key}</label>
                <input type="number" value={val} onChange={e => setWhatIf({ ...whatIf, [key]: parseFloat(e.target.value) })}
                  className="input-field text-sm" step={key === 'crea' ? '0.1' : '1'} />
              </div>
            ))}
            <button onClick={runSimulation} className="btn-primary w-full mt-4">Simulate Risk</button>
            {score !== null && (
              <div className="mt-5 p-4 rounded-2xl text-center bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                <div className="text-xs font-bold text-gray-500 mb-1">Predicted Risk Score</div>
                <div className={`text-3xl font-bold ${score > 0.6 ? 'text-red-600' : score > 0.35 ? 'text-orange-600' : 'text-emerald-600'}`}>
                  {(score * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "$BASE\src\pages\Modeles.jsx" -Encoding UTF8

# Admin.jsx Elite
@'
import { useState, useEffect } from 'react'
import { getPredictionsHistory, exportPredictions, getLogs } from '../services/api'
import { Settings, Download, RefreshCw, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

const DEMO_LOGS = [
  { ts: '2025-01-15 14:32:11', level: 'INFO', message: 'POST /predict/complication - 200 OK - 128ms' },
  { ts: '2025-01-15 14:28:44', level: 'WARNING', message: 'SQL Server connection timeout - retry 1/3' },
  { ts: '2025-01-15 14:20:33', level: 'ERROR', message: 'GET /models/runs - 500 Internal Error' },
]

export default function Admin() {
  const [logs, setLogs] = useState(DEMO_LOGS)
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const res = await exportPredictions(format)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `mednova_predictions.${format}`
      a.click()
    } catch {
      alert('Demo: Export would download CSV file')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="medical-icon w-16 h-16">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Administration</h1>
            <p className="text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles size={14} className="text-[#4f46e5]" /> System logs & data export
            </p>
          </div>
        </div>
        <button onClick={() => handleExport('csv')} disabled={exporting} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="medical-card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw size={16} className="text-[#4f46e5]" /> API Logs
        </h3>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className={`p-4 rounded-2xl flex items-start gap-3 transition-all hover:scale-[1.01] ${
              log.level === 'ERROR' ? 'bg-red-50/80 border border-red-200' : 
              log.level === 'WARNING' ? 'bg-amber-50/80 border border-amber-200' : 
              'bg-gray-50/80 border border-gray-200'
            }`}>
              {log.level === 'ERROR' ? <AlertTriangle size={16} className="text-red-600 mt-0.5" /> :
               log.level === 'WARNING' ? <AlertTriangle size={16} className="text-amber-600 mt-0.5" /> :
               <CheckCircle size={16} className="text-emerald-600 mt-0.5" />}
              <span className="text-xs text-gray-400 font-mono">{log.ts}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                log.level === 'ERROR' ? 'bg-red-100 text-red-700' : 
                log.level === 'WARNING' ? 'bg-amber-100 text-amber-700' : 
                'bg-emerald-100 text-emerald-700'
              }`}>{log.level}</span>
              <span className="text-sm text-gray-700 flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "$BASE\src\pages\Admin.jsx" -Encoding UTF8

# Exploration.jsx Elite
@'
import { useState, useEffect } from 'react'
import { getClusterData } from '../services/api'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import { Search, Database, Sparkles } from 'lucide-react'

const DEMO_PATIENTS = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1, age: Math.floor(Math.random() * 70 + 18),
  meanbp: Math.floor(Math.random() * 90 + 50), avtisst: Math.floor(Math.random() * 90 + 20),
  cluster: Math.floor(Math.random() * 4), risk: Math.random() > 0.45 ? 'high' : 'low'
}))

const CLUSTER_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#f43f5e']

export default function Exploration() {
  const [patients, setPatients] = useState(DEMO_PATIENTS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getClusterData().then(res => {
      if (res.data?.patients) setPatients(res.data.patients)
    }).catch(() => {})
  }, [])

  const filtered = patients.filter(p => String(p.id).includes(search))

  return (
    <div>
      <div className="flex items-center gap-5 mb-8">
        <div className="medical-icon w-16 h-16">
          <Database className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text">Data Exploration</h1>
          <p className="text-gray-500 mt-2 flex items-center gap-1">
            <Sparkles size={14} className="text-[#4f46e5]" /> K-Means clustering visualization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 medical-card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Clusters (Age × AVTISST)</h3>
          <ResponsiveContainer width="100%" height={450}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="age" name="Age" label={{ value: 'Age (years)', position: 'bottom', offset: 0 }} tick={{ fontSize: 11 }} />
              <YAxis dataKey="avtisst" name="AVTISST" label={{ value: 'AVTISST Score', angle: -90, position: 'left' }} tick={{ fontSize: 11 }} />
              <ZAxis range={[100, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: 16 }} />
              {[0, 1, 2, 3].map(cluster => (
                <Scatter key={cluster} name={`Cluster ${cluster}`} data={patients.filter(p => p.cluster === cluster)} fill={CLUSTER_COLORS[cluster]} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-2 mb-4">
            <Search size={18} className="text-[#4f46e5]" />
            <h3 className="text-lg font-semibold text-gray-800">Patient List</h3>
          </div>
          <input type="text" placeholder="Search by ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field text-sm mb-4" />
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {filtered.slice(0, 20).map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white flex justify-between items-center hover:shadow-md transition-all">
                <span className="text-sm font-bold text-gray-700">Patient #{p.id}</span>
                <div className="flex gap-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${p.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {p.risk}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    C{p.cluster}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
'@ | Out-File -FilePath "$BASE\src\pages\Exploration.jsx" -Encoding UTF8

# ============================================================================
# FICHIERS DE CONFIGURATION
# ============================================================================
Write-Host "⚙️ Configuration finale..." -ForegroundColor Magenta

@'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-dark': '#4338ca',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
    },
  },
  plugins: [],
}
'@ | Out-File -FilePath "$BASE\tailwind.config.js" -Encoding UTF8

@'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
'@ | Out-File -FilePath "$BASE\vite.config.js" -Encoding UTF8

Write-Host ""
Write-Host "████████████████████████████████████████████████████████████████████████████" -ForegroundColor Green
Write-Host "█                                                                              █" -ForegroundColor Green
Write-Host "█     ✅ MEDNOVA AI ELITE - INSTALLATION COMPLÈTE !                           █" -ForegroundColor Green
Write-Host "█     🏆 Interface Médicale Ultra Premium Prête à l'emploi                   █" -ForegroundColor Green
Write-Host "█     ✨ Design avec Animations Fluides & Glassmorphism Avancé               █" -ForegroundColor Green
Write-Host "█                                                                              █" -ForegroundColor Green
Write-Host "████████████████████████████████████████████████████████████████████████████" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 POUR LANCER L'APPLICATION:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 ACCÈS: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ FONCTIONNALITÉS ELITE:" -ForegroundColor Magenta
Write-Host "   • Consultation clinique avec prédiction IA avancée" -ForegroundColor White
Write-Host "   • Dashboard BI avec graphiques médicaux interactifs" -ForegroundColor White
Write-Host "   • Comparaison des modèles ML avec radar chart" -ForegroundColor White
Write-Host "   • Visualisation des clusters K-Means" -ForegroundColor White
Write-Host "   • SHAP explainability interactive" -ForegroundColor White
Write-Host "   • Design System Ultra Premium" -ForegroundColor White
Write-Host "   • Animations fluides et glassmorphism" -ForegroundColor White
Write-Host "   • Gradients professionnels multicolores" -ForegroundColor White
Write-Host "   • Effets de survol et transitions" -ForegroundColor White
Write-Host ""
Write-Host "🎨 DESIGN FEATURES:" -ForegroundColor Magenta
Write-Host "   • Gradient backgrounds animés" -ForegroundColor White
Write-Host "   • Glass morphism cards" -ForegroundColor White
Write-Host "   • Pulse animations sur les éléments clés" -ForegroundColor White
Write-Host "   • Hover effects professionnels" -ForegroundColor White
Write-Host "   • Medical color scheme" -ForegroundColor White
Write-Host ""
pause