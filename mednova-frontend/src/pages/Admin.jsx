import { useState } from 'react';
import { Settings, Download, RefreshCw, AlertTriangle, CheckCircle, Sparkles, Activity, Server, Filter, X } from 'lucide-react';

const DEMO_LOGS = [
  { id: 1, ts: '14:32:11', level: 'INFO', msg: 'POST /predict/complication - 200 OK - 128ms', user: 'admin@medica.com', ip: '192.168.1.45' },
  { id: 2, ts: '14:28:44', level: 'WARNING', msg: 'Database connection pool reaching limit - retry 1/3', user: 'system', ip: 'localhost' },
  { id: 3, ts: '14:25:33', level: 'INFO', msg: 'GET /api/patients - 200 OK - 89ms', user: 'doctor.john', ip: '192.168.1.23' },
  { id: 4, ts: '14:22:17', level: 'ERROR', msg: 'Failed to fetch radiology data - timeout after 30s', user: 'api-gateway', ip: '10.0.0.5' },
  { id: 5, ts: '14:18:02', level: 'INFO', msg: 'Model inference completed - confidence: 94.2%', user: 'ml-engine', ip: '10.0.0.10' },
  { id: 6, ts: '14:15:45', level: 'WARNING', msg: 'High memory usage detected - 85%', user: 'monitor', ip: 'localhost' },
  { id: 7, ts: '14:12:33', level: 'INFO', msg: 'User authentication successful', user: 'security', ip: '192.168.1.100' },
];

export default function Admin() {
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLevel, setFilterLevel] = useState('ALL');

  const handleExport = async () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const csvContent = logs.filter(l => filterLevel === 'ALL' || l.level === filterLevel).map(log => `${log.ts},${log.level},${log.msg},${log.user}`).join('\n');
      const blob = new Blob([`Timestamp,Level,Message,User\n${csvContent}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLogs(prev => prev.map(log => ({ ...log, ts: new Date().toLocaleTimeString() })));
      setRefreshing(false);
    }, 800);
  };

  const getLogIcon = (level) => {
    switch(level) {
      case 'ERROR': return <AlertTriangle size={16} className="text-rose-500" />;
      case 'WARNING': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <CheckCircle size={16} className="text-emerald-500" />;
    }
  };

  const filteredLogs = filterLevel === 'ALL' ? logs : logs.filter(log => log.level === filterLevel);
  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'ERROR').length,
    warnings: logs.filter(l => l.level === 'WARNING').length,
    info: logs.filter(l => l.level === 'INFO').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 rounded-2xl blur-xl animate-pulse"></div>
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-2xl">
                  <Settings className="w-8 h-8 text-amber-50" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">Administration</h1>
                <p className="text-stone-500 flex items-center gap-2 mt-1">
                  <Sparkles size={14} className="text-rose-500" /> System logs & data export
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleRefresh} disabled={refreshing} className="px-5 py-2.5 bg-amber-200/50 hover:bg-amber-300/50 rounded-xl text-stone-700 font-medium flex items-center gap-2 border border-amber-300/60 transition-all hover:scale-105">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button onClick={handleExport} disabled={exporting} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                <Download size={16} className={exporting ? 'animate-bounce' : ''} />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="bg-amber-100/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 text-amber-600" />
              <span className="text-2xl font-bold text-stone-700">{stats.total}</span>
            </div>
            <p className="text-stone-500 text-sm mt-2">Total Logs</p>
          </div>
          <div className="bg-rose-100/60 backdrop-blur-sm rounded-2xl p-5 border border-rose-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
              <span className="text-2xl font-bold text-stone-700">{stats.errors}</span>
            </div>
            <p className="text-stone-500 text-sm mt-2">Errors</p>
          </div>
          <div className="bg-amber-100/60 backdrop-blur-sm rounded-2xl p-5 border border-amber-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <span className="text-2xl font-bold text-stone-700">{stats.warnings}</span>
            </div>
            <p className="text-stone-500 text-sm mt-2">Warnings</p>
          </div>
          <div className="bg-emerald-100/60 backdrop-blur-sm rounded-2xl p-5 border border-emerald-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-stone-700">{stats.info}</span>
            </div>
            <p className="text-stone-500 text-sm mt-2">Info</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-amber-50/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/60 overflow-hidden">
          <div className="p-6 border-b border-amber-200/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-stone-700">System Logs</h3>
                <span className="text-xs text-stone-500 bg-amber-200/50 px-2 py-1 rounded-full">{filteredLogs.length} entries</span>
              </div>
              <div className="flex gap-2">
                {['ALL', 'INFO', 'WARNING', 'ERROR'].map(level => (
                  <button
                    key={level}
                    onClick={() => setFilterLevel(level)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterLevel === level 
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md' 
                        : 'bg-amber-200/40 text-stone-600 hover:text-stone-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-amber-100/80 backdrop-blur-sm">
                <tr className="border-b border-amber-200/40">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-stone-500 uppercase">Time</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-stone-500 uppercase">Level</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-stone-500 uppercase">Message</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-stone-500 uppercase">User</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-stone-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/30">
                {filteredLogs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-amber-100/30 transition-colors animate-slideIn" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="py-4 px-6 text-sm font-mono text-stone-500">{log.ts}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.level)}
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          log.level === 'ERROR' ? 'bg-rose-200 text-rose-700 border border-rose-300' :
                          log.level === 'WARNING' ? 'bg-amber-200 text-amber-700 border border-amber-300' :
                          'bg-emerald-200 text-emerald-700 border border-emerald-300'
                        }`}>
                          {log.level}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-stone-600">{log.msg}</td>
                    <td className="py-4 px-6 text-sm text-stone-500">{log.user}</td>
                    <td className="py-4 px-6 text-sm text-stone-500 font-mono">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .animate-bounce { animation: bounce 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}