import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { LayoutDashboard, Heart, Users, TrendingUp, AlertTriangle, RefreshCw, Sparkles, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const DEMO_DATA = {
  kpis: { avg_bp: 84.55, avg_age: 62.65, total_patients: 9105, death_rate: 0.26, high_risk: 3245 },
  ageDist: [{ age: '60-70', count: 1890 }, { age: '70-80', count: 2100 }, { age: '80-90', count: 1840 }, { age: '50-60', count: 1560 }, { age: '40-50', count: 980 }],
  diseaseDist: [{ name: 'ARF/MOSF', count: 3800 }, { name: 'CHF', count: 1650 }, { name: 'COPD', count: 1200 }, { name: 'Lung Cancer', count: 890 }, { name: 'Cirrhosis', count: 765 }],
  trendData: [{ month: 'Jan', patients: 720 }, { month: 'Feb', patients: 780 }, { month: 'Mar', patients: 830 }, { month: 'Apr', patients: 890 }, { month: 'May', patients: 910 }, { month: 'Jun', patients: 945 }]
};

function StatCard({ icon: Icon, value, label, trend, trendUp, color }) {
  return (
    <div className="group bg-amber-50/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/60 hover:border-amber-400/70 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-amber-50" />
      </div>
      <div className="text-2xl font-bold text-stone-700">{value}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {trend} vs last month
        </div>
      )}
    </div>
  );
}

export default function DashboardBI() {
  const [data, setData] = useState(DEMO_DATA);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const COLORS = ['#f59e0b', '#f97316', '#ec4899', '#14b8a6', '#d97706'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-2xl">
                  <LayoutDashboard className="w-8 h-8 text-amber-50" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">Medical Dashboard</h1>
                <p className="text-stone-500 flex items-center gap-2 mt-1">
                  <Sparkles size={14} className="text-rose-500" /> Real-time healthcare analytics & KPIs
                </p>
              </div>
            </div>
            <button onClick={handleRefresh} className="px-4 py-2 bg-amber-100/60 rounded-xl border border-amber-300/60 text-stone-600 hover:text-stone-800 hover:border-amber-400 transition-all flex items-center gap-2">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-5 gap-5 mb-8">
          <StatCard icon={Heart} value={data.kpis.avg_bp?.toFixed(0)} label="Avg BP (mmHg)" trend="+2.3%" trendUp={false} color="from-rose-500 to-pink-500" />
          <StatCard icon={Users} value={data.kpis.avg_age?.toFixed(1)} label="Avg Age" trend="+0.5 yrs" trendUp={true} color="from-amber-500 to-orange-500" />
          <StatCard icon={Activity} value={data.kpis.total_patients?.toLocaleString()} label="Total Patients" trend="+12%" trendUp={true} color="from-emerald-500 to-teal-500" />
          <StatCard icon={AlertTriangle} value={((data.kpis.death_rate || 0) * 100).toFixed(1) + '%'} label="Mortality Rate" trend="-0.8%" trendUp={false} color="from-orange-500 to-red-500" />
          <StatCard icon={TrendingUp} value={data.kpis.high_risk?.toLocaleString()} label="High Risk Patients" trend="+5%" trendUp={true} color="from-rose-500 to-pink-500" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl p-6 border border-amber-200/60 hover:border-amber-400/40 transition-all">
            <h3 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-amber-600" /> Age Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ageDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="age" stroke="#78350f" />
                <YAxis stroke="#78350f" />
                <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.ageDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl p-6 border border-amber-200/60 hover:border-emerald-400/40 transition-all">
            <h3 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" /> Disease Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.diseaseDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count" label>
                  {data.diseaseDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: 'none', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ color: '#78350f' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-amber-50/70 backdrop-blur-sm rounded-3xl p-6 border border-amber-200/60 hover:border-cyan-400/40 transition-all">
            <h3 className="text-lg font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-600" /> Patient Trend (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#78350f" />
                <YAxis stroke="#78350f" />
                <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: 'none', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="patients" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}