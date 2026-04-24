import request from './request'

export const login = (data) => request.post('/login', data)

export const getUserInfo = () => request.get('/user/info')

export const getTodayCheckin = () => request.get('/checkin/today')

export const doCheckin = (data) => request.post('/checkin/do', data)

export const getCheckinList = (params) => request.get('/checkin/list', { params })

export const getLeaveList = (params) => request.get('/leave/list', { params })

export const applyLeave = (data) => request.post('/leave/apply', data)

export const approveLeave = (data) => request.post('/leave/approve', data)

export const getOvertimeList = (params) => request.get('/overtime/list', { params })

export const applyOvertime = (data) => request.post('/overtime/apply', data)

export const approveOvertime = (data) => request.post('/overtime/approve', data)

export const getScheduleList = (params) => request.get('/schedule/list', { params })

export const addSchedule = (data) => request.post('/schedule/add', data)

export const getRecheckList = (params) => request.get('/recheck/list', { params })

export const applyRecheck = (data) => request.post('/recheck/apply', data)

export const approveRecheck = (data) => request.post('/recheck/approve', data)

export const getStatisticsOverview = () => request.get('/statistics/overview')

export const getStatisticsChart = (params) => request.get('/statistics/chart', { params })

export const getUserList = (params) => request.get('/user/list', { params })

export const exportCheckin = (params) => request.get('/export/checkin', { params })

export const updateUserInfo = (data) => request.post('/user/update', data)

export const changePassword = (data) => request.post('/user/change-password', data)

export default {
  login,
  getUserInfo,
  getTodayCheckin,
  doCheckin,
  getCheckinList,
  getLeaveList,
  applyLeave,
  approveLeave,
  getOvertimeList,
  applyOvertime,
  approveOvertime,
  getScheduleList,
  addSchedule,
  getRecheckList,
  applyRecheck,
  approveRecheck,
  getStatisticsOverview,
  getStatisticsChart,
  getUserList,
  exportCheckin,
  updateUserInfo,
  changePassword
}
