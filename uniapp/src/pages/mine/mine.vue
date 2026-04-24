<template>
  <view class="mine-container">
    <view class="user-header">
      <view class="user-info">
        <view class="user-avatar">
          <text v-if="userInfo.name">{{ userInfo.name.charAt(0) }}</text>
          <text v-else>用</text>
        </view>
        <view class="user-text">
          <text class="user-name">{{ userInfo.name || '用户' }}</text>
          <text class="user-role">{{ getRoleName(userInfo.role) }}</text>
        </view>
      </view>
      <view class="user-department">
        <text class="dept-text">{{ userInfo.department || '未设置部门' }}</text>
      </view>
    </view>

    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">{{ stats.normal }}</text>
        <text class="stats-label">正常打卡</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value stats-warning">{{ stats.late }}</text>
        <text class="stats-label">迟到</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value stats-danger">{{ stats.early }}</text>
        <text class="stats-label">早退</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value stats-info">{{ stats.absent }}</text>
        <text class="stats-label">缺勤</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goRecords">
        <view class="menu-icon icon-blue">
          <text class="icon-text">记录</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">打卡记录</text>
          <text class="menu-desc">查看历史打卡记录</text>
        </view>
        <view class="menu-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="menu-item" @click="goLeave">
        <view class="menu-icon icon-green">
          <text class="icon-text">请假</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">请假记录</text>
          <text class="menu-desc">查看请假申请记录</text>
        </view>
        <view class="menu-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="menu-item" @click="goOvertime">
        <view class="menu-icon icon-orange">
          <text class="icon-text">加班</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">加班记录</text>
          <text class="menu-desc">查看加班申请记录</text>
        </view>
        <view class="menu-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="menu-item" @click="goApproval">
        <view class="menu-icon icon-purple" v-if="isManager">
          <text class="icon-text">审批</text>
        </view>
        <view class="menu-content" v-if="isManager">
          <text class="menu-title">待办审批</text>
          <text class="menu-desc">审批请假、加班、补卡申请</text>
        </view>
        <view class="menu-arrow" v-if="isManager">
          <text>›</text>
        </view>
        <view class="badge" v-if="isManager && pendingCount > 0">
          <text>{{ pendingCount }}</text>
        </view>
      </view>
    </view>

    <view class="setting-list">
      <view class="menu-item" @click="handleAbout">
        <view class="menu-icon icon-gray">
          <text class="icon-text">关于</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">关于我们</text>
        </view>
        <view class="menu-arrow">
          <text>›</text>
        </view>
      </view>

      <view class="menu-item" @click="handleLogout">
        <view class="menu-icon icon-red">
          <text class="icon-text">退出</text>
        </view>
        <view class="menu-content">
          <text class="menu-title">退出登录</text>
        </view>
        <view class="menu-arrow">
          <text>›</text>
        </view>
      </view>
    </view>

    <view class="version-info">
      <text class="version-text">版本 1.0.0</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getStatisticsOverview } from '@/api'
import { storage, getRoleName, showModal, showToast } from '@/utils'

const userInfo = ref(storage.get('userInfo') || {})

const stats = reactive({
  normal: 0,
  late: 0,
  early: 0,
  absent: 0
})

const pendingCount = ref(0)

const isManager = computed(() => {
  return userInfo.value.role === 'admin' || userInfo.value.role === 'manager'
})

const fetchData = async () => {
  try {
    const info = storage.get('userInfo')
    if (info) {
      userInfo.value = info
    }

    const res = await getStatisticsOverview()
    if (res.code === 200) {
      const data = res.data.monthStatistics
      stats.normal = data.normal
      stats.late = data.late
      stats.early = data.early
      stats.absent = data.absent

      pendingCount.value = data.leavePending + data.overtimePending + data.recheckPending
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const goRecords = () => {
  uni.switchTab({
    url: '/pages/record/record'
  })
}

const goLeave = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goOvertime = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const goApproval = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const handleAbout = () => {
  uni.showModal({
    title: '关于我们',
    content: '企业考勤打卡系统\n版本：1.0.0\n技术支持：Vue3 + UniApp',
    showCancel: false
  })
}

const handleLogout = async () => {
  const confirm = await showModal('确定要退出登录吗？')
  if (!confirm) return

  storage.remove('token')
  storage.remove('userInfo')
  storage.remove('permissions')

  showToast('已退出登录', 'success')

  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/login/login'
    })
  }, 1500)
}

onMounted(() => {})

onShow(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.mine-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-header {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  padding: 60rpx 40rpx;
  padding-bottom: 80rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.user-avatar text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.user-text {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
}

.user-role {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.user-department {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
  display: inline-block;
}

.dept-text {
  font-size: 24rpx;
  color: #fff;
}

.stats-card {
  display: flex;
  background: #fff;
  margin: -40rpx 20rpx 20rpx;
  border-radius: 16rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-item {
  flex: 1;
  text-align: center;
}

.stats-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #67c23a;
}

.stats-warning {
  color: #e6a23c;
}

.stats-danger {
  color: #f56c6c;
}

.stats-info {
  color: #909399;
}

.stats-label {
  font-size: 24rpx;
  color: #909399;
  margin-top: 8rpx;
}

.stats-divider {
  width: 1rpx;
  background: #f0f0f0;
}

.menu-list,
.setting-list {
  background: #fff;
  margin-bottom: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-blue {
  background: rgba(64, 158, 255, 0.1);
}

.icon-green {
  background: rgba(103, 194, 58, 0.1);
}

.icon-orange {
  background: rgba(230, 162, 60, 0.1);
}

.icon-purple {
  background: rgba(156, 39, 176, 0.1);
}

.icon-gray {
  background: rgba(144, 147, 153, 0.1);
}

.icon-red {
  background: rgba(245, 108, 108, 0.1);
}

.icon-text {
  font-size: 24rpx;
  color: #409eff;
  font-weight: bold;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 28rpx;
  color: #303133;
}

.menu-desc {
  font-size: 24rpx;
  color: #909399;
  margin-top: 6rpx;
  display: block;
}

.menu-arrow {
  width: 40rpx;
  text-align: center;
}

.menu-arrow text {
  font-size: 36rpx;
  color: #c0c4cc;
}

.badge {
  position: absolute;
  right: 80rpx;
  top: 50%;
  transform: translateY(-50%);
  background: #f56c6c;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
  min-width: 32rpx;
  text-align: center;
}

.badge text {
  font-size: 20rpx;
  color: #fff;
}

.version-info {
  text-align: center;
  padding: 40rpx 0;
}

.version-text {
  font-size: 24rpx;
  color: #c0c4cc;
}
</style>
