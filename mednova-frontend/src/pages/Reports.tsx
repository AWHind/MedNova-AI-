// src/pages/Reports.tsx
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { predictComplication, explainSHAP } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, Calendar, User, Heart, Brain, Sparkles, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Fallback patient data (peut venir de navigation state ou localStorage)
const DEFAULT_PATIENT_DATA = {
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

export default function Reports() {
  const location = useLocation();
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Données patient (peuvent venir de l'état de navigation)
  const [patientData, setPatientData] = useState(DEFAULT_PATIENT_DATA);
  const [result, setResult] = useState<any>(null);
  const [shapData, setShapData] = useState<any[]>([]);
  const [explanationText, setExplanationText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  // Récupération des données de prédiction et SHAP au montage
  useEffect(() => {
    // Essayer de récupérer les données depuis navigation state (si on vient de Clinicien)
    const navState = location.state as any;
    if (navState && navState.patientData) {
      setPatientData(navState.patientData);
      if (navState.result) setResult(navState.result);
      if (navState.shapData) setShapData(navState.shapData);
      if (navState.explanation) setExplanationText(navState.explanation);
      setLoading(false);
    } else {
      // Sinon faire appel API avec les données par défaut
      const fetchReportData = async () => {
        setLoading(true);
        try {
          // Prédiction
          const predRes = await predictComplication(DEFAULT_PATIENT_DATA);
          const predResult = predRes.data;
          setResult(predResult);
          
          // SHAP
          const shapRes = await explainSHAP(DEFAULT_PATIENT_DATA);
          const rawShap = shapRes.data?.shap_values || {};
          const shapArray = Object.entries(rawShap)
            .map(([feature, value]) => ({ feature, value: Number(value) }))
            .slice(0, 6);
          setShapData(shapArray);
          
          // Générer explication texte simple (ou depuis API)
          const topFeature = shapArray.length ? shapArray[0].feature : 'age';
          const riskLevel = predResult.risk_score > 0.6 ? 'élevé' : predResult.risk_score > 0.35 ? 'modéré' : 'faible';
          setExplanationText(
            `Le risque de complication est ${riskLevel} (${(predResult.risk_score * 100).toFixed(1)}%). ` +
            `La caractéristique la plus influente est "${topFeature}". ` +
            `Une surveillance ${predResult.risk_score > 0.6 ? 'intensive en soins critiques' : 'standard'} est recommandée.`
          );
        } catch (error) {
          console.error('Erreur chargement rapport', error);
          // Données simulées
          setResult({ risk_score: 0.33, prediction: 'low', model: 'XGBoost', confidence: 0.87 });
          setShapData([
            { feature: 'avtisst', value: 0.32 },
            { feature: 'meanbp', value: -0.24 },
            { feature: 'age', value: 0.18 },
            { feature: 'crea', value: 0.15 },
            { feature: 'hrt', value: 0.08 },
            { feature: 'temp', value: -0.06 }
          ]);
          setExplanationText('Risque faible. Les principaux facteurs sont l’âge et la pression artérielle moyenne.');
        } finally {
          setLoading(false);
        }
      };
      fetchReportData();
    }
  }, [location]);

  // Export PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#fef7e8',
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      // Si l'image dépasse une page, on ajoute une seconde page
      if (imgHeight > pageHeight) {
        position = -pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      }
      pdf.save(`MedNova_Report_${new Date().toISOString().slice(0,19)}.pdf`);
    } catch (error) {
      console.error('PDF export error', error);
    } finally {
      setExporting(false);
    }
  };

  // Helper pour l'affichage du niveau de risque
  const getRiskBadge = (score: number) => {
    if (score > 0.6) return { label: 'CRITICAL', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (score > 0.35) return { label: 'MODERATE', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'LOW', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-stone-600">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  const risk = result?.risk_score || 0.33;
  const riskBadge = getRiskBadge(risk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl animate-pulse"></div>
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-50" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">Rapport Médical</h1>
              <p className="text-stone-500 text-sm flex items-center gap-1">
                <Sparkles size={12} className="text-rose-500" /> Analyse prédictive & recommandations
              </p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105"
          >
            <Download size={16} className={exporting ? 'animate-bounce' : ''} />
            {exporting ? 'Génération...' : 'Export PDF'}
          </button>
        </div>

        {/* Contenu du rapport - à capturer pour PDF */}
        <div ref={reportRef} className="space-y-6">
          {/* En-tête du rapport (date, app) */}
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/60 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-stone-700">MedNova AI</h2>
              <p className="text-xs text-stone-500">Medical Intelligence Platform</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-stone-500 text-sm">
                <Calendar size={14} /> {new Date().toLocaleDateString()}
              </div>
              <div className="text-xs text-stone-400 mt-1">Rapport généré automatiquement</div>
            </div>
          </div>

          {/* 1. Résumé Patient */}
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl border border-amber-200/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-amber-600" />
              <h2 className="text-xl font-bold text-stone-700">Résumé Patient</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Âge</div>
                <div className="text-lg font-bold text-stone-700">{patientData.age} ans</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Sexe</div>
                <div className="text-lg font-bold text-stone-700 capitalize">{patientData.sex}</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Pression artérielle (mean)</div>
                <div className="text-lg font-bold text-stone-700">{patientData.meanbp} mmHg</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Créatinine</div>
                <div className="text-lg font-bold text-stone-700">{patientData.crea} mg/dL</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Fréquence cardiaque</div>
                <div className="text-lg font-bold text-stone-700">{patientData.hrt} bpm</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">AVTISST</div>
                <div className="text-lg font-bold text-stone-700">{patientData.avtisst}</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Pathologie principale</div>
                <div className="text-sm font-semibold text-stone-700 truncate">{patientData.dzgroup}</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3">
                <div className="text-xs text-stone-500">Nombre de comorbidités</div>
                <div className="text-lg font-bold text-stone-700">{patientData.num_co}</div>
              </div>
            </div>
          </div>

          {/* 2. Résultat Prédiction */}
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl border border-amber-200/60 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-rose-500" />
              <h2 className="text-xl font-bold text-stone-700">Résultat de la Prédiction</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="text-center">
                <div className="text-5xl font-bold text-stone-800">{(risk * 100).toFixed(1)}%</div>
                <div className="text-sm text-stone-500 mt-1">Risque de complication</div>
              </div>
              <div className={`px-5 py-2 rounded-full text-sm font-bold border ${riskBadge.color}`}>
                {riskBadge.label} RISK
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2"><span className="text-stone-500 w-24">Modèle :</span><span className="font-semibold text-stone-700">{result?.model || 'XGBoost'}</span></div>
                <div className="flex gap-2"><span className="text-stone-500 w-24">Confiance :</span><span className="font-semibold text-stone-700">{((result?.confidence || 0.87) * 100).toFixed(1)}%</span></div>
                <div className="flex gap-2"><span className="text-stone-500 w-24">Prédiction :</span><span className="font-semibold capitalize">{result?.prediction || 'low'}</span></div>
              </div>
            </div>
          </div>

          {/* 3. Graphique SHAP */}
          {shapData.length > 0 && (
            <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl border border-amber-200/60 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-amber-600" />
                <h2 className="text-xl font-bold text-stone-700">Analyse d'importance des caractéristiques (SHAP)</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 60 }}>
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
              <p className="text-xs text-stone-500 mt-3 text-center">
                Valeurs positives augmentent le risque, négatives le diminuent.
              </p>
            </div>
          )}

          {/* 4. Explication texte */}
          <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl border border-amber-200/60 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={20} className="text-amber-600" />
              <h2 className="text-xl font-bold text-stone-700">Interprétation clinique</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">{explanationText}</p>
          </div>

          {/* Pied de page optionnel */}
          <div className="text-center text-xs text-stone-400 pt-4 border-t border-amber-200/40 mt-2">
            MedNova AI v4.0 - Rapport confidentiel généré le {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-50px) scale(1.1)} 66%{transform:translate(-20px,20px) scale(0.9)} }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .animate-bounce { animation: bounce 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}