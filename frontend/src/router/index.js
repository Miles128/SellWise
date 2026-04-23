import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/hot-products',
    children: [
      {
        path: 'import',
        name: 'Import',
        component: () => import('@/views/Import.vue'),
        meta: { title: '数据导入', icon: 'UploadFilled' }
      },
      {
        path: 'hot-products',
        name: 'HotProducts',
        component: () => import('@/views/HotProducts.vue'),
        meta: { title: '热点选款', icon: 'TrendCharts' }
      },
      {
        path: 'product-monitor',
        name: 'ProductMonitor',
        component: () => import('@/views/ProductMonitor.vue'),
        meta: { title: '产品监控', icon: 'Monitor' }
      },
      {
        path: 'influencer',
        name: 'Influencer',
        component: () => import('@/views/Influencer.vue'),
        meta: { title: '达人分析', icon: 'User' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
