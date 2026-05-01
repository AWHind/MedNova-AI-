import { NavLink, useLocation } from 'react-router-dom';
import { 
  Stethoscope, Search, LayoutDashboard, BrainCircuit, 
  Settings, Heart, Sparkles, Shield, Globe, Zap, Flame, TrendingUp, FileText
} from 'lucide-react';

const navItems = [
  { to: '/clinicien', icon: Stethoscope, label: 'Consultation', desc: 'IA Diagnostic', gradient: 'from-amber-500 to-orange-500' },
  { to: '/exploration', icon: Search, label: 'Exploration', desc: 'Data Mining', gradient: 'from-cyan-500 to-teal-500' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Analytique', gradient: 'from-emerald-500 to-lime-500' },
  { to: '/modeles', icon: BrainCircuit, label: 'AI Models', desc: 'Performance ML', gradient: 'from-amber-500 to-rose-500' },
  { to: '/admin', icon: Settings, label: 'Admin', desc: 'Configuration', gradient: 'from-rose-500 to-pink-500' },
  { to: '/reports', icon: FileText, label: 'Reports', desc: 'PDF Export', gradient: 'from-orange-500 to-amber-500' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-80 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-2xl flex flex-col fixed left-0 top-0 bottom-0 z-30 backdrop-blur-sm border-r border-amber-200/40">
      
      {/* Logo Section avec animation */}
      <div className="p-8 border-b border-amber-200/30">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition duration-700 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Flame className="w-7 h-7 text-amber-50" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent tracking-tight">
              MedNova AI
            </div>
            <div className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
              <Sparkles size={10} className="text-rose-500 animate-pulse" /> 
              Medical Intelligence Elite
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-3">
        {navItems.map(({ to, icon: Icon, label, desc, gradient }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive: active }) =>
                `group relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 overflow-hidden ${
                  active 
                    ? 'shadow-xl scale-[1.02]' 
                    : 'hover:shadow-lg hover:scale-[1.01] text-stone-700'
                }`
              }
            >
              {/* Background animé */}
              <div className={`absolute inset-0 transition-all duration-500 ${
                isActive 
                  ? `bg-gradient-to-r ${gradient} opacity-100` 
                  : 'bg-gradient-to-r from-amber-100/0 via-amber-100/0 to-rose-100/0 group-hover:opacity-100 group-hover:from-amber-100/30 group-hover:to-rose-100/30'
              }`}></div>
              
              {/* Bordure gauche active */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-amber-500 to-rose-500 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
              )}
              
              {/* Icône */}
              <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 ${
                isActive 
                  ? `bg-gradient-to-br ${gradient} shadow-md` 
                  : 'bg-amber-200/40 group-hover:bg-gradient-to-br group-hover:from-amber-400/80 group-hover:to-rose-400/80'
              }`}>
                <Icon size={20} className={`transition-colors ${isActive ? 'text-amber-50' : 'text-amber-700 group-hover:text-amber-50'}`} />
              </div>
              
              <div className="relative flex-1 z-10">
                <div className={`text-sm font-bold tracking-wide ${isActive ? 'text-stone-800' : 'text-stone-700 group-hover:text-stone-800'}`}>
                  {label}
                </div>
                <div className="text-[11px] text-amber-600/70 group-hover:text-amber-700">
                  {desc}
                </div>
              </div>
              
              {isActive && (
                <div className="relative flex items-center justify-center">
                  <Zap size={14} className="text-amber-500 animate-pulse" />
                  <div className="absolute w-5 h-5 bg-amber-400 rounded-full blur-md animate-ping opacity-60"></div>
                </div>
              )}
              
              {/* Brillance au survol */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="absolute -inset-full top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-200/20 to-transparent transform skew-x-12 animate-shimmer"></div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Carte Statistiques */}
      <div className="mx-5 mb-4 p-5 rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 shadow-inner border border-amber-200/50 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">État système</span>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">Opérationnel</span>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <div className="text-center flex-1 p-2 rounded-lg bg-amber-50/60 backdrop-blur-sm">
            <div className="text-xl font-black text-stone-700">99.9%</div>
            <div className="text-[9px] font-medium text-amber-600">Disponibilité</div>
          </div>
          <div className="text-center flex-1 p-2 rounded-lg bg-amber-50/60 backdrop-blur-sm">
            <div className="text-xl font-black text-stone-700">1.2k</div>
            <div className="text-[9px] font-medium text-amber-600">Appels API</div>
          </div>
          <div className="text-center flex-1 p-2 rounded-lg bg-amber-50/60 backdrop-blur-sm">
            <div className="text-xl font-black text-stone-700">47</div>
            <div className="text-[9px] font-medium text-amber-600">Actifs</div>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-amber-200/60 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-amber-200/40 mt-auto">
        <div className="bg-gradient-to-tr from-amber-100/80 to-rose-100/80 rounded-2xl p-4 transform transition-all duration-300 hover:scale-[1.02] shadow-md group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-full bg-emerald-200/60">
              <Shield size={14} className="text-emerald-700" />
            </div>
            <span className="text-xs font-bold text-emerald-800 tracking-wide">Certifié HIPAA</span>
          </div>
          <div className="text-[11px] text-stone-600 flex flex-wrap gap-2">
            <span className="bg-amber-200/40 px-2 py-0.5 rounded-full">FastAPI</span>
            <span className="bg-amber-200/40 px-2 py-0.5 rounded-full">SQL Server</span>
            <span className="bg-amber-200/40 px-2 py-0.5 rounded-full">MLflow</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200/40">
            <div className="flex items-center gap-1 text-[10px] text-amber-700">
              <Globe size={12} /> 
              <span>v4.0 - Elite Edition</span>
            </div>
            <TrendingUp size={12} className="text-rose-600 group-hover:rotate-12 transition-transform duration-300" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(12deg); }
          100% { transform: translateX(250%) skewX(12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </aside>
  );
}