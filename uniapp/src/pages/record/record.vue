<template>
  <view class="record-container">
    <view class="search-bar">
      <view class="search-item">
        <picker 
          mode="selector" 
          :range="monthList" 
          :value="monthIndex"
          @change="onMonthChange"
        >
          <view class="picker-text">
            {{ monthList[monthIndex] }}
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
      <view class="search-item">
        <picker 
          mode="selector" 
          :range="statusList" 
          :range-key="'label'"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-text">
            {{ statusList[statusIndex].label }}
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-value">{{ stats.normal }}</text>
        <text class="stat-label">正常</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value stat-warning">{{ stats.late }}</text>
        <text class="stat-label">迟到</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value stat-danger">{{ stats.early }}</text>
        <text class="stat-label">早退</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value stat-info">{{ stats.absent }}</text>
        <text class="stat-label">缺勤</text>
      </view>
    </view>

    <view class="record-list" v-if="recordList.length > 0">
      <view 
        class="record-item" 
        v-for="(item, index) in recordList" 
        :key="item.id"
        @click="handleDetail(item)"
      >
        <view class="record-date">
          <text class="date-day">{{ item.date }}</text>
          <text class="date-week">{{ getWeekDay(item.date) }}</text>
        </view>
        <view class="record-info">
          <view class="info-row">
            <view class="info-item">
              <text class="info-label">上班</text>
              <text class="info-time" :class="item.checkinStatus === 'normal' ? 'text-success' : 'text-warning'">
                {{ item.checkinTime || '--:--' }}
              </text>
              <text 
                v-if="item.checkinStatus" 
                class="info-tag" 
                :class="item.checkinStatus === 'normal' ? 'tag-success' : 'tag-warning'"
              >
                {{ getStatusLabel(item.checkinStatus) }}
              </text>
            </view>
          </view>
          <view class="info-row" v-if="item.checkoutTime">
            <view class="info-item">
              <text class="info-label">下班</text>
              <text class="info-time" :class="item.checkoutStatus === 'normal' ? 'text-success' : 'text-warning'">
                {{ item.checkoutTime || '--:--' }}
              </text>
              <text 
                v-if="item.checkoutStatus" 
                class="info-tag" 
                :class="item.checkoutStatus === 'normal' ? 'tag-success' : 'tag-warning'"
              >
                {{ getStatusLabel(item.checkoutStatus) }}
              </text>
            </view>
          </view>
        </view>
        <view class="record-arrow">
          <text>›</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <view class="empty-icon">
        <text class="icon-text">暂无</text>
      </view>
      <text class="empty-text">暂无打卡记录</text>
    </view>

    <view class="load-more" v-if="hasMore">
      <text class="load-text">加载更多...</text>
    </view>

    <view class="no-more" v-else-if="recordList.length > 0">
      <text class="no-more-text">没有更多了</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getCheckinList } from '@/api'
import { getStatusInfo, getWeekDay, showLoading, hideLoading } from '@/utils'
import dayjs from 'dayjs'

const monthList = ref([])
const monthIndex = ref(0)
const statusList = ref([
  { value: '', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'late', label: '迟到' },
  { value: 'early', label: '早退' },
  { value: 'absent', label: '缺勤' }
])
const statusIndex = ref(0)

const recordList = ref([])
const hasMore = ref(true)
const pagination = reactive({
  page: 1,
  pageSize: 10
})

const stats = reactive({
  normal: 0,
  late: 0,
  early: 0,
  absent: 0
})

const initMonthList = () => {
  const list = []
  for (let i = 0; i < 12; i++) {
    const date = dayjs().subtract(i, 'month')
    list.push(date.format('YYYY年MM月'))
  }
  monthList.value = list
}

const getStatusLabel = (status) => {
  return getStatusInfo(status).label
}

const onMonthChange = (e) => {
  monthIndex.value = e.detail.value
  pagination.page = 1
  recordList.value = []
  fetchData()
}

const onStatusChange = (e) => {
  statusIndex.value = e.detail.value
  pagination.page = 1
  recordList.value = []
  fetchData()
}

const fetchData = async () => {
  if (pagination.page === 1) {
    showLoading()
  }

  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }

    const res = await getCheckinList(params)
    if (res.code === 200) {
      const list = res.data.list
      if (pagination.page === 1) {
        recordList.value = list
      } else {
        recordList.value = [...recordList.value, ...list]
      }

      hasMore.value = recordList.value.length < res.data.total

      if (pagination.page === 1) {
        calculateStats(list)
      }
    }
  } catch (error) {
    console.error('获取打卡记录失败:', error)
  } finally {
    hideLoading()
  }
}

const calculateStats = (list) => {
  stats.normal = 0
  stats.late = 0
  stats.early = 0
  stats.absent = 0

  list.forEach(item => {
    if (item.checkinStatus === 'normal') stats.normal++
    if (item.checkinStatus === 'late') stats.late++
    if (item.checkoutStatus === 'early') stats.early++
    if (item.checkinStatus === 'absent' || item.checkoutStatus === 'absent') stats.absent++
  })
}

const handleDetail = (item) => {
  uni.showToast({
    title: '查看详情功能开发中',
    icon: 'none'
  })
}

onMounted(() => {
  initMonthList()
})

onShow(() => {
  pagination.page = 1
  recordList.value = []
  fetchData()
})
</script>

<style lang="scss" scoped>
.record-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-bar {
  display: flex;
  background: #fff;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-item {
  flex: 1;
  margin: 0 10rpx;
}

.picker-text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  color: #606266;
}

.picker-arrow {
  margin-left: 10rpx;
  font-size: 20rpx;
  color: #c0c4cc;
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 30rpx 0;
  margin: 20rpx;
  border-radius: 16rpx;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #67c23a;
}

.stat-warning {
  color: #e6a23c;
}

.stat-danger {
  color: #f56c6c;
}

.stat-info {
  color: #909399;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  background: #f0f0f0;
}

.record-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.record-date {
  width: 100rpx;
  text-align: center;
}

.date-day {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #303133;
}

.date-week {
  display: block;
  font-size: 22rpx;
  color: #909399;
  margin-top: 5rpx;
}

.record-info {
  flex: 1;
  margin-left: 30rpx;
}

.info-row {
  padding: 5rpx 0;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 24rpx;
  color: #909399;
  width: 60rpx;
}

.info-time {
  font-size: 28rpx;
  font-weight: bold;
  color: #303133;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.info-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 15rpx;
}

.tag-success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.tag-warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.record-arrow {
  width: 40rpx;
  text-align: center;
}

.record-arrow text {
  font-size: 36rpx;
  color: #c0c4cc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.icon-text {
  font-size: 28rpx;
  color: #c0c4cc;
}

.empty-text {
  font-size: 28rpx;
  color: #909399;
}

.load-more {
  text-align: center;
  padding: 30rpx 0;
}

.load-text {
  font-size: 26rpx;
  color: #909399;
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
}

.no-more-text {
  font-size: 26rpx;
  color: #c0c4cc;
}
</style>
