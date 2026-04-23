<template>
  <div class="product-monitor-page">
    <div class="page-header">
      <h2>产品运营数据监控</h2>
      <el-button type="primary" @click="handleAnalyze">
        <el-icon><DataAnalysis /></el-icon>
        分析数据
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" size="small">
        <el-form-item label="选择产品">
          <el-select v-model="filters.productIds" multiple placeholder="全部产品" clearable style="width: 300px">
            <el-option v-for="p in products" :key="p.product_id" :label="p.product_name" :value="p.product_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchTrends">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #67c23a">{{ summary.total_sales }}</div>
            <div class="stat-label">总销量</div>
            <div class="stat-trend up" v-if="summary.sales_change">
              <el-icon><TrendCharts /></el-icon>
              {{ summary.sales_change > 0 ? '+' : '' }}{{ summary.sales_change }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #409eff">{{ formatNumber(summary.total_favorites) }}</div>
            <div class="stat-label">总收藏量</div>
            <div class="stat-trend up" v-if="summary.favorites_change">
              <el-icon><TrendCharts /></el-icon>
              {{ summary.favorites_change > 0 ? '+' : '' }}{{ summary.favorites_change }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #e6a23c">{{ formatNumber(summary.total_views) }}</div>
            <div class="stat-label">总浏览量</div>
            <div class="stat-trend up" v-if="summary.views_change">
              <el-icon><TrendCharts /></el-icon>
              {{ summary.views_change > 0 ? '+' : '' }}{{ summary.views_change }}%
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #909399">{{ summary.conversion_rate }}%</div>
            <div class="stat-label">收藏转化率</div>
            <div class="stat-trend" style="color: #909399">
              (收藏/浏览)
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>运营数据趋势</span>
              <div class="metrics-selector">
                <el-checkbox-group v-model="selectedMetrics">
                  <el-checkbox value="sales">销量</el-checkbox>
                  <el-checkbox value="favorites">收藏量</el-checkbox>
                  <el-checkbox value="views">浏览量</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <span>数据相关性</span>
          </template>
          <div class="correlation-section">
            <div class="correlation-matrix">
              <div class="matrix-header">
                <div></div>
                <div v-for="(col, idx) in correlation.variables" :key="idx" class="matrix-cell-header">
                  {{ getMetricLabel(col) }}
                </div>
              </div>
              <div v-for="(row, rowIdx) in correlation.matrix" :key="rowIdx" class="matrix-row">
                <div class="matrix-cell-header">{{ getMetricLabel(correlation.variables[rowIdx]) }}</div>
                <div
                  v-for="(cell, colIdx) in row"
                  :key="colIdx"
                  :class="['correlation-cell', { diagonal: rowIdx === colIdx }]"
                  :style="{ backgroundColor: getCorrelationColor(cell) }"
                >
                  <span class="cell-value">{{ cell.toFixed(2) }}</span>
                  <span class="cell-label">{{ correlation.labels[rowIdx][colIdx] }}</span>
                </div>
              </div>
            </div>
            <div class="correlation-legend">
              <div class="legend-title">图例说明</div>
              <div class="legend-items">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #67c23a"></span>
                  <span>极强相关</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #409eff"></span>
                  <span>强相关</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #e6a23c"></span>
                  <span>中度相关</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #c0c4cc"></span>
                  <span>弱/无相关</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="table-card" style="margin-top: 20px">
      <template #header>
        <span>详细数据</span>
      </template>
      <el-table :data="trendData" stripe border style="width: 100%">
        <el-table-column prop="product_name" label="产品名称" width="180" />
        <el-table-column prop="date" label="日期" width="140" sortable>
          <template #default="{ row }">
            {{ row.date }}
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" sortable>
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: 500">{{ row.sales }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="favorites" label="收藏量" width="100" sortable>
          <template #default="{ row }">
            <span style="color: #409eff">{{ row.favorites || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="120" sortable>
          <template #default="{ row }">
            <span style="color: #e6a23c">{{ row.views || 0 }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { productMonitorApi } from '@/api'

const trendChartRef = ref(null)
let trendChart = null

const products = ref([])
const trendData = ref([])
const selectedMetrics = ref(['sales', 'favorites'])

const filters = reactive({
  productIds: [],
  dateRange: []
})

const summary = reactive({
  total_sales: 0,
  total_favorites: 0,
  total_views: 0,
  conversion_rate: 0,
  sales_change: 0,
  favorites_change: 0,
  views_change: 0
})

const correlation = reactive({
  variables: [],
  matrix: [],
  labels: []
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const getMetricLabel = (metric) => {
  const labels = {
    sales: '销量',
    favorites: '收藏',
    views: '浏览'
  }
  return labels[metric] || metric
}

const getCorrelationColor = (coeff) => {
  const abs = Math.abs(coeff)
  if (abs >= 0.8) return '#67c23a30'
  if (abs >= 0.6) return '#409eff30'
  if (abs >= 0.4) return '#e6a23c30'
  return '#c0c4cc30'
}

const fetchProducts = async () => {
  products.value = await productMonitorApi.getProducts()
}

const fetchTrends = async () => {
  trendData.value = await productMonitorApi.getTrends({
    product_ids: filters.productIds.length ? filters.productIds : undefined
  })
  updateChart()
}

const handleAnalyze = async () => {
  const result = await productMonitorApi.analyze({
    product_ids: filters.productIds.length ? filters.productIds : undefined,
    start_date: filters.dateRange?.[0] || '2026-04-01',
    end_date: filters.dateRange?.[1] || '2026-04-30',
    metrics: ['sales', 'favorites', 'views']
  })
  
  Object.assign(summary, result.summary)
  Object.assign(correlation, result.correlation)
  trendData.value = result.trends
  updateChart()
}

const initChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销量', '收藏量', '浏览量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '销量/收藏',
        position: 'left'
      },
      {
        type: 'value',
        name: '浏览量',
        position: 'right'
      }
    ],
    series: [
      {
        name: '销量',
        type: 'line',
        smooth: true,
        data: [],
        itemStyle: { color: '#67c23a' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '收藏量',
        type: 'line',
        smooth: true,
        data: [],
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        }
      },
      {
        name: '浏览量',
        type: 'line',
        smooth: true,
        data: [],
        yAxisIndex: 1,
        itemStyle: { color: '#e6a23c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
          ])
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

const updateChart = () => {
  if (!trendChart || trendData.value.length === 0) return
  
  const dates = [...new Set(trendData.value.map(d => d.date))].sort()
  const salesData = dates.map(date => {
    const items = trendData.value.filter(d => d.date === date)
    return items.reduce((sum, d) => sum + (d.sales || 0), 0)
  })
  const favoritesData = dates.map(date => {
    const items = trendData.value.filter(d => d.date === date)
    return items.reduce((sum, d) => sum + (d.favorites || 0), 0)
  })
  const viewsData = dates.map(date => {
    const items = trendData.value.filter(d => d.date === date)
    return items.reduce((sum, d) => sum + (d.views || 0), 0)
  })
  
  trendChart.setOption({
    xAxis: { data: dates },
    series: [
      { data: salesData },
      { data: favoritesData },
      { data: viewsData }
    ]
  })
}

watch(selectedMetrics, () => {
  if (!trendChart) return
  const visible = {
    sales: selectedMetrics.value.includes('sales'),
    favorites: selectedMetrics.value.includes('favorites'),
    views: selectedMetrics.value.includes('views')
  }
  trendChart.setOption({
    series: [
      { name: '销量', showSymbol: visible.sales },
      { name: '收藏量', showSymbol: visible.favorites },
      { name: '浏览量', showSymbol: visible.views }
    ]
  })
}, { deep: true })

onMounted(() => {
  fetchProducts()
  fetchTrends()
  handleAnalyze()
  nextTick(() => {
    initChart()
  })
})
</script>

<style scoped>
.product-monitor-page {
  max-width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.chart-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.correlation-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.correlation-matrix {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-self: center;
}

.matrix-header {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.matrix-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.matrix-cell-header {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.correlation-cell {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.correlation-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.correlation-cell.diagonal {
  background-color: #ecf5ff !important;
}

.cell-value {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.cell-label {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
}

.correlation-legend {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.legend-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 13px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.table-card {
  margin-top: 20px;
}
</style>
