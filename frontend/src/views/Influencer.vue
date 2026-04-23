<template>
  <div class="influencer-page">
    <div class="page-header">
      <h2>达人带货分析</h2>
      <div class="header-actions">
        <el-button @click="showConfigDialog = true">
          <el-icon><Setting /></el-icon>
          权重配置
        </el-button>
        <el-button type="primary" @click="handleRecalculate">
          <el-icon><Refresh /></el-icon>
          重新计算
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #667eea">{{ summary.total_count }}</div>
            <div class="stat-label">达人总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #67c23a">{{ summary.avg_score }}分</div>
            <div class="stat-label">平均评分</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #409eff">{{ summary.excellent_ratio }}%</div>
            <div class="stat-label">优秀比例</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-stat">
            <div class="stat-value" style="color: #e6a23c">{{ formatNumber(summary.total_weighted_views) }}</div>
            <div class="stat-label">总加权浏览</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" size="small">
        <el-form-item label="评分范围">
          <el-slider
            v-model="filters.scoreRange"
            range
            :min="0"
            :max="100"
            show-input
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>达人评分列表</span>
          <el-tag type="info" effect="plain" size="small">
            当前权重: {{ scoringConfig.correlation_weight }}% 趋势相关 + {{ scoringConfig.views_weight }}% 加权浏览
          </el-tag>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="influencer_name" label="达人名称" min-width="150" fixed="left">
          <template #default="{ row }">
            <div class="influencer-cell">
              <div class="avatar">{{ row.influencer_name.charAt(0) }}</div>
              <span class="name">{{ row.influencer_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_score" label="效果评价分" width="160" sortable>
          <template #default="{ row }">
            <div class="score-cell">
              <div class="score-bar">
                <div class="score-fill" :style="{ width: row.total_score + '%' }"></div>
              </div>
              <span class="score-value">{{ row.total_score.toFixed(1) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="score_level" label="等级" width="100">
          <template #default="{ row }">
            <span :class="['score-level', getLevelClass(row.score_level)]">
              {{ row.score_level }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="correlation_coefficient" label="趋势相关性" width="120">
          <template #default="{ row }">
            <div class="correlation-display">
              <span class="correlation-value">{{ (row.correlation_coefficient * 100).toFixed(0) }}%</span>
              <el-progress 
                :percentage="row.correlation_coefficient * 100" 
                :stroke-width="6"
                :show-text="false"
                :color="getCorrelationColor(row.correlation_coefficient)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="weighted_views" label="加权浏览量" width="120">
          <template #default="{ row }">
            <div class="views-cell">
              <div class="views-value">{{ formatNumber(row.weighted_views) }}</div>
              <div class="views-detail">
                (权重: {{ row.weight_coefficient }}x)
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="linked_product_name" label="关联产品" min-width="150">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.linked_product_name || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="showConfigDialog" title="评分权重配置" width="500px">
      <el-form :model="scoringConfig" label-width="140px">
        <el-form-item label="趋势相关性权重">
          <el-slider
            v-model="scoringConfig.correlation_weight"
            :min="0"
            :max="100"
            :step="10"
            show-input
            :disabled="isLockingWeights"
          />
        </el-form-item>
        <el-form-item label="加权浏览量权重">
          <el-slider
            v-model="scoringConfig.views_weight"
            :min="0"
            :max="100"
            :step="10"
            show-input
            :disabled="isLockingWeights"
          />
        </el-form-item>
        <el-form-item label="锁定权重">
          <el-switch v-model="isLockingWeights" active-text="自动平衡权重" />
        </el-form-item>
      </el-form>
      <el-alert
        title="说明"
        :closable="false"
        type="info"
        show-icon
      >
        <template #default>
          <p>效果评价分 = 趋势相关性分 × W1 + 加权浏览量分 × W2</p>
          <p>两个权重之和必须为 100%</p>
        </template>
      </el-alert>
      <template #footer>
        <el-button @click="showConfigDialog = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="达人详情分析" width="800px">
      <div v-if="detailData" class="detail-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="score-card">
              <div class="score-overview">
                <div class="score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e4e7ed" stroke-width="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" 
                      :stroke="getScoreColor(detailData.total_score)"
                      stroke-width="8"
                      stroke-linecap="round"
                      :stroke-dasharray="getDashArray(detailData.total_score)"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div class="score-text">
                    <span class="score-main">{{ detailData.total_score.toFixed(1) }}</span>
                    <span class="score-suffix">分</span>
                  </div>
                </div>
                <span :class="['score-level', getLevelClass(detailData.score_level), 'large']">
                  {{ detailData.score_level }}
                </span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="达人名称">{{ detailData.influencer_name }}</el-descriptions-item>
              <el-descriptions-item label="帖子ID">{{ detailData.post_id }}</el-descriptions-item>
              <el-descriptions-item label="关联产品">{{ detailData.linked_product_name }}</el-descriptions-item>
              <el-descriptions-item label="产品ID">{{ detailData.linked_product_id }}</el-descriptions-item>
              <el-descriptions-item label="原始浏览量">{{ formatNumber(detailData.raw_views) }}</el-descriptions-item>
              <el-descriptions-item label="加权浏览量">{{ formatNumber(detailData.weighted_views) }}</el-descriptions-item>
              <el-descriptions-item label="用户画像权重">{{ detailData.weight_coefficient }}x</el-descriptions-item>
              <el-descriptions-item label="销量变化">
                <span :class="detailData.sales_change_percent >= 0 ? 'text-success' : 'text-danger'">
                  {{ detailData.sales_change_percent >= 0 ? '+' : '' }}{{ detailData.sales_change_percent }}%
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>评分构成</span>
              </template>
              <div class="score-breakdown">
                <div class="breakdown-item">
                  <div class="breakdown-header">
                    <span class="label">趋势相关性分</span>
                    <span class="value">{{ detailData.correlation_score.toFixed(1) }} 分</span>
                  </div>
                  <el-progress 
                    :percentage="detailData.correlation_score" 
                    :stroke-width="16"
                    :show-text="false"
                    color="#667eea"
                  />
                  <div class="detail-info">
                    相关系数: {{ detailData.correlation_coefficient.toFixed(2) }}
                    <span :class="['badge', getCorrelationBadgeClass(detailData.correlation_coefficient)]">
                      {{ getCorrelationLabel(detailData.correlation_coefficient) }}
                    </span>
                  </div>
                </div>
                <div class="breakdown-item">
                  <div class="breakdown-header">
                    <span class="label">加权浏览量分</span>
                    <span class="value">{{ detailData.views_score.toFixed(1) }} 分</span>
                  </div>
                  <el-progress 
                    :percentage="detailData.views_score" 
                    :stroke-width="16"
                    :show-text="false"
                    color="#67c23a"
                  />
                  <div class="detail-info">
                    原始浏览: {{ formatNumber(detailData.raw_views) }} 
                    × 权重 {{ detailData.weight_coefficient }} = 
                    <strong>{{ formatNumber(detailData.weighted_views) }}</strong>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <template #header>
                <span>用户画像权重分析</span>
              </template>
              <div class="user-profile-weights">
                <div 
                  v-for="(weight, category) in detailData.user_profile_weights" 
                  :key="category"
                  class="weight-item"
                  :class="{ highlight: weight > 1 }"
                >
                  <span class="category">{{ category }}</span>
                  <span class="weight">{{ weight }}x</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card style="margin-top: 20px">
          <template #header>
            <span>分析结论</span>
          </template>
          <div class="analysis-conclusion" v-html="detailData.analysis_conclusion"></div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { influencerApi } from '@/api'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const showConfigDialog = ref(false)
const showDetailDialog = ref(false)
const detailData = ref(null)
const isLockingWeights = ref(true)

const filters = reactive({
  scoreRange: [0, 100]
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

const scoringConfig = reactive({
  correlation_weight: 60,
  views_weight: 40
})

const summary = reactive({
  total_count: 0,
  avg_score: 0,
  excellent_ratio: 0,
  total_weighted_views: 0
})

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const getLevelClass = (level) => {
  const map = {
    '优秀': 'excellent',
    '良好': 'good',
    '一般': 'average',
    '待提升': 'needs-improvement'
  }
  return map[level] || 'average'
}

const getScoreColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#409eff'
  if (score >= 40) return '#e6a23c'
  return '#f56c6c'
}

const getDashArray = (score) => {
  const circumference = 2 * Math.PI * 45
  const dash = circumference * (score / 100)
  return `${dash} ${circumference}`
}

const getCorrelationColor = (coeff) => {
  const abs = Math.abs(coeff)
  if (abs >= 0.8) return '#67c23a'
  if (abs >= 0.6) return '#409eff'
  if (abs >= 0.4) return '#e6a23c'
  return '#909399'
}

const getCorrelationLabel = (coeff) => {
  const abs = Math.abs(coeff)
  if (abs >= 0.8) return '极强相关'
  if (abs >= 0.6) return '强相关'
  if (abs >= 0.4) return '中度相关'
  if (abs >= 0.2) return '弱相关'
  return '无相关'
}

const getCorrelationBadgeClass = (coeff) => {
  const abs = Math.abs(coeff)
  if (abs >= 0.6) return 'success'
  if (abs >= 0.4) return 'warning'
  return 'info'
}

const fetchScoringConfig = async () => {
  const config = await influencerApi.getScoringConfig()
  Object.assign(scoringConfig, config)
}

const fetchData = async () => {
  loading.value = true
  try {
    const result = await influencerApi.getList({
      page: pagination.page,
      page_size: pagination.pageSize,
      min_score: filters.scoreRange[0],
      max_score: filters.scoreRange[1]
    })
    tableData.value = result.data
    total.value = result.total
    Object.assign(summary, result.summary)
  } finally {
    loading.value = false
  }
}

const handleRecalculate = async () => {
  loading.value = true
  try {
    await influencerApi.recalculate()
    ElMessage.success('评分重新计算完成')
    fetchData()
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    await influencerApi.updateScoringConfig(scoringConfig)
    ElMessage.success('权重配置已保存')
    showConfigDialog.value = false
    fetchData()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  }
}

const viewDetail = async (row) => {
  try {
    const detail = await influencerApi.getDetail(row.influencer_id)
    detailData.value = detail
    showDetailDialog.value = true
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

watch(() => scoringConfig.correlation_weight, (newVal) => {
  if (isLockingWeights.value) {
    scoringConfig.views_weight = 100 - newVal
  }
})

watch(() => scoringConfig.views_weight, (newVal) => {
  if (isLockingWeights.value) {
    scoringConfig.correlation_weight = 100 - newVal
  }
})

onMounted(() => {
  fetchScoringConfig()
  fetchData()
})
</script>

<style scoped>
.influencer-page {
  max-width: 100%;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.table-card {
  margin-bottom: 20px;
}

.influencer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.name {
  font-weight: 500;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-bar {
  width: 100px;
  height: 8px;
  background-color: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #67c23a);
  border-radius: 4px;
  transition: width 0.3s;
}

.score-value {
  font-weight: 700;
  font-size: 16px;
  color: #303133;
}

.correlation-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.correlation-value {
  font-size: 14px;
  font-weight: 500;
}

.views-cell {
  display: flex;
  flex-direction: column;
}

.views-value {
  font-weight: 500;
}

.views-detail {
  font-size: 12px;
  color: #909399;
}

.detail-content {
  padding: 10px;
}

.score-card {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.score-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.score-circle svg {
  width: 100%;
  height: 100%;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-main {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
}

.score-suffix {
  font-size: 16px;
  color: #909399;
}

.score-level.large {
  font-size: 16px;
  padding: 8px 20px;
  border-radius: 20px;
}

.score-breakdown {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breakdown-header .label {
  font-weight: 500;
  color: #303133;
}

.breakdown-header .value {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.detail-info {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 8px;
}

.badge.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.badge.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.badge.info {
  background-color: #f4f4f5;
  color: #909399;
}

.user-profile-weights {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.weight-item.highlight {
  background-color: #f0f9eb;
  border: 1px solid #67c23a30;
}

.weight-item.highlight .weight {
  color: #67c23a;
  font-weight: 600;
}

.weight-item .category {
  color: #606266;
}

.weight-item .weight {
  font-weight: 500;
  color: #303133;
}

.analysis-conclusion {
  line-height: 1.8;
  color: #303133;
}

.analysis-conclusion p {
  margin-bottom: 12px;
}

.analysis-conclusion strong {
  color: #667eea;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
