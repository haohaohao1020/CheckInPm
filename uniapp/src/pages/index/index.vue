<template>
  <view class="index-container">
    <view class="header">
      <view class="user-info">
        <view class="avatar">
          <text v-if="userInfo.name">{{ userInfo.name.charAt(0) }}</text>
          <text v-else>用</text>
        </view>
        <view class="user-text">
          <text class="user-name">{{ userInfo.name || '用户' }}</text>
          <text class="user-role">{{ getRoleName(userInfo.role) }} | {{ userInfo.department || '未设置' }}</text>
        </view>
      </view>
      <view class="header-date">
        <text class="date-text">{{ currentDate }}</text>
        <text class="week-text">{{ currentWeekDay }}</text>
      </view>
    </view>

    <view class="current-time">
      <text class="time-text">{{ currentTime }}</text>
    </view>

    <view class="stats-grid">
      <view class="stat-item">
        <view class="stat-icon stat-blue">
          <text class="stat-value">{{ todayCheckin }}</text>
        </view>
        <text class="stat-label">今日打卡</text>
      </view>
      <view class="stat-item" v-if="checkinStatus.checkin">
        <view class="stat-icon" :class="checkinStatus.checkin === 'normal' ? 'stat-green' : 'stat-yellow'">
          <text class="stat-time">{{ checkinTime }}</text>
        </view>
        <text class="stat-label">上班打卡</text>
      </view>
      <view class="stat-item" v-if="checkinStatus.checkout">
        <view class="stat-icon" :class="checkinStatus.checkout === 'normal' ? 'stat-green' : 'stat-red'">
          <text class="stat-time">{{ checkoutTime }}</text>
        </view>
        <text class="stat-label">下班打卡</text>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-item" @click="goCheckin">
        <view class="action-icon action-blue">
          <text class="iconfont">打卡</text>
        </view>
        <text class="action-label">打卡签到</text>
      </view>
      <view class="action-item" @click="goLeave">
        <view class="action-icon action-green">
          <text class="iconfont">请假</text>
        </view>
        <text class="action-label">请假申请</text>
      </view>
      <view class="action-item" @click="goOvertime">
        <view class="action-icon action-orange">
          <text class="iconfont">加班</text>
        </view>
        <text class="action-label">加班申请</text>
      </view>
      <view class="action-item" @click="goRecords">
        <view class="action-icon action-purple">
          <text class="iconfont">记录</text>
        </view>
        <text class="action-label">打卡记录</text>
      </view>
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">今日考勤状态</text>
      </view>
      <view class="status-list">
        <view class="status-item">
          <text class="status-label">上班打卡</text>
          <view class="status-right">
            <text v-if="checkinStatus.checkin" class="status-value" :class="getStatusClass(checkinStatus.checkin)">
              {{ checkinTime }} ({{ getStatusLabel(checkinStatus.checkin) }})
            </text>
            <text v-else class="status-value status-pending">未打卡</text>
          </view>
        </view>
        <view class="status-item">
          <text class="status-label">下班打卡</text>
          <view class="status-right">
            <text v-if="checkinStatus.checkout" class="status-value" :class="getStatusClass(checkinStatus.checkout)">
              {{ checkoutTime }} ({{ getStatusLabel(checkinStatus.checkout) }})
            </text>
            <text v-else class="status-value status-pending">未打卡</text>
          </view>
        </view>
      </view>
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">待办事项</text>
      </view>
      <view class="todo-list">
        <view class="todo-item" v-if="pendingCount.leave > 0">
          <view class="todo-icon todo-yellow">
            <text>{{ pendingCount.leave }}</text>
          </view>
          <text class="todo-text">请假审批待处理</text>
        </view>
        <view class="todo-item" v-if="pendingCount.overtime > 0">
          <view class="todo-icon todo-orange">
            <text>{{ pendingCount.overtime }}</text>
          </view>
          <text class="todo-text">加班审批待处理</text>
        </view>
        <view class="todo-item" v-if="pendingCount.recheck > 0">
          <view class="todo-icon todo-red">
            <text>{{ pendingCount.recheck }}</text>
          </view>
          <text class="todo-text">补卡审批待处理</text>
        </view>
        <view class="todo-empty" v-if="pendingCount.leave === 0 && pendingCount.overtime === 0 && pendingCount.recheck === 0">
          <text class="empty-text">暂无待办事项</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTodayCheckin, getStatisticsOverview, getUserInfo } from '@/api'
import { storage, getRoleName, getStatusInfo, getCurrentTime, getCurrentDate, getWeekDay, showLoading, hideLoading } from '@/utils'

const timer = ref(null)

const userInfo = ref(storage.get('userInfo') || {})
const currentTime = ref(getCurrentTime())
const currentDate = ref(getCurrentDate())
const currentWeekDay = ref(getWeekDay(currentDate.value))

const todayCheckin = ref(0)
const checkinTime = ref('--:--')
const checkoutTime = ref('--:--')
const checkinStatus = reactive({
  checkin: null,
  checkout: null
})

const pendingCount = reactive({
  leave: 0,
  overtime: 0,
  recheck: 0
})

const startTimer = () => {
  timer.value = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
}

const fetchData = async () => {
  showLoading()
  
  try {
    const info = storage.get('userInfo')
    if (info) {
      userInfo.value = info
    }

    const todayRes = await getTodayCheckin()
    if (todayRes.code === 200) {
      const data = todayRes.data
      checkinTime.value = data.checkinTime || '--:--'
      checkoutTime.value = data.checkoutTime || '--:--'
      checkinStatus.checkin = data.checkinStatus
      checkinStatus.checkout = data.checkoutStatus
    }

    const statsRes = await getStatisticsOverview()
    if (statsRes.code === 200) {
      todayCheckin.value = statsRes.data.todayCheckin
      pendingCount.leave = statsRes.data.leavePending
      pendingCount.overtime = statsRes.data.overtimePending
      pendingCount.recheck = statsRes.data.recheckPending
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    hideLoading()
  }
}

const getStatusLabel = (status) => {
  return getStatusInfo(status).label
}

const getStatusClass = (status) => {
  const info = getStatusInfo(status)
  if (info.type === 'success') return 'status-success'
  if (info.type === 'warning') return 'status-warning'
  if (info.type === 'danger') return 'status-danger'
  return ''
}

const goCheckin = () => {
  uni.switchTab({
    url: '/pages/checkin/checkin'
  })
}

const goLeave = () => {
  uni.navigateTo({
    url: '/pages/leave/leave'
  })
}

const goOvertime = () => {
  uni.navigateTo({
    url: '/pages/overtime/overtime'
  })
}

const goRecords = () => {
  uni.switchTab({
    url: '/pages/record/record'
  })
}

onMounted(() => {
  startTimer()
})

onShow(() => {
  fetchData()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar text {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.user-role {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.header-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.date-text {
  font-size: 28rpx;
  color: #fff;
}

.week-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.current-time {
  text-align: center;
  padding: 40rpx 0;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.time-text {
  font-size: 72rpx;
  font-weight: bold;
  color: #409eff;
  font-family: 'Courier New', monospace;
}

.stats-grid {
  display: flex;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  background: #fff;
  margin: 0 10rpx;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
}

.stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15rpx;
}

.stat-blue {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
}

.stat-green {
  background: linear-gradient(135deg, #67c23a 0%, #5cb85c 100%);
}

.stat-yellow {
  background: linear-gradient(135deg, #e6a23c 0%, #f0ad4e 100%);
}

.stat-red {
  background: linear-gradient(135deg, #f56c6c 0%, #d9534f 100%);
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.stat-time {
  font-size: 24rpx;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.action-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
}

.action-blue {
  background: rgba(64, 158, 255, 0.1);
}

.action-green {
  background: rgba(103, 194, 58, 0.1);
}

.action-orange {
  background: rgba(230, 162, 60, 0.1);
}

.action-purple {
  background: rgba(156, 39, 176, 0.1);
}

.iconfont {
  font-size: 28rpx;
  color: #409eff;
  font-weight: bold;
}

.action-label {
  font-size: 26rpx;
  color: #606266;
}

.card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.card-header {
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #303133;
}

.status-list {
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.status-label {
  font-size: 28rpx;
  color: #606266;
}

.status-right {
  display: flex;
  align-items: center;
}

.status-value {
  font-size: 26rpx;
}

.status-pending {
  color: #909399;
}

.status-success {
  color: #67c23a;
}

.status-warning {
  color: #e6a23c;
}

.status-danger {
  color: #f56c6c;
}

.todo-list {
  .todo-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.todo-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.todo-yellow {
  background: rgba(230, 162, 60, 0.1);
}

.todo-orange {
  background: rgba(230, 162, 60, 0.1);
}

.todo-red {
  background: rgba(245, 108, 108, 0.1);
}

.todo-icon text {
  font-size: 24rpx;
  color: #e6a23c;
  font-weight: bold;
}

.todo-text {
  font-size: 28rpx;
  color: #606266;
}

.todo-empty {
  text-align: center;
  padding: 40rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #c0c4cc;
}
</style>
