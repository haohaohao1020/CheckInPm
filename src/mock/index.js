import Mock from 'mockjs'
import dayjs from 'dayjs'

const Random = Mock.Random

const users = [
  { id: 1, username: 'admin', password: '123456', name: '管理员', role: 'admin', department: '技术部', avatar: Random.image('100x100', '#4A7BF7', 'Admin') },
  { id: 2, username: 'manager', password: '123456', name: '经理', role: 'manager', department: '销售部', avatar: Random.image('100x100', '#894FC4', 'Manager') },
  { id: 3, username: 'user1', password: '123456', name: '张三', role: 'user', department: '技术部', avatar: Random.image('100x100', '#FF847C', '张') },
  { id: 4, username: 'user2', password: '123456', name: '李四', role: 'user', department: '技术部', avatar: Random.image('100x100', '#FE8179', '李') },
  { id: 5, username: 'user3', password: '123456', name: '王五', role: 'user', department: '销售部', avatar: Random.image('100x100', '#27AE60', '王') }
]

const roles = {
  admin: {
    name: '超级管理员',
    permissions: ['dashboard', 'checkin', 'checkin-approval', 'leave-overtime', 'schedule', 'statistics', 'data-screen', 'export', 'user-management', 'role-management']
  },
  manager: {
    name: '部门经理',
    permissions: ['dashboard', 'checkin', 'checkin-approval', 'leave-overtime', 'schedule', 'statistics', 'export']
  },
  user: {
    name: '普通员工',
    permissions: ['dashboard', 'checkin', 'leave-overtime', 'statistics']
  }
}

const checkinRecords = Mock.mock({
  'list|100': [{
    'id|+1': 1,
    'userId|3-5': 3,
    'userName': function() {
      return users.find(u => u.id === this.userId)?.name || Random.cname()
    },
    'department': function() {
      return users.find(u => u.id === this.userId)?.department || '技术部'
    },
    'date': function() {
      return Random.date('yyyy-MM-dd')
    },
    'checkinTime': function() {
      const hour = Random.integer(7, 10)
      const minute = Random.integer(0, 59)
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    },
    'checkoutTime': function() {
      const hour = Random.integer(17, 20)
      const minute = Random.integer(0, 59)
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    },
    'checkinStatus': function() {
      const time = this.checkinTime
      if (time < '08:30') return 'normal'
      if (time < '09:00') return 'late'
      return 'absent'
    },
    'checkoutStatus': function() {
      const time = this.checkoutTime
      if (time >= '18:00') return 'normal'
      if (time >= '17:00') return 'early'
      return 'absent'
    },
    'location': Random.city(true)
  }]
})

const leaveRecords = Mock.mock({
  'list|50': [{
    'id|+1': 1,
    'userId|3-5': 3,
    'userName': function() {
      return users.find(u => u.id === this.userId)?.name || Random.cname()
    },
    'department': function() {
      return users.find(u => u.id === this.userId)?.department || '技术部'
    },
    'type|1': ['年假', '病假', '事假', '婚假', '产假'],
    'startDate': Random.date('yyyy-MM-dd'),
    'endDate': function() {
      const start = dayjs(this.startDate)
      const days = Random.integer(1, 5)
      return start.add(days, 'day').format('YYYY-MM-DD')
    },
    'days': function() {
      return dayjs(this.endDate).diff(dayjs(this.startDate), 'day') + 1
    },
    'reason': Random.csentence(10, 30),
    'status|1': ['pending', 'approved', 'rejected'],
    'createTime': Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'approveTime': function() {
      return this.status === 'pending' ? null : Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    'approveComment': function() {
      return this.status === 'pending' ? null : Random.csentence(5, 15)
    }
  }]
})

const overtimeRecords = Mock.mock({
  'list|30': [{
    'id|+1': 1,
    'userId|3-5': 3,
    'userName': function() {
      return users.find(u => u.id === this.userId)?.name || Random.cname()
    },
    'department': function() {
      return users.find(u => u.id === this.userId)?.department || '技术部'
    },
    'date': Random.date('yyyy-MM-dd'),
    'startTime': function() {
      const hour = Random.integer(18, 20)
      return `${hour.toString().padStart(2, '0')}:00`
    },
    'endTime': function() {
      const hour = Random.integer(21, 23)
      return `${hour.toString().padStart(2, '0')}:00`
    },
    'hours': function() {
      const start = parseInt(this.startTime.split(':')[0])
      const end = parseInt(this.endTime.split(':')[0])
      return end - start
    },
    'reason': Random.csentence(10, 30),
    'status|1': ['pending', 'approved', 'rejected'],
    'createTime': Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'approveTime': function() {
      return this.status === 'pending' ? null : Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    'approveComment': function() {
      return this.status === 'pending' ? null : Random.csentence(5, 15)
    }
  }]
})

const schedules = Mock.mock({
  'list|20': [{
    'id|+1': 1,
    'userId|3-5': 3,
    'userName': function() {
      return users.find(u => u.id === this.userId)?.name || Random.cname()
    },
    'department': function() {
      return users.find(u => u.id === this.userId)?.department || '技术部'
    },
    'scheduleType|1': ['早班', '中班', '晚班', '弹性工作制'],
    'checkinTime': function() {
      const times = { '早班': '08:00', '中班': '09:00', '晚班': '13:00', '弹性工作制': '10:00' }
      return times[this.scheduleType]
    },
    'checkoutTime': function() {
      const times = { '早班': '17:00', '中班': '18:00', '晚班': '22:00', '弹性工作制': '19:00' }
      return times[this.scheduleType]
    },
    'startDate': Random.date('yyyy-MM-dd'),
    'endDate': function() {
      const start = dayjs(this.startDate)
      const months = Random.integer(1, 3)
      return start.add(months, 'month').format('YYYY-MM-dd')
    },
    'status|1': ['active', 'inactive'],
    'createTime': Random.datetime('yyyy-MM-dd HH:mm:ss')
  }]
})

const recheckRecords = Mock.mock({
  'list|20': [{
    'id|+1': 1,
    'userId|3-5': 3,
    'userName': function() {
      return users.find(u => u.id === this.userId)?.name || Random.cname()
    },
    'department': function() {
      return users.find(u => u.id === this.userId)?.department || '技术部'
    },
    'date': Random.date('yyyy-MM-dd'),
    'type|1': ['补签上班卡', '补签下班卡'],
    'originalTime': null,
    'requestTime': function() {
      const hour = this.type === '补签上班卡' ? Random.integer(8, 9) : Random.integer(18, 19)
      const minute = Random.integer(0, 59)
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    },
    'reason': Random.csentence(10, 30),
    'status|1': ['pending', 'approved', 'rejected'],
    'createTime': Random.datetime('yyyy-MM-dd HH:mm:ss'),
    'approveTime': function() {
      return this.status === 'pending' ? null : Random.datetime('yyyy-MM-dd HH:mm:ss')
    },
    'approveComment': function() {
      return this.status === 'pending' ? null : Random.csentence(5, 15)
    }
  }]
})

Mock.setup({ timeout: '200-600' })

Mock.mock(/\/api\/login/, 'post', (options) => {
  const { username, password } = JSON.parse(options.body)
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    const token = Random.string('upper', 32)
    return {
      code: 200,
      data: {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
          avatar: user.avatar
        },
        permissions: roles[user.role].permissions
      },
      message: '登录成功'
    }
  } else {
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }
})

Mock.mock(/\/api\/user\/info/, 'get', (options) => {
  const token = options.headers?.Authorization || ''
  if (token) {
    const user = users[0]
    return {
      code: 200,
      data: {
        userInfo: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
          avatar: user.avatar
        },
        permissions: roles[user.role].permissions
      }
    }
  }
  return {
    code: 401,
    message: '未登录'
  }
})

Mock.mock(/\/api\/checkin\/today/, 'get', () => {
  const now = dayjs()
  const checkinTime = now.hour() >= 8 ? now.format('HH:mm') : null
  const checkoutTime = now.hour() >= 18 ? now.format('HH:mm') : null
  
  return {
    code: 200,
    data: {
      date: now.format('YYYY-MM-DD'),
      checkinTime,
      checkoutTime,
      checkinStatus: checkinTime ? (checkinTime < '08:30' ? 'normal' : 'late') : null,
      checkoutStatus: checkoutTime ? (checkoutTime >= '18:00' ? 'normal' : 'early') : null,
      location: '北京市朝阳区科技园区A座'
    }
  }
})

Mock.mock(/\/api\/checkin\/do/, 'post', (options) => {
  const { type } = JSON.parse(options.body)
  const now = dayjs()
  const time = now.format('HH:mm')
  const status = type === 'checkin' 
    ? (time < '08:30' ? 'normal' : (time < '09:00' ? 'late' : 'absent'))
    : (time >= '18:00' ? 'normal' : (time >= '17:00' ? 'early' : 'absent'))
  
  return {
    code: 200,
    data: {
      type,
      time,
      status,
      location: '北京市朝阳区科技园区A座',
      message: status === 'normal' ? '打卡成功' : (status === 'late' ? '打卡成功（迟到）' : (status === 'early' ? '打卡成功（早退）' : '打卡异常'))
    },
    message: '打卡成功'
  }
})

Mock.mock(/\/api\/checkin\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const department = url.searchParams.get('department')
  const startDate = url.searchParams.get('startDate')
  const endDate = url.searchParams.get('endDate')
  
  let filteredList = [...checkinRecords.list]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (department) {
    filteredList = filteredList.filter(item => item.department === department)
  }
  if (startDate) {
    filteredList = filteredList.filter(item => item.date >= startDate)
  }
  if (endDate) {
    filteredList = filteredList.filter(item => item.date <= endDate)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/leave\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  
  let filteredList = [...leaveRecords.list]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status)
  }
  if (type) {
    filteredList = filteredList.filter(item => item.type === type)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/leave\/apply/, 'post', (options) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id: leaveRecords.list.length + 1,
      ...data,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '申请成功'
  }
})

Mock.mock(/\/api\/leave\/approve/, 'post', (options) => {
  const { id, status, comment } = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id,
      status,
      approveComment: comment,
      approveTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '审批成功'
  }
})

Mock.mock(/\/api\/overtime\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const status = url.searchParams.get('status')
  
  let filteredList = [...overtimeRecords.list]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/overtime\/apply/, 'post', (options) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id: overtimeRecords.list.length + 1,
      ...data,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '申请成功'
  }
})

Mock.mock(/\/api\/overtime\/approve/, 'post', (options) => {
  const { id, status, comment } = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id,
      status,
      approveComment: comment,
      approveTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '审批成功'
  }
})

Mock.mock(/\/api\/schedule\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const department = url.searchParams.get('department')
  
  let filteredList = [...schedules.list]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (department) {
    filteredList = filteredList.filter(item => item.department === department)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/schedule\/add/, 'post', (options) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id: schedules.list.length + 1,
      ...data,
      status: 'active',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '添加成功'
  }
})

Mock.mock(/\/api\/recheck\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const status = url.searchParams.get('status')
  
  let filteredList = [...recheckRecords.list]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.userName.includes(userName))
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/recheck\/apply/, 'post', (options) => {
  const data = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id: recheckRecords.list.length + 1,
      ...data,
      status: 'pending',
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '申请成功'
  }
})

Mock.mock(/\/api\/recheck\/approve/, 'post', (options) => {
  const { id, status, comment } = JSON.parse(options.body)
  return {
    code: 200,
    data: {
      id,
      status,
      approveComment: comment,
      approveTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    },
    message: '审批成功'
  }
})

Mock.mock(/\/api\/statistics\/overview/, 'get', () => {
  const today = dayjs()
  const thisMonth = today.format('YYYY-MM')
  
  const monthCheckin = checkinRecords.list.filter(item => item.date.startsWith(thisMonth))
  
  const normalCount = monthCheckin.filter(item => item.checkinStatus === 'normal' && item.checkoutStatus === 'normal').length
  const lateCount = monthCheckin.filter(item => item.checkinStatus === 'late').length
  const earlyCount = monthCheckin.filter(item => item.checkoutStatus === 'early').length
  const absentCount = monthCheckin.filter(item => item.checkinStatus === 'absent' || item.checkoutStatus === 'absent').length
  
  return {
    code: 200,
    data: {
      totalEmployees: users.length,
      todayCheckin: Math.floor(users.length * 0.85),
      todayLate: Math.floor(users.length * 0.1),
      todayAbsent: Math.floor(users.length * 0.05),
      monthStatistics: {
        normal: normalCount,
        late: lateCount,
        early: earlyCount,
        absent: absentCount
      },
      leavePending: leaveRecords.list.filter(item => item.status === 'pending').length,
      overtimePending: overtimeRecords.list.filter(item => item.status === 'pending').length,
      recheckPending: recheckRecords.list.filter(item => item.status === 'pending').length
    }
  }
})

Mock.mock(/\/api\/statistics\/chart/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const type = url.searchParams.get('type') || 'daily'
  
  let data
  
  if (type === 'daily') {
    const dates = []
    const checkinData = []
    const lateData = []
    
    for (let i = 6; i >= 0; i--) {
      dates.push(dayjs().subtract(i, 'day').format('MM-DD'))
      checkinData.push(Random.integer(40, 50))
      lateData.push(Random.integer(0, 5))
    }
    
    data = { dates, checkinData, lateData }
  } else if (type === 'department') {
    const departments = ['技术部', '销售部', '市场部', '人事部', '财务部']
    const checkinRates = departments.map(() => Random.float(85, 98))
    
    data = { departments, checkinRates }
  } else if (type === 'monthly') {
    const months = []
    const attendanceRates = []
    
    for (let i = 5; i >= 0; i--) {
      months.push(dayjs().subtract(i, 'month').format('YYYY-MM'))
      attendanceRates.push(Random.float(90, 98))
    }
    
    data = { months, attendanceRates }
  }
  
  return {
    code: 200,
    data
  }
})

Mock.mock(/\/api\/user\/list/, 'get', (options) => {
  const url = new URL(`http://localhost${options.url}`)
  const page = parseInt(url.searchParams.get('page')) || 1
  const pageSize = parseInt(url.searchParams.get('pageSize')) || 10
  const userName = url.searchParams.get('userName')
  const department = url.searchParams.get('department')
  const role = url.searchParams.get('role')
  
  let filteredList = [...users]
  
  if (userName) {
    filteredList = filteredList.filter(item => item.name.includes(userName) || item.username.includes(userName))
  }
  if (department) {
    filteredList = filteredList.filter(item => item.department === department)
  }
  if (role) {
    filteredList = filteredList.filter(item => item.role === role)
  }
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = filteredList.slice(start, end)
  
  return {
    code: 200,
    data: {
      list,
      total: filteredList.length,
      page,
      pageSize
    }
  }
})

Mock.mock(/\/api\/export\/checkin/, 'get', (options) => {
  return {
    code: 200,
    data: checkinRecords.list.slice(0, 100),
    message: '导出成功'
  }
})

export default Mock
