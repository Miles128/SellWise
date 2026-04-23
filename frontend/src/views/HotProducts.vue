<template>
  <div class="hot-products-page">
    <div class="page-header">
      <h2>热点选款</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        手动新增
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" size="small">
        <el-form-item label="平台">
          <el-select v-model="filters.platforms" multiple placeholder="全部平台" clearable style="width: 200px">
            <el-option v-for="p in platforms" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="热度指数">
          <el-input-number v-model="filters.minHeat" :min="0" placeholder="最小值" size="small" />
          <span style="margin: 0 8px">至</span>
          <el-input-number v-model="filters.maxHeat" :min="0" placeholder="最大值" size="small" />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="商品名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>商品列表</span>
          <span style="font-size: 12px; color: #909399">共 {{ total }} 个商品</span>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @sort-change="handleSort"
      >
        <el-table-column prop="product_name" label="商品名称" min-width="200">
          <template #default="{ row }">
            <div class="product-cell">
              <div class="product-name">{{ row.product_name }}</div>
              <div class="product-platform">
                <span :class="`platform-tag ${row.platform}`">{{ getPlatformLabel(row.platform) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="heat_index" label="热度指数" min-width="180" sortable="custom">
          <template #default="{ row }">
            <div class="heat-index">
              <div class="bar">
                <div class="bar-fill" :style="{ width: getHeatPercent(row.heat_index) + '%' }"></div>
              </div>
              <span class="heat-value">{{ formatNumber(row.heat_index) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="avg_price" label="平均价格" width="120" sortable="custom">
          <template #default="{ row }">
            <span v-if="row.avg_price">¥{{ row.avg_price.toFixed(2) }}</span>
            <span v-else class="empty-value">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="data_source" label="数据来源" width="120">
          <template #default="{ row }">
            <span>{{ row.data_source || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="viewDetail(row)">详情</el-button>
            <el-button type="success" link size="small" @click="addToMonitor(row)">加入监控</el-button>
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

    <el-dialog v-model="showAddDialog" title="新增商品" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="商品名称" required>
          <el-input v-model="addForm.product_name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="平台" required>
          <el-select v-model="addForm.platform" placeholder="请选择平台" style="width: 100%">
            <el-option v-for="p in platforms" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="热度指数" required>
          <el-input-number v-model="addForm.heat_index" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="平均价格">
          <el-input-number v-model="addForm.avg_price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数据来源">
          <el-input v-model="addForm.data_source" placeholder="请输入数据来源" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" :title="detailRow?.product_name" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="商品名称">{{ detailRow?.product_name }}</el-descriptions-item>
        <el-descriptions-item label="平台">
          <span :class="`platform-tag ${detailRow?.platform}`">{{ getPlatformLabel(detailRow?.platform) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="热度指数">{{ formatNumber(detailRow?.heat_index) }}</el-descriptions-item>
        <el-descriptions-item label="平均价格">
          <span v-if="detailRow?.avg_price">¥{{ detailRow?.avg_price.toFixed(2) }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="数据来源" :span="2">{{ detailRow?.data_source || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="success" @click="addToMonitor(detailRow); showDetailDialog = false">
          加入产品监控
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { hotProductsApi } from '@/api'

const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const platforms = ref([])
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const detailRow = ref(null)
const maxHeat = ref(100000)

const filters = reactive({
  platforms: [],
  minHeat: undefined,
  maxHeat: undefined,
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20
})

const addForm = reactive({
  product_name: '',
  platform: '',
  heat_index: 0,
  avg_price: null,
  data_source: ''
})

const getPlatformLabel = (value) => {
  const p = platforms.value.find(item => item.value === value)
  return p ? p.label : value
}

const getHeatPercent = (value) => {
  return Math.min(100, (value / maxHeat.value) * 100)
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const fetchPlatforms = async () => {
  platforms.value = await hotProductsApi.getPlatforms()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
      keyword: filters.keyword || undefined,
      platforms: filters.platforms.length ? filters.platforms : undefined,
      min_heat: filters.minHeat,
      max_heat: filters.maxHeat
    }
    
    const result = await hotProductsApi.getList(params)
    tableData.value = result.data
    total.value = result.total
    
    if (tableData.value.length > 0) {
      maxHeat.value = Math.max(...tableData.value.map(d => d.heat_index))
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  filters.platforms = []
  filters.minHeat = undefined
  filters.maxHeat = undefined
  filters.keyword = ''
  pagination.page = 1
  fetchData()
}

const handleSort = ({ prop, order }) => {
  fetchData()
}

const viewDetail = (row) => {
  detailRow.value = row
  showDetailDialog.value = true
}

const addToMonitor = async (row) => {
  await hotProductsApi.addToMonitor(row.id)
  ElMessage.success('商品已加入产品监控')
}

const handleAdd = async () => {
  if (!addForm.product_name || !addForm.platform) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  await hotProductsApi.add({
    ...addForm,
    id: 'SP' + Date.now().toString().slice(-6)
  })
  
  ElMessage.success('商品添加成功')
  showAddDialog.value = false
  fetchData()
}

onMounted(() => {
  fetchPlatforms()
  fetchData()
})
</script>

<style scoped>
.hot-products-page {
  max-width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
  color: #303133;
}

.product-platform {
  margin-top: 4px;
}

.empty-value {
  color: #c0c4cc;
}
</style>
