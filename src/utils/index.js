import dayjs from 'dayjs'

export const statusMap = {
  normal: { label: '正常', type: 'success', class: 'status-normal' },
  late: { label: '迟到', type: 'warning', class: 'status-late' },
  early: { label: '早退', type: 'warning', class: 'status-early' },
  absent: { label: '缺勤', type: 'danger', class: 'status-danger' },
  pending: { label: '待审批', type: 'warning', class: '' },
  approved: { label: '已通过', type: 'success', class: '' },
  rejected: { label: '已拒绝', type: 'danger', class: '' },
  active: { label: '生效中', type: 'success', class: '' },
  inactive: { label: '已失效', type: 'info', class: '' }
}

export const getStatusInfo = (status) => {
  return statusMap[status] || { label: status, type: 'info', class: '' }
}

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

export const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export const getCurrentTime = () => {
  return dayjs().format('HH:mm:ss')
}

export const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD')
}

export const getWeekDay = (date) => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[dayjs(date).day()]
}

export const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const throttle = (fn, delay = 300) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

export const downloadFile = (blob, fileName) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

export const storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key) {
    const value = localStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  },
  remove(key) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

export const session = {
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
  },
  get(key) {
    const value = sessionStorage.getItem(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  },
  remove(key) {
    sessionStorage.removeItem(key)
  },
  clear() {
    sessionStorage.clear()
  }
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  const clonedObj = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}

export const checkPermission = (permissions, permission) => {
  if (!permissions || !permission) return false
  return permissions.includes(permission)
}

export const getRoleName = (role) => {
  const roleMap = {
    admin: '超级管理员',
    manager: '部门经理',
    user: '普通员工'
  }
  return roleMap[role] || role
}

export default {
  getStatusInfo,
  formatDate,
  formatDateTime,
  getCurrentTime,
  getCurrentDate,
  getWeekDay,
  debounce,
  throttle,
  downloadFile,
  storage,
  session,
  generateId,
  deepClone,
  checkPermission,
  getRoleName
}
