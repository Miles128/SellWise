<template>
  <div class="import-page">
    <div class="page-header">
      <h2>数据导入</h2>
      <el-button type="primary" @click="handleQuickImport">
        <el-icon><Upload /></el-icon>
        快速导入示例数据
      </el-button>
    </div>

    <el-steps :active="currentStep" finish-status="success" align-center class="import-steps">
      <el-step title="上传文件" />
      <el-step title="选择工作表" />
      <el-step title="字段映射" />
      <el-step title="确认导入" />
    </el-steps>

    <el-card class="step-card">
      <!-- Step 1: 上传文件 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :limit="1"
          accept=".xlsx,.xls,.csv"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .xlsx, .xls, .csv 格式文件
            </div>
          </template>
        </el-upload>

        <div v-if="uploadedFile" class="file-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">{{ uploadedFile.filename }}</el-descriptions-item>
            <el-descriptions-item label="工作表数量">{{ uploadedFile.sheets.length }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="step-actions">
          <el-button type="primary" @click="nextStep" :disabled="!uploadedFile">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 2: 选择工作表和数据类型 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-form :model="form" label-width="120px">
          <el-form-item label="导入类型">
            <el-select v-model="form.dataType" placeholder="请选择导入类型" style="width: 300px">
              <el-option label="热点选款数据" value="hot_products" />
              <el-option label="产品监控数据" value="product_monitor" />
              <el-option label="达人分析数据" value="influencer" />
            </el-select>
          </el-form-item>
          <el-form-item label="工作表">
            <el-select v-model="form.sheetName" placeholder="请选择工作表" style="width: 300px">
              <el-option
                v-for="sheet in uploadedFile.sheets"
                :key="sheet.name"
                :label="`${sheet.name} (${sheet.row_count} 行, ${sheet.column_count} 列)`"
                :value="sheet.name"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <div v-if="form.sheetName" class="preview-section">
          <h4>数据预览</h4>
          <el-table :data="currentSheet.sample_data" border size="small" max-height="200">
            <el-table-column
              v-for="col in currentSheet.columns"
              :key="col"
              :prop="col"
              :label="col"
              :min-width="120"
            />
          </el-table>
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!form.dataType || !form.sheetName">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 3: 字段映射 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="mapping-header">
          <div class="mapping-title">
            <span>系统字段</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            <span>Excel 列名</span>
          </div>
          <div class="mapping-actions">
            <el-button size="small" @click="autoMatch">
              <el-icon><MagicStick /></el-icon>
              智能匹配
            </el-button>
            <el-button size="small" @click="resetMapping">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>

        <div class="mapping-table">
          <div class="field-mapping-row" v-for="(item, index) in mappingFields" :key="item.system_field">
            <div class="system-field">
              <span class="label">{{ item.description }}</span>
              <span v-if="item.is_required" class="required">*</span>
              <span class="description">({{ item.system_field }})</span>
            </div>
            <div class="mapping-arrow">←</div>
            <div class="excel-column">
              <el-select
                v-model="item.excel_column"
                placeholder="请选择 Excel 列"
                clearable
                style="width: 200px"
              >
                <el-option
                  v-for="col in currentSheet.columns"
                  :key="col"
                  :label="col"
                  :value="col"
                />
              </el-select>
            </div>
          </div>
        </div>

        <div class="save-template">
          <el-checkbox v-model="form.saveAsTemplate">保存为模板</el-checkbox>
          <el-input
            v-if="form.saveAsTemplate"
            v-model="form.templateName"
            placeholder="模板名称"
            style="width: 200px; margin-left: 12px"
          />
        </div>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep" :disabled="!isMappingValid">
            下一步
          </el-button>
        </div>
      </div>

      <!-- Step 4: 确认导入 -->
      <div v-if="currentStep === 3" class="step-content">
        <el-result
          icon="info"
          title="确认导入数据"
          :sub-title="`即将导入 ${currentSheet.row_count} 行数据到 ${dataTypeLabel} 模块`"
        >
          <template #extra>
            <el-descriptions :column="2" border size="small" class="confirm-info">
              <el-descriptions-item label="导入类型">{{ dataTypeLabel }}</el-descriptions-item>
              <el-descriptions-item label="工作表">{{ form.sheetName }}</el-descriptions-item>
              <el-descriptions-item label="数据行数">{{ currentSheet.row_count }}</el-descriptions-item>
              <el-descriptions-item label="数据列数">{{ currentSheet.column_count }}</el-descriptions-item>
            </el-descriptions>
          </template>
        </el-result>

        <div class="step-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importing">
            确认导入
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { importApi } from '@/api'

const currentStep = ref(0)
const uploading = ref(false)
const importing = ref(false)
const uploadedFile = ref(null)

const form = reactive({
  dataType: '',
  sheetName: '',
  saveAsTemplate: false,
  templateName: ''
})

const mappingFields = ref([])

const dataTypeLabel = computed(() => {
  const labels = {
    hot_products: '热点选款',
    product_monitor: '产品监控',
    influencer: '达人分析'
  }
  return labels[form.dataType] || ''
})

const currentSheet = computed(() => {
  if (!uploadedFile.value || !form.sheetName) return null
  return uploadedFile.value.sheets.find(s => s.name === form.sheetName)
})

const isMappingValid = computed(() => {
  const requiredFields = mappingFields.value.filter(f => f.is_required)
  return requiredFields.every(f => f.excel_column)
})

const handleFileChange = (file) => {
  uploading.value = true
  importApi.upload(file.raw).then(res => {
    uploadedFile.value = res
    ElMessage.success('文件解析成功')
  }).finally(() => {
    uploading.value = false
  })
}

const nextStep = async () => {
  if (currentStep.value === 1) {
    await loadSystemFields()
  }
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const loadSystemFields = async () => {
  const templates = await importApi.getTemplates()
  const dataTypeTemplate = templates.find(t => t.data_type === form.dataType)
  if (dataTypeTemplate) {
    mappingFields.value = dataTypeTemplate.fields.map(f => ({
      ...f,
      excel_column: null
    }))
  }
}

const autoMatch = () => {
  if (!currentSheet.value) return
  
  mappingFields.value.forEach(field => {
    const matchedCol = currentSheet.value.columns.find(col => {
      const colLower = col.toLowerCase()
      const fieldLower = field.system_field.toLowerCase()
      const descLower = field.description.toLowerCase()
      return colLower.includes(fieldLower) || fieldLower.includes(colLower) ||
             colLower.includes(descLower) || descLower.includes(colLower)
    })
    if (matchedCol) {
      field.excel_column = matchedCol
    }
  })
  ElMessage.success('智能匹配完成')
}

const resetMapping = () => {
  mappingFields.value.forEach(field => {
    field.excel_column = null
  })
  ElMessage.info('已重置映射')
}

const confirmImport = async () => {
  importing.value = true
  try {
    const result = await importApi.confirm({
      data_type: form.dataType,
      sheet_name: form.sheetName
    })
    ElMessage.success(`导入成功，共 ${result.row_count} 条数据`)
    resetForm()
  } finally {
    importing.value = false
  }
}

const handleQuickImport = async () => {
  if (!form.dataType) {
    ElMessage.warning('请先选择导入类型')
    return
  }
  importing.value = true
  try {
    const result = await importApi.confirm({
      data_type: form.dataType,
      sheet_name: 'Sheet1'
    })
    ElMessage.success(`快速导入成功，共 ${result.row_count} 条示例数据`)
  } finally {
    importing.value = false
  }
}

const resetForm = () => {
  currentStep.value = 0
  uploadedFile.value = null
  form.dataType = ''
  form.sheetName = ''
  form.saveAsTemplate = false
  form.templateName = ''
  mappingFields.value = []
}
</script>

<style scoped>
.import-page {
  max-width: 900px;
}

.import-steps {
  margin-bottom: 32px;
}

.step-card {
  min-height: 400px;
}

.step-content {
  padding: 20px;
}

.file-info {
  margin-top: 24px;
}

.preview-section {
  margin-top: 24px;
}

.preview-section h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.mapping-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.mapping-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.arrow-icon {
  margin: 0 12px;
  color: #909399;
}

.mapping-actions {
  display: flex;
  gap: 8px;
}

.mapping-table {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.save-template {
  margin-top: 24px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.step-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirm-info {
  max-width: 500px;
  margin: 0 auto;
}
</style>
