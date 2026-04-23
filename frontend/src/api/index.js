import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => {
    const { data } = response
    if (data.success || data.code === 200) {
      return data.data
    }
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  error => {
    const message = error.response?.data?.detail || error.message || '网络错误'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export const importApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getTemplates: () => api.get('/import/templates'),
  getMappingTemplates: () => api.get('/import/mapping-templates'),
  map: (data) => api.post('/import/map', data),
  confirm: (params) => api.post('/import/confirm', null, { params })
}

export const hotProductsApi = {
  getList: (params) => api.get('/hot-products/', { params }),
  getPlatforms: () => api.get('/hot-products/platforms'),
  getDetail: (id) => api.get(`/hot-products/${id}`),
  add: (data) => api.post('/hot-products/', data),
  addToMonitor: (id) => api.post(`/hot-products/${id}/monitor`)
}

export const productMonitorApi = {
  getProducts: () => api.get('/product-monitor/products'),
  analyze: (data) => api.post('/product-monitor/analyze', data),
  getTrends: (params) => api.get('/product-monitor/trends', { params }),
  getCorrelation: () => api.get('/product-monitor/correlation')
}

export const influencerApi = {
  getScoringConfig: () => api.get('/influencer/scoring-config'),
  updateScoringConfig: (data) => api.put('/influencer/scoring-config', data),
  recalculate: () => api.post('/influencer/recalculate'),
  getList: (params) => api.get('/influencer/', { params }),
  getDetail: (id) => api.get(`/influencer/${id}`)
}

export default api
