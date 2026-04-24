import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled', permission: 'dashboard' }
      },
      {
        path: 'checkin',
        name: 'Checkin',
        component: () => import('@/views/checkin/Checkin.vue'),
        meta: { title: '打卡管理', icon: 'Clock', permission: 'checkin' }
      },
      {
        path: 'checkin-list',
        name: 'CheckinList',
        component: () => import('@/views/checkin/CheckinList.vue'),
        meta: { title: '打卡记录', icon: 'List', permission: 'checkin' }
      },
      {
        path: 'recheck-approval',
        name: 'RecheckApproval',
        component: () => import('@/views/approval/RecheckApproval.vue'),
        meta: { title: '补卡审批', icon: 'EditPen', permission: 'checkin-approval' }
      },
      {
        path: 'leave',
        name: 'Leave',
        component: () => import('@/views/leave-overtime/Leave.vue'),
        meta: { title: '请假管理', icon: 'Calendar', permission: 'leave-overtime' }
      },
      {
        path: 'overtime',
        name: 'Overtime',
        component: () => import('@/views/leave-overtime/Overtime.vue'),
        meta: { title: '加班管理', icon: 'Timer', permission: 'leave-overtime' }
      },
      {
        path: 'schedule',
        name: 'Schedule',
        component: () => import('@/views/schedule/Schedule.vue'),
        meta: { title: '排班管理', icon: 'SetUp', permission: 'schedule' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Statistics.vue'),
        meta: { title: '考勤统计', icon: 'DataAnalysis', permission: 'statistics' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User', permission: 'user-management' }
      },
      {
        path: 'role-management',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色权限', icon: 'Lock', permission: 'role-management' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人信息', icon: 'User', requiresAuth: true }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('@/views/ChangePassword.vue'),
        meta: { title: '修改密码', icon: 'Lock', requiresAuth: true }
      }
    ]
  },
  {
    path: '/data-screen',
    name: 'DataScreen',
    component: () => import('@/views/DataScreen.vue'),
    meta: { title: '数据大屏', requiresAuth: true, permission: 'data-screen' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  document.title = `${to.meta.title} - 企业考勤打卡系统` || '企业考勤打卡系统'
  
  if (to.meta.requiresAuth === false) {
    if (to.path === '/login' && userStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
    return
  }
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }
  
  if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
    ElMessage.error('您没有权限访问此页面')
    next('/dashboard')
    return
  }
  
  next()
})

export default router
