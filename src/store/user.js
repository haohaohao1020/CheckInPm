import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getUserInfo } from '@/api'
import { storage } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const token = ref(storage.get('token') || '')
  const userInfo = ref(storage.get('userInfo') || {})
  const permissions = ref(storage.get('permissions') || [])

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value.role === 'admin')
  const isManager = computed(() => userInfo.value.role === 'manager' || userInfo.value.role === 'admin')

  const handleLogin = async (loginData) => {
    const res = await login(loginData)
    if (res.code === 200) {
      token.value = res.data.token
      userInfo.value = res.data.userInfo
      permissions.value = res.data.permissions
      
      storage.set('token', res.data.token)
      storage.set('userInfo', res.data.userInfo)
      storage.set('permissions', res.data.permissions)
    }
    return res
  }

  const handleLogout = () => {
    token.value = ''
    userInfo.value = {}
    permissions.value = []
    
    storage.remove('token')
    storage.remove('userInfo')
    storage.remove('permissions')
  }

  const fetchUserInfo = async () => {
    const res = await getUserInfo()
    if (res.code === 200) {
      userInfo.value = res.data.userInfo
      permissions.value = res.data.permissions
      
      storage.set('userInfo', res.data.userInfo)
      storage.set('permissions', res.data.permissions)
    }
    return res
  }

  const hasPermission = (permission) => {
    if (!permission) return true
    return permissions.value.includes(permission)
  }

  return {
    token,
    userInfo,
    permissions,
    isLoggedIn,
    isAdmin,
    isManager,
    handleLogin,
    handleLogout,
    fetchUserInfo,
    hasPermission
  }
})
