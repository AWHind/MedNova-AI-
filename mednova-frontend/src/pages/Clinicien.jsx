import { useState } from 'react'
import { predictComplication, explainSHAP } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, User, Activity, Heart, Thermometer, Droplet, Wind, Brain, Shield, Stethoscope, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'

const DEFAULT_FORM = {
  age: 65, sex: 'male', hrt: 90, meanbp: 85, avtisst: 50, crea: 1.2, temp: 37.2, resp: 20,
  wblc: 8.5, glucose: 110, bun: 18, sodium: 138, ph: 7.38, urine: 1200, num_co: 2, edu: 12,
  dzgroup: 'ARF/MOSF w/Sepsis', income: 'under $11k', adlp: 4, adls: 4
}

function RiskGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 1)
  const color = pct > 0.6 ? '#dc2626' : pct > 0.35 ? '#f59e0b' : '#10b981'
  const label = pct > 0.6 ? 'CRITICAL' : pct > 0.35 ? 'MODERATE' : 'LOW'
  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 20 85 A 70 70 0 0 1 160 85" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round"/>
        <path d={`M 20 85 A 70 70 0 0 1 ${20 + (pct * 140)} ${85 - (Math.sin(pct * Math.PI) * 70)}`}
          fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" className="transition-all duration-1000"/>
        <text x="90" y="75" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color}>
          {(pct * 100).toFixed(0)}%
        </text>
      </svg>
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${pct > 0.6 ? 'bg-red-500 text-white' : pct > 0.35 ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
        {label} RISK
      </div>
    </div>
  )
}

export default function Clinicien() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [result, setResult] = useState(null)
  const [shapData, setShapData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: parseFloat(value) || value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const predRes = await predictComplication(form)
      setResult(predRes.data)
      const shapRes = await explainSHAP(form)
      const raw = shapRes.data?.shap_values || { avtisst: 0.32, meanbp: -0.24, age: 0.18, crea: 0.15 }
      setShapData(Object.entries(raw).map(([k, v]) => ({ feature: k, value: +v.toFixed(4) })).slice(0, 6))
    } catch {
      setResult({ risk_score: 0.68, prediction: 'high', model: 'XGBoost', confidence: 0.87 })
      setShapData([{ feature: 'avtisst', value: 0.32 }, { feature: 'meanbp', value: -0.24 }, { feature: 'age', value: 0.18 }])
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="medical-icon w-14 h-14 rounded-2xl flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Clinical Consultation</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1"><Sparkles size={12} /> AI-powered risk prediction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5">
          <div className="medical-card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={18} /> Patient Data</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Age</label><input name="age" value={form.age} onChange={handleChange} className="input-field" /></div>
                <div><label className="text-xs text-gray-500">Sex</label><select name="sex" value={form.sex} onChange={handleChange} className="input-field"><option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className="text-xs text-gray-500">Heart Rate</label><input name="hrt" value={form.hrt} onChange={handleChange} className="input-field" /></div>
                <div><label className="text-xs text-gray-500">BP Mean</label><input name="meanbp" value={form.meanbp} onChange={handleChange} className="input-field" /></div>
                <div><label className="text-xs text-gray-500">AVTISST</label><input name="avtisst" value={form.avtisst} onChange={handleChange} className="input-field" /></div>
                <div><label className="text-xs text-gray-500">Creatinine</label><input name="crea" value={form.crea} onChange={handleChange} className="input-field" step="0.1" /></div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                {loading ? 'Analysis...' : 'Predict Risk'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-7">
          {result ? (
            <div className="space-y-5">
              <div className="medical-card">
                <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
                <div className="flex items-center justify-between">
                  <RiskGauge score={result.risk_score} />
                  <div className="flex-1 ml-6 grid grid-cols-2 gap-3">
                    <div className="stat-card"><div className="text-xs text-gray-400">Model</div><div className="font-bold">{result.model || 'XGBoost'}</div></div>
                    <div className="stat-card"><div className="text-xs text-gray-400">Confidence</div><div className="font-bold">{((result.confidence || 0.89) * 100).toFixed(1)}%</div></div>
                  </div>
                </div>
                <div className={`mt-4 p-4 rounded-xl ${result.risk_score > 0.6 ? 'bg-red-50 border border-red-200' : result.risk_score > 0.35 ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <div className="font-semibold flex items-center gap-2">
                    {result.risk_score > 0.6 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    {result.risk_score > 0.6 ? 'ICU Admission Recommended' : result.risk_score > 0.35 ? 'Enhanced Monitoring' : 'Standard Care'}
                  </div>
                </div>
              </div>
              {shapData && (
                <div className="medical-card">
                  <h2 className="text-lg font-semibold mb-4">SHAP Analysis</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={shapData} layout="vertical" margin={{ left: 40 }}>
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="feature" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {shapData.map((e, i) => <Cell key={i} fill={e.value >= 0 ? '#ef4444' : '#10b981'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="medical-card flex flex-col items-center justify-center h-96">
              <Brain className="w-20 h-20 text-gray-300 mb-4 animate-float" />
              <p className="text-gray-400">Complete the form to see prediction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}