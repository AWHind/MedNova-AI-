import { useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  Network, Search, Users, Activity, Filter, X, Database, Sparkles 
} from 'lucide-react';

const CLUSTER_CONFIG = {
  colors: ['#10B981', '#F59E0B', '#F97316', '#EC4899'],
  names: ['Cluster 0 · Stable', 'Cluster 1 · Modéré', 'Cluster 2 · Sévère', 'Cluster 3 · Critique'],
};

const PATHOLOGIES = [
  'ARF/MOSF w/Sepsis', 'CHF', 'COPD', 'Lung Cancer', 
  'Cirrhosis', 'Coma', 'Colon Cancer'
];

const generateDemoPatients = () => Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  age: Math.floor(Math.random() * 65 + 18),
  meanbp: Math.floor(Math.random() * 90 + 50),
  avtisst: Math.floor(Math.random() * 80 + 15),
  crea: +(Math.random() * 3.5 + 0.4).toFixed(2),
  cluster: Math.floor(Math.random() * 4),
  risk: Math.random() > 0.44 ? 'high' : 'low',
  dzgroup: PATHOLOGIES[Math.floor(Math.random() * PATHOLOGIES.length)],
}));

const CustomDot = ({ cx, cy, payload }) => (
  <circle 
    cx={cx} 
    cy={cy} 
    r={7}
    fill={CLUSTER_CONFIG.colors[payload.cluster]} 
    opacity={0.85}
    stroke={payload.risk === 'high' ? '#DC2626' : 'transparent'}
    strokeWidth={2.5}
    className="transition-all duration-200 hover:r-10 hover:opacity-100 cursor-pointer"
  />
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const patient = payload[0]?.payload;
  
  return (
    <div className="bg-amber-50 rounded-xl shadow-2xl p-4 border border-amber-200 min-w-[220px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200">
        <span className="font-bold text-stone-700">Patient #{patient.id}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          patient.risk === 'high' ? 'bg-rose-200 text-rose-700 border border-rose-300' : 'bg-emerald-200 text-emerald-700 border border-emerald-300'
        }`}>
          {patient.risk === 'high' ? 'HIGH RISK' : 'LOW RISK'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-stone-500">Âge</span><span className="font-semibold text-stone-700">{patient.age} ans</span></div>
        <div className="flex justify-between"><span className="text-stone-500">AVTISST</span><span className="font-semibold text-stone-700">{patient.avtisst}</span></div>
        <div className="flex justify-between"><span className="text-stone-500">Pression artérielle</span><span className="font-semibold text-stone-700">{patient.meanbp} mmHg</span></div>
        <div className="flex justify-between"><span className="text-stone-500">Créatinine</span><span className="font-semibold text-stone-700">{patient.crea}</span></div>
        <div className="flex justify-between">
          <span className="text-stone-500">Cluster</span>
          <span className="font-semibold" style={{ color: CLUSTER_CONFIG.colors[patient.cluster] }}>
            {CLUSTER_CONFIG.names[patient.cluster]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Exploration() {
  const [patients, setPatients] = useState(generateDemoPatients());
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [similarPatients, setSimilarPatients] = useState([]);

  const stats = {
    total: filteredPatients.length,
    highRisk: filteredPatients.filter(p => p.risk === 'high').length,
    lowRisk: filteredPatients.filter(p => p.risk === 'low').length,
    clusters: [0, 1, 2, 3].map(c => ({
      id: c,
      count: filteredPatients.filter(p => p.cluster === c).length,
      name: CLUSTER_CONFIG.names[c]
    }))
  };

  const scatterGroups = [0, 1, 2, 3].map(cluster => ({
    name: CLUSTER_CONFIG.names[cluster],
    data: patients.filter(p => p.cluster === cluster)
  }));

  useEffect(() => {
    let filtered = [...patients];
    if (searchTerm) {
      filtered = filtered.filter(p => String(p.id).includes(searchTerm) || p.dzgroup?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (riskFilter !== 'all') filtered = filtered.filter(p => p.risk === riskFilter);
    if (clusterFilter !== 'all') filtered = filtered.filter(p => String(p.cluster) === clusterFilter);
    setFilteredPatients(filtered);
  }, [patients, searchTerm, riskFilter, clusterFilter]);

  const findSimilarPatients = (patient) => {
    setSelectedPatient(patient);
    const similar = patients
      .filter(p => p.id !== patient.id)
      .map(p => ({
        ...p,
        distance: Math.sqrt(
          Math.pow((p.age - patient.age) / 50, 2) +
          Math.pow((p.meanbp - patient.meanbp) / 60, 2) +
          Math.pow((p.avtisst - patient.avtisst) / 60, 2) +
          Math.pow((p.crea - patient.crea) / 3, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    setSimilarPatients(similar);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setClusterFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-2xl">
                  <Database className="w-8 h-8 text-amber-50" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">Exploration des Données</h1>
                <p className="text-stone-500 flex items-center gap-2 mt-1">
                  <Sparkles size={14} className="text-rose-500" /> Visualisation des clusters K-Means & k-NN
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-amber-100/60 rounded-xl px-4 py-2 border border-amber-200/60">
                <span className="text-xs text-stone-500">Total patients</span>
                <div className="text-xl font-bold text-stone-700">{stats.total}</div>
              </div>
              <div className="bg-rose-100/60 rounded-xl px-4 py-2 border border-rose-200/60">
                <span className="text-xs text-stone-500">Haut risque</span>
                <div className="text-xl font-bold text-rose-600">{stats.highRisk}</div>
              </div>
              <div className="bg-emerald-100/60 rounded-xl px-4 py-2 border border-emerald-200/60">
                <span className="text-xs text-stone-500">Faible risque</span>
                <div className="text-xl font-bold text-emerald-600">{stats.lowRisk}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-amber-50/70 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/60 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-stone-500" />
              <h3 className="font-semibold text-stone-700">Filtres</h3>
            </div>
            <button onClick={resetFilters} className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1">
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" placeholder="Rechercher par ID ou pathologie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-amber-100/40 rounded-xl border border-amber-300/60 text-stone-700 focus:border-amber-500 outline-none transition-all" />
            </div>
            <div className="flex gap-2">
              {['all', 'high', 'low'].map(filter => (
                <button key={filter} onClick={() => setRiskFilter(filter)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${riskFilter === filter ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md' : 'bg-amber-200/40 text-stone-600 hover:text-stone-800'}`}>
                  {filter === 'all' ? 'Tous' : filter === 'high' ? 'Haut risque' : 'Faible risque'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setClusterFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${clusterFilter === 'all' ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md' : 'bg-amber-200/40 text-stone-600 hover:text-stone-800'}`}>Tous</button>
              {[0, 1, 2, 3].map(cluster => (
                <button key={cluster} onClick={() => setClusterFilter(String(cluster))} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${clusterFilter === String(cluster) ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' : 'bg-amber-200/40 text-stone-600 hover:text-stone-800'}`}>C{cluster}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7 bg-amber-50/70 backdrop-blur-sm rounded-3xl border border-amber-200/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200/40">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-stone-700">Liste des patients</span>
                <span className="text-xs text-stone-500 bg-amber-200/40 px-2 py-1 rounded-full">{filteredPatients.length} résultats</span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-amber-100/80">
                  <tr className="border-b border-amber-200/40">
                    {['ID', 'Âge', 'BP', 'AVTISST', 'Pathologie', 'Cluster', 'Risque'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-200/30">
                  {filteredPatients.map(patient => (
                    <tr key={patient.id} onClick={() => findSimilarPatients(patient)} className={`hover:bg-amber-100/40 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-amber-200/40' : ''}`}>
                      <td className="py-3 px-4 text-sm font-mono text-stone-500">#{patient.id}</td>
                      <td className="py-3 px-4 text-sm text-stone-700">{patient.age}</td>
                      <td className="py-3 px-4 text-sm text-stone-600">{patient.meanbp}</td>
                      <td className="py-3 px-4 text-sm text-stone-600">{patient.avtisst}</td>
                      <td className="py-3 px-4 text-sm text-stone-500 max-w-[150px] truncate">{patient.dzgroup}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${CLUSTER_CONFIG.colors[patient.cluster]}20`, color: CLUSTER_CONFIG.colors[patient.cluster] }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CLUSTER_CONFIG.colors[patient.cluster] }} />
                          C{patient.cluster}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${patient.risk === 'high' ? 'bg-rose-200 text-rose-700 border border-rose-300' : 'bg-emerald-200 text-emerald-700 border border-emerald-300'}`}>
                          {patient.risk === 'high' ? 'Élevé' : 'Faible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-5 space-y-6">
            <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl p-5 border border-amber-200/60">
              <h3 className="font-semibold text-stone-700 mb-4">Visualisation des clusters</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <XAxis dataKey="age" name="Âge" tick={{ fontSize: 11, fill: '#78350f' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="avtisst" name="AVTISST" tick={{ fontSize: 11, fill: '#78350f' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {scatterGroups.map((group, idx) => (
                    <Scatter key={idx} name={group.name} data={group.data} shape={<CustomDot />} fill={CLUSTER_CONFIG.colors[idx]} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} formatter={(value) => <span className="text-stone-600">{value}</span>} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl p-5 border border-amber-200/60">
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-stone-700">Patients similaires (k-NN)</h3>
              </div>
              {selectedPatient ? (
                <>
                  <div className="bg-amber-100/60 rounded-xl p-3 mb-4 border border-amber-200">
                    <p className="text-xs text-stone-500">Patient de référence</p>
                    <p className="text-sm font-semibold text-stone-700">#{selectedPatient.id} · {selectedPatient.age} ans · Cluster {selectedPatient.cluster}</p>
                  </div>
                  <div className="space-y-3">
                    {similarPatients.map((patient, index) => (
                      <div key={patient.id} className="flex items-center gap-3 p-3 bg-amber-100/30 rounded-xl hover:bg-amber-100/50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-700">{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-stone-700">Patient #{patient.id}</span>
                            <span className="text-xs text-stone-400">distance: {patient.distance.toFixed(3)}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-stone-500">Âge {patient.age}</span>
                            <span className="text-xs text-stone-500">BP {patient.meanbp}</span>
                            <span className={`text-xs font-semibold ${patient.risk === 'high' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {patient.risk === 'high' ? 'Haut risque' : 'Faible risque'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Network className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                  <p className="text-stone-500 text-sm">Cliquez sur un patient pour trouver des cas similaires</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl p-5 border border-amber-200/60">
              <h3 className="font-semibold text-stone-700 mb-3">Distribution des clusters</h3>
              <div className="space-y-3">
                {stats.clusters.map(cluster => (
                  <div key={cluster.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CLUSTER_CONFIG.colors[cluster.id] }} />
                    <span className="text-sm text-stone-500 flex-1">{cluster.name}</span>
                    <span className="text-sm font-semibold text-stone-700">{cluster.count}</span>
                    <div className="w-24 bg-amber-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${(cluster.count / stats.total) * 100}%`, backgroundColor: CLUSTER_CONFIG.colors[cluster.id] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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