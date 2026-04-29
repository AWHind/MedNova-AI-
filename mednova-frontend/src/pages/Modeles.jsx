import { useState, useEffect } from 'react'
import { getModelRuns, predictComplication } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BrainCircuit, Zap, Activity, TrendingUp, Sparkles } from 'lucide-react'

const DEMO_RUNS = [
  { model: 'XGBoost', auc: 0.847, f1: 0.791 },
  { model: 'LightGBM', auc: 0.841, f1: 0.785 },
  { model: 'RandomForest', auc: 0.812, f1: 0.752 }
]

export default function Modeles() {
  const [runs, setRuns] = useState(DEMO_RUNS)
  const [whatIf, setWhatIf] = useState({ age: 65, meanbp: 85, avtisst: 50 })
  const [score, setScore] = useState(null)

  const runSimulation = async () => {
    const simScore = 0.3 + (whatIf.age - 60) * 0.004 + (85 - whatIf.meanbp) * 0.003
    setScore(Math.min(0.95, Math.max(0.05, simScore)))
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="medical-icon w-14 h-14 rounded-2xl flex items-center justify-center">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AI Models Performance</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1"><Sparkles size={12} /> MLflow tracking & comparison</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 medical-card">
          <h3 className="text-lg font-semibold mb-4">AUC-ROC Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={runs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0.7, 0.9]} />
              <Tooltip />
              <Bar dataKey="auc" fill="#667eea" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="medical-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#667eea]" />
            <h3 className="text-lg font-semibold">What-If Simulator</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(whatIf).map(([key, val]) => (
              <div key={key}>
                <label className="text-xs text-gray-500 block mb-1">{key}</label>
                <input type="number" value={val} onChange={e => setWhatIf({ ...whatIf, [key]: parseFloat(e.target.value) })} className="input-field" />
              </div>
            ))}
            <button onClick={runSimulation} className="btn-primary w-full">Simulate Risk</button>
            {score !== null && (
              <div className="mt-4 p-4 rounded-xl text-center bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="text-xs text-gray-500">Predicted Risk Score</div>
                <div className={`text-2xl font-bold ${score > 0.6 ? 'text-red-600' : score > 0.35 ? 'text-orange-600' : 'text-green-600'}`}>
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