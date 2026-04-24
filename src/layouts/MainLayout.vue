<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-title">
        <el-icon size="24"><OfficeBuilding /></el-icon>
        <span style="margin-left: 10px;">企业考勤打卡系统</span>
      </div>
      
      <div class="header-user">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar :size="32" :src="userStore.userInfo.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span style="margin-left: 8px;">{{ userStore.userInfo.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-dropdown-item>
              <el-dropdown-item command="changePassword">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <el-container>
      <el-aside :width="appStore.isSidebarCollapsed ? '64px' : '200px'">
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.isSidebarCollapsed"
          :collapse-transition="false"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
          class="sidebar-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-sub-menu index="checkin-group">
            <template #title>
              <el-icon><Clock /></el-icon>
              <span>打卡管理</span>
            </template>
            <el-menu-item index="/checkin" v-if="hasPermission('checkin')">
              <el-icon><Edit /></el-icon>
              <span>打卡签到</span>
            </el-menu-item>
            <el-menu-item index="/checkin-list" v-if="hasPermission('checkin')">
              <el-icon><List /></el-icon>
              <span>打卡记录</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/recheck-approval" v-if="hasPermission('checkin-approval')">
            <el-icon><EditPen /></el-icon>
            <template #title>补卡审批</template>
          </el-menu-item>
          
          <el-sub-menu index="leave-group">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>请假加班</span>
            </template>
            <el-menu-item index="/leave" v-if="hasPermission('leave-overtime')">
              <el-icon><ChatDotRound /></el-icon>
              <span>请假管理</span>
            </el-menu-item>
            <el-menu-item index="/overtime" v-if="hasPermission('leave-overtime')">
              <el-icon><Timer /></el-icon>
              <span>加班管理</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/schedule" v-if="hasPermission('schedule')">
            <el-icon><SetUp /></el-icon>
            <template #title>排班管理</template>
          </el-menu-item>
          
          <el-menu-item index="/statistics" v-if="hasPermission('statistics')">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>考勤统计</template>
          </el-menu-item>
          
          <el-menu-item index="/data-screen" v-if="hasPermission('data-screen')">
            <el-icon><Monitor /></el-icon>
            <template #title>数据大屏</template>
          </el-menu-item>
          
          <el-sub-menu index="system-group" v-if="hasPermission('user-management') || hasPermission('role-management')">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/user-management" v-if="hasPermission('user-management')">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/role-management" v-if="hasPermission('role-management')">
              <el-icon><Lock /></el-icon>
              <span>角色权限</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore, useAppStore } from '@/store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const hasPermission = (permission) => {
  return userStore.hasPermission(permission)
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      router.push('/change-password')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.handleLogout()
        router.push('/login')
        ElMessage.success('已退出登录')
      }).catch(() => {})
      break
  }
}
</script>
