<template>
  <view class="overtime-container">
    <view class="form-list">
      <view class="form-item">
        <view class="form-label">加班日期</view>
        <picker 
          mode="date" 
          :value="form.date"
          @change="onDateChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.date }">
              {{ form.date || '请选择' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">开始时间</view>
        <picker 
          mode="time" 
          :value="form.startTime"
          @change="onStartTimeChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.startTime }">
              {{ form.startTime || '请选择' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">结束时间</view>
        <picker 
          mode="time" 
          :value="form.endTime"
          @change="onEndTimeChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.endTime }">
              {{ form.endTime || '请选择' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">加班时长</view>
        <view class="form-value">
          <text class="value-text value-number">{{ form.hours }} 小时</text>
        </view>
      </view>

      <view class="form-item form-textarea">
        <view class="form-label">加班原因</view>
        <textarea 
          class="form-input"
          v-model="form.reason"
          placeholder="请输入加班原因"
          placeholder-class="placeholder"
          :maxlength="200"
        />
        <view class="word-count">{{ form.reason.length }}/200</view>
      </view>
    </view>

    <view class="form-footer">
      <button class="submit-btn" :disabled="!canSubmit" @click="handleSubmit">
        提交申请
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { applyOvertime } from '@/api'
import { showToast, showLoading, hideLoading, showModal } from '@/utils'

const form = reactive({
  date: '',
  startTime: '',
  endTime: '',
  hours: 0,
  reason: ''
})

const canSubmit = computed(() => {
  return form.date && form.startTime && form.endTime && form.hours > 0 && form.reason.trim().length > 0
})

const onDateChange = (e) => {
  form.date = e.detail.value
}

const onStartTimeChange = (e) => {
  form.startTime = e.detail.value
  calculateHours()
}

const onEndTimeChange = (e) => {
  form.endTime = e.detail.value
  calculateHours()
}

const calculateHours = () => {
  if (form.startTime && form.endTime) {
    const start = parseInt(form.startTime.split(':')[0])
    const end = parseInt(form.endTime.split(':')[0])
    form.hours = end - start
    if (form.hours < 0) {
      form.hours = 0
    }
  }
}

const handleSubmit = async () => {
  if (!form.date) {
    showToast('请选择加班日期')
    return
  }
  if (!form.startTime) {
    showToast('请选择开始时间')
    return
  }
  if (!form.endTime) {
    showToast('请选择结束时间')
    return
  }
  if (form.hours <= 0) {
    showToast('结束时间必须大于开始时间')
    return
  }
  if (!form.reason.trim()) {
    showToast('请输入加班原因')
    return
  }

  const confirm = await showModal(`确定要提交加班申请吗？\n加班时长：${form.hours}小时`)
  if (!confirm) return

  showLoading('提交中...')

  try {
    const res = await applyOvertime({
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      hours: form.hours,
      reason: form.reason,
      userId: 3,
      userName: '张三',
      department: '技术部'
    })

    if (res.code === 200) {
      showToast('提交成功', 'success')
      
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.overtime-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-list {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #303133;
}

.form-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.value-text {
  font-size: 28rpx;
  color: #303133;
}

.value-number {
  font-weight: bold;
  color: #409eff;
}

.placeholder {
  color: #c0c4cc;
}

.value-arrow {
  font-size: 32rpx;
  color: #c0c4cc;
  margin-left: 10rpx;
}

.form-textarea {
  flex-direction: column;
  align-items: flex-start;
}

.form-textarea .form-label {
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  height: 200rpx;
  font-size: 28rpx;
  color: #303133;
  line-height: 1.6;
}

.placeholder {
  color: #c0c4cc;
}

.word-count {
  width: 100%;
  text-align: right;
  font-size: 24rpx;
  color: #c0c4cc;
  margin-top: 10rpx;
}

.form-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #67c23a 0%, #5cb85c 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
}

.submit-btn[disabled] {
  background: #c0c4cc;
}
</style>
