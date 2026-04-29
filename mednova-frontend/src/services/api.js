import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export const predictComplication = (data) => api.post('/predict/complication', data)
export const explainSHAP = (data) => api.post('/explain/shap', data)
export const getClusterData = () => api.get('/cluster/data')
export const getDashboardKPIs = () => api.get('/dashboard/kpis')
export const getModelRuns = () => api.get('/models/runs')
export const getPredictionsHistory = (params) => api.get('/admin/predictions', { params })
export const exportPredictions = (format) => api.get(`/admin/export?format=${format}`, { responseType: 'blob' })
export const getLogs = () => api.get('/admin/logs')

export default api