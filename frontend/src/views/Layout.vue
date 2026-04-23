<template>
  <el-container class="main-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <el-icon :size="24"><TrendCharts /></el-icon>
        </div>
        <span class="logo-text">SellWise</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#1a1a2e"
        text-color="#a0a3b1"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/import">
          <el-icon><UploadFilled /></el-icon>
          <span>数据导入</span>
        </el-menu-item>
        <el-menu-item index="/hot-products">
          <el-icon><TrendCharts /></el-icon>
          <span>热点选款</span>
        </el-menu-item>
        <el-menu-item index="/product-monitor">
          <el-icon><Monitor /></el-icon>
          <span>产品监控</span>
        </el-menu-item>
        <el-menu-item index="/influencer">
          <el-icon><User /></el-icon>
          <span>达人分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.main-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  background-color: #1a1a2e;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  border-right: none;
  padding-top: 16px;
}

.sidebar-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 12px;
}

.main-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
