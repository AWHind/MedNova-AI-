import { useState, useEffect } from 'react'
import { getDashboardKPIs } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { LayoutDashboard, Heart, Users, TrendingUp, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react'

const DEMO_DATA = {
  kpis: { avg_bp: 84.55, avg_age: 62.65, total_patients: 9105, death_rate: 0.26, high_risk: 3245 },
  ageDist: [{ age: '60-70', count: 1890 }, { age: '70-80', count: 2100 }, { age: '80-90', count: 1840 }],
  diseaseDist: [{ name: 'ARF/MOSF', count: 3800 }, { name: 'CHF', count: 1650 }, { name: 'COPD', count: 1200 }]
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}

export default function DashboardBI() {
  const [data, setData] = useState(DEMO_DATA)

  useEffect(() => {
    getDashboardKPIs().then(res => {
      if (res.data) setData({ ...DEMO_DATA, kpis: res.data })
    }).catch(() => {})
  }, [])

  const COLORS = ['#667eea', '#764ba2', '#f093fb']

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="medical-icon w-14 h-14 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Medical Dashboard</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1"><Sparkles size={12} /> Real-time healthcare analytics</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard icon={Heart} value={data.kpis.avg_bp?.toFixed(0)} label="Avg BP (mmHg)" color="from-red-500 to-pink-500" />
        <StatCard icon={Users} value={data.kpis.avg_age?.toFixed(1)} label="Avg Age" color="from-blue-500 to-cyan-500" />
        <StatCard icon={Users} value={data.kpis.total_patients?.toLocaleString()} label="Total Patients" color="from-gray-500 to-gray-700" />
        <StatCard icon={TrendingUp} value={((data.kpis.death_rate || 0) * 100).toFixed(1) + '%'} label="Mortality" color="from-orange-500 to-red-500" />
        <StatCard icon={AlertTriangle} value={data.kpis.high_risk?.toLocaleString()} label="High Risk" color="from-red-500 to-pink-500" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.ageDist}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="medical-card">
          <h3 className="text-lg font-semibold mb-4">Disease Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.diseaseDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="count">
                {data.diseaseDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}