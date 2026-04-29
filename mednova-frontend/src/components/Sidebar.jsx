import { NavLink } from 'react-router-dom'
import { Stethoscope, Search, LayoutDashboard, BrainCircuit, Settings, Activity, Heart, Sparkles, Shield } from 'lucide-react'

const navItems = [
  { to: '/clinicien', icon: Stethoscope, label: 'Consultation', desc: 'AI Diagnosis', color: '#667eea' },
  { to: '/exploration', icon: Search, label: 'Exploration', desc: 'Data Mining', color: '#764ba2' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Analytics', color: '#10b981' },
  { to: '/modeles', icon: BrainCircuit, label: 'AI Models', desc: 'ML Performance', color: '#f59e0b' },
  { to: '/admin', icon: Settings, label: 'Admin', desc: 'System', color: '#6b7280' },
]

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white/90 backdrop-blur-xl border-r border-white/40 flex flex-col fixed left-0 top-0 bottom-0 z-30 shadow-2xl">
      {/* Logo Section Premium */}
      <div className="p-8 border-b border-white/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center shadow-2xl animate-pulse">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold gradient-text">MedNova AI</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Sparkles size={10} className="text-[#667eea]" /> Medical Intelligence Platform
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Premium */}
      <nav className="flex-1 p-6 space-y-3">
        {navItems.map(({ to, icon: Icon, label, desc, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive ? 'active shadow-xl' : 'text-gray-600 hover:bg-white/50 hover:shadow-lg hover:scale-105'
              }`
            }
          >
            <div className="medical-icon w-10 h-10 rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-[10px] text-gray-400">{desc}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Footer Premium */}
      <div className="p-6 border-t border-white/40">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-[#667eea]" />
            <span className="text-xs font-bold text-[#667eea]">HIPAA Compliant</span>
          </div>
          <div className="text-[11px] text-gray-500 leading-relaxed">FastAPI · SQL Server · MLflow</div>
          <div className="text-[10px] text-gray-400 mt-2">v4.0 - Elite Medical Edition</div>
        </div>
      </div>
    </aside>
  )
}