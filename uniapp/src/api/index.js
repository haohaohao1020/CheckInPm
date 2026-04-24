import { get, post } from './request'

export const login = (data) => post('/login', data)

export const getUserInfo = () => get('/user/info')

export const getTodayCheckin = () => get('/checkin/today')

export const doCheckin = (data) => post('/checkin/do', data)

export const getCheckinList = (params) => get('/checkin/list', params)

export const getLeaveList = (params) => get('/leave/list', params)

export const applyLeave = (data) => post('/leave/apply', data)

export const getOvertimeList = (params) => get('/overtime/list', params)

export const applyOvertime = (data) => post('/overtime/apply', data)

export const applyRecheck = (data) => post('/recheck/apply', data)

export const getStatisticsOverview = () => get('/statistics/overview')

export const updateUserInfo = (data) => post('/user/update', data)

export const changePassword = (data) => post('/user/change-password', data)

export default {
  login,
  getUserInfo,
  getTodayCheckin,
  doCheckin,
  getCheckinList,
  getLeaveList,
  applyLeave,
  getOvertimeList,
  applyOvertime,
  applyRecheck,
  getStatisticsOverview,
  updateUserInfo,
  changePassword
}
