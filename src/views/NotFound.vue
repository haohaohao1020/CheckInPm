<template>
  <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f0f2f5;">
    <div style="font-size: 120px; font-weight: bold; color: #409eff; margin-bottom: 20px;">404</div>
    <div style="font-size: 24px; color: #606266; margin-bottom: 30px;">抱歉，您访问的页面不存在</div>
    <el-button type="primary" size="large" @click="goHome">
      <el-icon><House /></el-icon>
      返回首页
    </el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>
