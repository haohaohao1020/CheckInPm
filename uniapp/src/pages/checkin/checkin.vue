<template>
  <view class="checkin-container">
    <view class="checkin-header">
      <view class="date-info">
        <text class="date-text">{{ currentDate }}</text>
        <text class="week-text">{{ currentWeekDay }}</text>
      </view>
      <view class="time-info">
        <text class="time-text">{{ currentTime }}</text>
      </view>
    </view>

    <view class="checkin-main">
      <view class="checkin-circle">
        <view class="circle-inner">
          <text class="circle-status">{{ circleStatus }}</text>
          <text class="circle-time" v-if="circleTime">{{ circleTime }}</text>
        </view>
      </view>

      <view class="checkin-status">
        <view class="status-item">
          <view class="status-dot" :class="checkinStatus.checkin ? 'dot-success' : 'dot-pending'"></view>
          <view class="status-text">
            <text class="status-label">上班打卡</text>
            <text class="status-time" v-if="checkinStatus.checkin">{{ checkinTime }}</text>
            <text class="status-pending" v-else>未打卡</text>
          </view>
          <view class="status-tag" v-if="checkinStatus.checkin">
            <text :class="checkinStatus.checkin === 'normal' ? 'tag-success' : 'tag-warning'">
              {{ getStatusLabel(checkinStatus.checkin) }}
            </text>
          </view>
        </view>

        <view class="status-divider"></view>

        <view class="status-item">
          <view class="status-dot" :class="checkinStatus.checkout ? 'dot-success' : 'dot-pending'"></view>
          <view class="status-text">
            <text class="status-label">下班打卡</text>
            <text class="status-time" v-if="checkinStatus.checkout">{{ checkoutTime }}</text>
            <text class="status-pending" v-else>未打卡</text>
          </view>
          <view class="status-tag" v-if="checkinStatus.checkout">
            <text :class="checkinStatus.checkout === 'normal' ? 'tag-success' : 'tag-warning'">
              {{ getStatusLabel(checkinStatus.checkout) }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="checkin-buttons">
      <button 
        class="checkin-btn btn-primary" 
        :class="{ disabled: !canCheckin, loading: checkinLoading }"
        :disabled="!canCheckin || checkinLoading"
        @click="handleCheckin('checkin')"
      >
        <text v-if="!checkinLoading">上班打卡</text>
        <text v-else>打卡中...</text>
      </button>
      <button 
        class="checkin-btn btn-success" 
        :class="{ disabled: !canCheckout, loading: checkoutLoading }"
        :disabled="!canCheckout || checkoutLoading"
        @click="handleCheckin('checkout')"
      >
        <text v-if="!checkoutLoading">下班打卡</text>
        <text v-else>打卡中...</text>
      </button>
    </view>

    <view class="location-info">
      <view class="location-icon">
        <text class="icon-text">定位</text>
      </view>
      <view class="location-text">
        <text class="location-label">打卡地点</text>
        <text class="location-value">{{ location }}</text>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-item" @click="handleRecheck">
        <view class="action-icon">
          <text class="icon">补卡</text>
        </view>
        <text class="action-label">补卡申请</text>
      </view>
      <view class="action-item" @click="handleLeave">
        <view class="action-icon">
          <text class="icon">请假</text>
        </view>
        <text class="action-label">请假申请</text>
      </view>
      <view class="action-item" @click="handleOvertime">
        <view class="action-icon">
          <text class="icon">加班</text>
        </view>
        <text class="action-label">加班申请</text>
      </view>
      <view class="action-item" @click="handleRecords">
        <view class="action-icon">
          <text class="icon">记录</text>
        </view>
        <text class="action-label">打卡记录</text>
      </view>
    </view>

    <view class="card">
      <view class="card-header">
        <text class="card-title">今日排班</text>
      </view>
      <view class="schedule-info">
        <view class="schedule-item">
          <text class="schedule-label">上班时间</text>
          <text class="schedule-value">08:30</text>
        </view>
        <view class="schedule-divider"></view>
        <view class="schedule-item">
          <text class="schedule-label">下班时间</text>
          <text class="schedule-value">18:00</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTodayCheckin, doCheckin, applyRecheck } from '@/api'
import { storage, getStatusInfo, getCurrentTime, getCurrentDate, getWeekDay, showToast, showLoading, hideLoading, showModal } from '@/utils'

const timer = ref(null)

const currentTime = ref(getCurrentTime())
const currentDate = ref(getCurrentDate())
const currentWeekDay = ref(getWeekDay(currentDate.value))

const checkinTime = ref('--:--')
const checkoutTime = ref('--:--')
const location = ref('北京市朝阳区科技园区A座')

const checkinStatus = reactive({
  checkin: null,
  checkout: null
})

const checkinLoading = ref(false)
const checkoutLoading = ref(false)

const canCheckin = computed(() => {
  return !checkinStatus.checkin
})

const canCheckout = computed(() => {
  return checkinStatus.checkin && !checkinStatus.checkout
})

const circleStatus = computed(() => {
  if (!checkinStatus.checkin) return '上班打卡'
  if (!checkinStatus.checkout) return '下班打卡'
  return '今日已完成'
})

const circleTime = computed(() => {
  if (checkinStatus.checkin && !checkinStatus.checkout) return checkinTime.value
  if (checkinStatus.checkout) return checkoutTime.value
  return null
})

const startTimer = () => {
  timer.value = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
}

const fetchData = async () => {
  try {
    const res = await getTodayCheckin()
    if (res.code === 200) {
      const data = res.data
      checkinTime.value = data.checkinTime || '--:--'
      checkoutTime.value = data.checkoutTime || '--:--'
      checkinStatus.checkin = data.checkinStatus
      checkinStatus.checkout = data.checkoutStatus
      if (data.location) {
        location.value = data.location
      }
    }
  } catch (error) {
    console.error('获取打卡信息失败:', error)
  }
}

const getStatusLabel = (status) => {
  return getStatusInfo(status).label
}

const handleCheckin = async (type) => {
  const confirm = await showModal(`确定要进行${type === 'checkin' ? '上班' : '下班'}打卡吗？`)
  if (!confirm) return

  if (type === 'checkin') {
    checkinLoading.value = true
  } else {
    checkoutLoading.value = true
  }

  showLoading('打卡中...')

  try {
    const res = await doCheckin({ type })
    if (res.code === 200) {
      showToast(res.data.message, 'success')
      
      if (type === 'checkin') {
        checkinTime.value = res.data.time
        checkinStatus.checkin = res.data.status
      } else {
        checkoutTime.value = res.data.time
        checkinStatus.checkout = res.data.status
      }
    }
  } catch (error) {
    console.error('打卡失败:', error)
  } finally {
    checkinLoading.value = false
    checkoutLoading.value = false
    hideLoading()
  }
}

const handleRecheck = () => {
  uni.navigateTo({
    url: '/pages/leave/leave?type=recheck'
  })
}

const handleLeave = () => {
  uni.navigateTo({
    url: '/pages/leave/leave'
  })
}

const handleOvertime = () => {
  uni.navigateTo({
    url: '/pages/overtime/overtime'
  })
}

const handleRecords = () => {
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
.checkin-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #409eff 0%, #f5f5f5 50%);
  padding-bottom: 40rpx;
}

.checkin-header {
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.week-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.time-info {
  text-align: right;
}

.time-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.checkin-main {
  background: #fff;
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
}

.checkin-circle {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.circle-inner {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(64, 158, 255, 0.4);
}

.circle-status {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.circle-time {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10rpx;
}

.checkin-status {
  .status-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
  }
}

.status-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.dot-pending {
  background: #c0c4cc;
}

.dot-success {
  background: #67c23a;
}

.status-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 28rpx;
  color: #606266;
}

.status-time {
  font-size: 26rpx;
  color: #303133;
  margin-top: 5rpx;
}

.status-pending {
  font-size: 26rpx;
  color: #c0c4cc;
  margin-top: 5rpx;
}

.status-tag {
  text {
    font-size: 24rpx;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
  }

  .tag-success {
    background: rgba(103, 194, 58, 0.1);
    color: #67c23a;
  }

  .tag-warning {
    background: rgba(230, 162, 60, 0.1);
    color: #e6a23c;
  }
}

.status-divider {
  height: 1rpx;
  background: #f0f0f0;
  margin: 10rpx 44rpx;
}

.checkin-buttons {
  display: flex;
  padding: 0 20rpx;
  margin-top: 20rpx;
}

.checkin-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin: 0 10rpx;
}

.btn-primary {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  color: #fff;
}

.btn-success {
  background: linear-gradient(135deg, #67c23a 0%, #5cb85c 100%);
  color: #fff;
}

.checkin-btn.disabled {
  background: #c0c4cc;
  color: #fff;
}

.location-info {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.location-icon {
  width: 64rpx;
  height: 64rpx;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 24rpx;
  color: #409eff;
}

.location-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.location-label {
  font-size: 24rpx;
  color: #909399;
}

.location-value {
  font-size: 26rpx;
  color: #303133;
  margin-top: 5rpx;
}

.quick-actions {
  display: flex;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx 0;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
}

.icon {
  font-size: 24rpx;
  color: #409eff;
}

.action-label {
  font-size: 24rpx;
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

.schedule-info {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.schedule-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schedule-label {
  font-size: 24rpx;
  color: #909399;
}

.schedule-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #409eff;
  margin-top: 10rpx;
}

.schedule-divider {
  width: 1rpx;
  height: 60rpx;
  background: #f0f0f0;
}
</style>
