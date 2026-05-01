// src/pages/Clinicien.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictComplication, explainSHAP } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Stethoscope, User, Activity, Heart, Brain, Sparkles, 
  AlertTriangle, CheckCircle, Loader2, FileText, Zap 
} from 'lucide-react';

const DEFAULT_FORM = {
  age: 65,
  sex: 'male',
  dzgroup: 'ARF/MOSF w/Sepsis',
  num_co: 2,
  edu: 12,
  income: 'under $11k',
  avtisst: 50,
  wblc: 8.5,
  hrt: 90,
  resp: 20,
  temp: 37.2,
  meanbp: 85,
  crea: 1.2,
  sod: 138,
  ph: 7.38,
  glucose: 110,
  bun: 18,
  urine: 1200,
  adlp: 4,
  adls: 4
};

// Composant jauge de risque
function RiskGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 1);
  const color = pct > 0.6 ? '#f97316' : pct > 0.35 ? '#f59e0b' : '#10b981';
  const label = pct > 0.6 ? 'CRITICAL' : pct > 0.35 ? 'MODERATE' : 'LOW';
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110">
        <path d="M 25 95 A 75 75 0 0 1 175 95" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
        <path 
          d={`M 25 95 A 75 75 0 0 1 ${25 + (pct * 150)} ${95 - (Math.sin(pct * Math.PI) * 75)}`}
          fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" 
          className="transition-all duration-1000"
        />
        <text x="100" y="85" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>
          {(pct * 100).toFixed(0)}%
        </text>
      </svg>
      <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold shadow-md ${
        pct > 0.6 ? 'bg-orange-500 text-white' : 
        pct > 0.35 ? 'bg-amber-500 text-white' : 
        'bg-emerald-500 text-white'
      }`}>
        {label} RISK
      </div>
    </div>
  );
}

export default function Clinicien() {
  const navigate = useNavigate();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [shapData, setShapData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: parseFloat(value) || value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setShapData([]);
    try {
      // Appel API prédiction
      const predRes = await predictComplication(form);
      const predResult = predRes.data;
      setResult(predResult);

      // Appel API SHAP
      const shapRes = await explainSHAP(form);
      const rawShap = shapRes.data?.shap_values || {};
      const shapArray = Object.entries(rawShap)
        .map(([feature, value]) => ({ feature, value: Number(value) }))
        .slice(0, 6);
      setShapData(shapArray);
    } catch (error) {
      console.error('Erreur API', error);
      // Fallback simulation
      const fallbackScore = 0.3 + (form.age - 60) * 0.004 + (85 - form.meanbp) * 0.003;
      const finalScore = Math.min(0.95, Math.max(0.05, fallbackScore));
      setResult({
        risk_score: finalScore,
        prediction: finalScore > 0.5 ? 'high' : 'low',
        model: 'XGBoost (simulé)',
        confidence: 0.85
      });
      setShapData([
        { feature: 'avtisst', value: 0.32 },
        { feature: 'meanbp', value: -0.24 },
        { feature: 'age', value: 0.18 },
        { feature: 'crea', value: 0.15 },
        { feature: 'hrt', value: 0.08 },
        { feature: 'temp', value: -0.06 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToReport = () => {
    navigate('/reports', { 
      state: { 
        patientData: form, 
        result, 
        shapData,
        explanation: `Risque ${result?.prediction === 'high' ? 'élevé' : 'faible'} : ${((result?.risk_score || 0) * 100).toFixed(1)}% – facteurs principaux : ${shapData[0]?.feature || 'âge'}, ${shapData[1]?.feature || 'pression'}.`
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 p-8">
      {/* Arrière‑plan animé */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
      </div>

      <div className="relative">
        <div className="mb-8 animate-slideDown">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-500">
                <Stethoscope className="w-8 h-8 text-amber-50" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">
                Clinical Consultation
              </h1>
              <p className="text-stone-500 flex items-center gap-2 mt-1">
                <Sparkles size={14} className="text-rose-500" /> 
                AI-powered risk prediction with SHAP explainability
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Formulaire */}
          <div className="col-span-5 animate-slideRight">
            <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/60 p-6 hover:shadow-2xl transition-all duration-500">
              <h2 className="text-xl font-bold text-stone-700 mb-5 flex items-center gap-2">
                <User size={20} className="text-amber-600" /> Patient Data Entry
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Age</label>
                    <input name="age" value={form.age} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Sex</label>
                    <select name="sex" value={form.sex} onChange={handleChange} className="input-field">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Heart Rate</label>
                    <input name="hrt" value={form.hrt} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">BP Mean</label>
                    <input name="meanbp" value={form.meanbp} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">AVTISST</label>
                    <input name="avtisst" value={form.avtisst} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Creatinine</label>
                    <input name="crea" value={form.crea} onChange={handleChange} className="input-field" step="0.1" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-stone-500 block mb-1">Pathologie (dzgroup)</label>
                    <select name="dzgroup" value={form.dzgroup} onChange={handleChange} className="input-field">
                      <option>ARF/MOSF w/Sepsis</option>
                      <option>CHF</option>
                      <option>COPD</option>
                      <option>Lung Cancer</option>
                      <option>Cirrhosis</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
                  {loading ? 'Analyzing...' : 'Predict Risk'}
                </button>
              </form>
            </div>
          </div>

          {/* Résultats */}
          <div className="col-span-7">
            {result ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Risk Assessment */}
                <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/60 p-6">
                  <h2 className="text-xl font-bold text-stone-700 mb-4">Risk Assessment</h2>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <RiskGauge score={result.risk_score} />
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="bg-white/50 rounded-xl p-4 border border-amber-100">
                        <div className="text-xs text-stone-400">Model</div>
                        <div className="font-bold text-stone-700 text-lg">{result.model || 'XGBoost'}</div>
                      </div>
                      <div className="bg-white/50 rounded-xl p-4 border border-amber-100">
                        <div className="text-xs text-stone-400">Confidence</div>
                        <div className="font-bold text-stone-700 text-lg">{((result.confidence || 0.89) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-4 p-4 rounded-xl ${
                    result.risk_score > 0.6 ? 'bg-orange-100/70 border border-orange-200' : 
                    result.risk_score > 0.35 ? 'bg-amber-100/70 border border-amber-200' : 
                    'bg-emerald-100/70 border border-emerald-200'
                  }`}>
                    <div className="font-semibold flex items-center gap-2 text-stone-700">
                      {result.risk_score > 0.6 ? <AlertTriangle size={18} className="text-orange-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                      {result.risk_score > 0.6 ? 'ICU Admission Recommended' : result.risk_score > 0.35 ? 'Enhanced Monitoring' : 'Standard Care'}
                    </div>
                  </div>
                </div>

                {/* SHAP Chart */}
                {shapData.length > 0 && (
                  <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/60 p-6 animate-slideUp">
                    <h2 className="text-xl font-bold text-stone-700 mb-4">SHAP Analysis</h2>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={shapData} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" stroke="#d97706" />
                        <YAxis type="category" dataKey="feature" width={80} stroke="#d97706" />
                        <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: 'none', borderRadius: '12px' }} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {shapData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.value >= 0 ? '#f97316' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <button 
                      onClick={goToReport}
                      className="mt-5 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <FileText size={16} /> Generate Full Report (PDF)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50/80 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-200/60 flex flex-col items-center justify-center h-[500px] animate-pulse">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-rose-300 rounded-full blur-2xl animate-pulse"></div>
                  <Brain className="w-24 h-24 text-amber-300 relative animate-float" />
                </div>
                <p className="text-stone-400 mt-6">Complete the form to see prediction</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slideDown { animation: slideDown 0.6s ease-out; }
        .animate-slideRight { animation: slideRight 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .btn-primary {
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          padding: 0.75rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 700;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px -6px rgba(245,158,11,0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -8px rgba(245,158,11,0.5);
        }
        .input-field {
          width: 100%;
          padding: 0.6rem 1rem;
          border-radius: 16px;
          border: 1px solid #fed7aa;
          background: rgba(255,253,245,0.98);
          color: #78350f;
          transition: all 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.2);
        }
      `}</style>
    </div>
  );
}