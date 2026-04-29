import { useState, useEffect } from 'react'
import { getClusterData } from '../services/api'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { 
  Network, Search, SlidersHorizontal, Users, 
  Activity, Heart, Thermometer, Filter, X, 
  ChevronRight, Database, BarChart3 
} from 'lucide-react'

// ============================================
// CONSTANTES ET CONFIGURATION
// ============================================

const CLUSTER_CONFIG = {
  colors: ['#10B981', '#3B82F6', '#F59E0B', '#EC4899'],
  names: ['Cluster 0 · Stable', 'Cluster 1 · Modéré', 'Cluster 2 · Sévère', 'Cluster 3 · Critique'],
  descriptions: ['Patients stables', 'Risque modéré', 'État sévère', 'État critique']
}

const PATHOLOGIES = [
  'ARF/MOSF w/Sepsis', 'CHF', 'COPD', 'Lung Cancer', 
  'Cirrhosis', 'Coma', 'Colon Cancer'
]

// ============================================
// GÉNÉRATION DES DONNÉES DE DÉMONSTRATION
// ============================================

const generateDemoPatients = () => Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  age: Math.floor(Math.random() * 65 + 18),
  meanbp: Math.floor(Math.random() * 90 + 50),
  avtisst: Math.floor(Math.random() * 80 + 15),
  crea: +(Math.random() * 3.5 + 0.4).toFixed(2),
  cluster: Math.floor(Math.random() * 4),
  risk: Math.random() > 0.44 ? 'high' : 'low',
  dzgroup: PATHOLOGIES[Math.floor(Math.random() * PATHOLOGIES.length)],
}))

// ============================================
// COMPOSANTS PERSONNALISÉS
// ============================================

// Point personnalisé pour le scatter plot
const CustomDot = ({ cx, cy, payload }) => (
  <circle 
    cx={cx} 
    cy={cy} 
    r={6}
    fill={CLUSTER_CONFIG.colors[payload.cluster]} 
    opacity={0.85}
    stroke={payload.risk === 'high' ? '#DC2626' : 'transparent'}
    strokeWidth={payload.risk === 'high' ? 2.5 : 0}
    className="transition-all duration-200 hover:r-8 hover:opacity-100"
  />
)

// Tooltip personnalisé pour le scatter plot
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const patient = payload[0]?.payload
  
  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-100 min-w-[200px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
        <span className="font-bold text-gray-800">Patient #{patient.id}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          patient.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {patient.risk.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Âge</span>
          <span className="font-semibold text-gray-800">{patient.age} ans</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">AVTISST</span>
          <span className="font-semibold text-gray-800">{patient.avtisst}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pression artérielle</span>
          <span className="font-semibold text-gray-800">{patient.meanbp} mmHg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Cluster</span>
          <span className="font-semibold" style={{ color: CLUSTER_CONFIG.colors[patient.cluster] }}>
            {CLUSTER_CONFIG.names[patient.cluster]}
          </span>
        </div>
      </div>
    </div>
  )
}

// Carte de statistique
const StatCard = ({ icon: Icon, value, label, color, bgColor }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </div>
)

// Composant de filtre
const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
)

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function Exploration() {
  // États
  const [patients, setPatients] = useState(generateDemoPatients())
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [clusterFilter, setClusterFilter] = useState('all')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [similarPatients, setSimilarPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Calcul des statistiques
  const stats = {
    total: filteredPatients.length,
    highRisk: filteredPatients.filter(p => p.risk === 'high').length,
    lowRisk: filteredPatients.filter(p => p.risk === 'low').length,
    clusters: [0, 1, 2, 3].map(c => ({
      id: c,
      count: filteredPatients.filter(p => p.cluster === c).length,
      name: CLUSTER_CONFIG.names[c]
    }))
  }

  // Groupes pour le scatter plot
  const scatterGroups = [0, 1, 2, 3].map(cluster => ({
    name: CLUSTER_CONFIG.names[cluster],
    data: patients.filter(p => p.cluster === cluster)
  }))

  // ============================================
  // MÉTHODES
  // ============================================

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const response = await getClusterData()
        if (response.data?.patients?.length) {
          setPatients(response.data.patients)
        }
      } catch (error) {
        console.log('Utilisation des données de démonstration')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filtrage des patients
  useEffect(() => {
    let filtered = [...patients]
    
    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        String(p.id).includes(searchTerm) || 
        p.dzgroup?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtre par risque
    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.risk === riskFilter)
    }
    
    // Filtre par cluster
    if (clusterFilter !== 'all') {
      filtered = filtered.filter(p => String(p.cluster) === clusterFilter)
    }
    
    setFilteredPatients(filtered)
  }, [patients, searchTerm, riskFilter, clusterFilter])

  // Recherche de patients similaires (k-NN)
  const findSimilarPatients = (patient) => {
    setSelectedPatient(patient)
    
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
      .slice(0, 5)
    
    setSimilarPatients(similar)
  }

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm('')
    setRiskFilter('all')
    setClusterFilter('all')
  }

  // ============================================
  // RENDU
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Database className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Exploration des Données
              </h1>
              <p className="text-gray-500 mt-1">
                Visualisation des clusters K-Means et recherche de patients similaires (k-NN)
              </p>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex gap-3">
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <span className="text-xs text-gray-500">Total patients</span>
              <div className="text-xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <span className="text-xs text-gray-500">Haut risque</span>
              <div className="text-xl font-bold text-red-600">{stats.highRisk}</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
              <span className="text-xs text-gray-500">Faible risque</span>
              <div className="text-xl font-bold text-green-600">{stats.lowRisk}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des filtres */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-700">Filtres</h3>
          </div>
          <button
            onClick={resetFilters}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Réinitialiser
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID ou pathologie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>
          
          {/* Filtre risque */}
          <div className="flex gap-2">
            {['all', 'high', 'low'].map(filter => (
              <FilterChip
                key={filter}
                label={filter === 'all' ? 'Tous' : filter === 'high' ? 'Haut risque' : 'Faible risque'}
                active={riskFilter === filter}
                onClick={() => setRiskFilter(filter)}
              />
            ))}
          </div>
          
          {/* Filtre cluster */}
          <div className="flex gap-2">
            <FilterChip
              label="Tous"
              active={clusterFilter === 'all'}
              onClick={() => setClusterFilter('all')}
            />
            {[0, 1, 2, 3].map(cluster => (
              <FilterChip
                key={cluster}
                label={`Cluster ${cluster}`}
                active={clusterFilter === String(cluster)}
                onClick={() => setClusterFilter(String(cluster))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-12 gap-6">
        {/* Tableau des patients */}
        <div className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-700">Liste des patients</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {filteredPatients.length} résultats
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {['ID', 'Âge', 'BP', 'AVTISST', 'Pathologie', 'Cluster', 'Risque', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedPatient?.id === patient.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => findSimilarPatients(patient)}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-gray-500">#{patient.id}</td>
                    <td className="py-3 px-4 text-sm font-medium">{patient.age}</td>
                    <td className="py-3 px-4 text-sm">{patient.meanbp}</td>
                    <td className="py-3 px-4 text-sm">{patient.avtisst}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[150px] truncate">
                      {patient.dzgroup}
                    </td>
                    <td className="py-3 px-4">
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          backgroundColor: `${CLUSTER_CONFIG.colors[patient.cluster]}20`,
                          color: CLUSTER_CONFIG.colors[patient.cluster]
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CLUSTER_CONFIG.colors[patient.cluster] }} />
                        C{patient.cluster}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        patient.risk === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {patient.risk === 'high' ? 'Élevé' : 'Faible'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                        Détails <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panneau droit */}
        <div className="col-span-5 space-y-6">
          {/* Graphique des clusters */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-700">Visualisation des clusters</h3>
                <p className="text-xs text-gray-400 mt-1">Âge × Score AVTISST</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="age" 
                  name="Âge" 
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="avtisst" 
                  name="AVTISST" 
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {scatterGroups.map((group, idx) => (
                  <Scatter
                    key={idx}
                    name={group.name}
                    data={group.data}
                    shape={<CustomDot />}
                    fill={CLUSTER_CONFIG.colors[idx]}
                  />
                ))}
                <Legend 
                  wrapperStyle={{ fontSize: 10, paddingTop: 10 }}
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Résultats k-NN */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-5 h-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-700">Patients similaires (k-NN)</h3>
            </div>
            
            {selectedPatient ? (
              <>
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500">Patient de référence</p>
                  <p className="text-sm font-semibold text-gray-800">
                    #{selectedPatient.id} · {selectedPatient.age} ans · Cluster {selectedPatient.cluster}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {similarPatients.map((patient, index) => (
                    <div key={patient.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">Patient #{patient.id}</span>
                          <span className="text-xs text-gray-400">distance: {patient.distance.toFixed(3)}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">Âge {patient.age}</span>
                          <span className="text-xs text-gray-500">BP {patient.meanbp}</span>
                          <span className={`text-xs font-semibold ${
                            patient.risk === 'high' ? 'text-red-600' : 'text-green-600'
                          }`}>
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
                <Network className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Cliquez sur un patient pour trouver des cas similaires
                </p>
              </div>
            )}
          </div>

          {/* Distribution des clusters */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-3">Distribution des clusters</h3>
            <div className="space-y-3">
              {stats.clusters.map(cluster => (
                <div key={cluster.id} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CLUSTER_CONFIG.colors[cluster.id] }}
                  />
                  <span className="text-sm text-gray-600 flex-1">{cluster.name}</span>
                  <span className="text-sm font-semibold text-gray-800">{cluster.count}</span>
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full"
                      style={{ 
                        width: `${(cluster.count / stats.total) * 100}%`,
                        backgroundColor: CLUSTER_CONFIG.colors[cluster.id]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}