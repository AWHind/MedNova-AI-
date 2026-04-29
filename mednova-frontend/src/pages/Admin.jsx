import { useState, useEffect } from 'react'
import { getPredictionsHistory, exportPredictions, getLogs } from '../services/api'
import { Settings, Download, RefreshCw, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'

const DEMO_LOGS = [
  { ts: '14:32:11', level: 'INFO', msg: 'POST /predict/complication - 200 OK - 128ms' },
  { ts: '14:28:44', level: 'WARNING', msg: 'SQL Server connection timeout - retry 1/3' },
]

export default function Admin() {
  const [logs, setLogs] = useState(DEMO_LOGS)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    setTimeout(() => { setExporting(false); alert('Export demo - CSV would download') }, 1000)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="medical-icon w-14 h-14 rounded-2xl flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Administration</h1>
              <p className="text-gray-500 flex items-center gap-1 mt-1"><Sparkles size={12} /> System logs & data export</p>
            </div>
          </div>
          <button onClick={handleExport} disabled={exporting} className="btn-primary flex items-center gap-2">
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      <div className="medical-card">
        <h3 className="text-lg font-semibold mb-4">API Logs</h3>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className={`p-4 rounded-xl flex items-start gap-3 ${log.level === 'ERROR' ? 'bg-red-50' : log.level === 'WARNING' ? 'bg-amber-50' : 'bg-gray-50'}`}>
              {log.level === 'ERROR' ? <AlertTriangle size={16} className="text-red-600" /> : <CheckCircle size={16} className="text-green-600" />}
              <span className="text-xs text-gray-400">{log.ts}</span>
              <span className={`text-xs font-bold ${log.level === 'ERROR' ? 'text-red-600' : log.level === 'WARNING' ? 'text-amber-600' : 'text-green-600'}`}>{log.level}</span>
              <span className="text-sm text-gray-700">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}