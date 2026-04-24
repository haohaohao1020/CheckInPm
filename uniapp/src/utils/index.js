import dayjs from 'dayjs'

export const statusMap = {
  normal: { label: '正常', type: 'success', color: '#67c23a' },
  late: { label: '迟到', type: 'warning', color: '#e6a23c' },
  early: { label: '早退', type: 'warning', color: '#f56c6c' },
  absent: { label: '缺勤', type: 'danger', color: '#f56c6c' },
  pending: { label: '待审批', type: 'warning', color: '#e6a23c' },
  approved: { label: '已通过', type: 'success', color: '#67c23a' },
  rejected: { label: '已拒绝', type: 'danger', color: '#f56c6c' }
}

export const getStatusInfo = (status) => {
  return statusMap[status] || { label: status, type: 'info', color: '#909399' }
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

export const getRoleName = (role) => {
  const roleMap = {
    admin: '超级管理员',
    manager: '部门经理',
    user: '普通员工'
  }
  return roleMap[role] || role
}

export const storage = {
  set(key, value) {
    uni.setStorageSync(key, JSON.stringify(value))
  },
  get(key) {
    const value = uni.getStorageSync(key)
    try {
      return value ? JSON.parse(value) : null
    } catch {
      return value
    }
  },
  remove(key) {
    uni.removeStorageSync(key)
  },
  clear() {
    uni.clearStorageSync()
  }
}

export const showToast = (title, icon = 'none', duration = 2000) => {
  uni.showToast({
    title,
    icon,
    duration
  })
}

export const showLoading = (title = '加载中...') => {
  uni.showLoading({
    title,
    mask: true
  })
}

export const hideLoading = () => {
  uni.hideLoading()
}

export const showModal = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    uni.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export default {
  statusMap,
  getStatusInfo,
  formatDate,
  formatDateTime,
  getCurrentTime,
  getCurrentDate,
  getWeekDay,
  getRoleName,
  storage,
  showToast,
  showLoading,
  hideLoading,
  showModal
}
