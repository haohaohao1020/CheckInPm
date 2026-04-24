<template>
  <view class="leave-container">
    <view class="form-list">
      <view class="form-item">
        <view class="form-label">请假类型</view>
        <picker 
          :range="leaveTypes" 
          :value="form.typeIndex"
          @change="onTypeChange"
        >
          <view class="form-value">
            <text class="value-text">{{ leaveTypes[form.typeIndex] }}</text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">开始日期</view>
        <picker 
          mode="date" 
          :value="form.startDate"
          @change="onStartDateChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.startDate }">
              {{ form.startDate || '请选择' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">结束日期</view>
        <picker 
          mode="date" 
          :value="form.endDate"
          @change="onEndDateChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.endDate }">
              {{ form.endDate || '请选择' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <view class="form-label">请假天数</view>
        <view class="form-value">
          <text class="value-text value-number">{{ form.days }} 天</text>
        </view>
      </view>

      <view class="form-item form-textarea">
        <view class="form-label">请假原因</view>
        <textarea 
          class="form-input"
          v-model="form.reason"
          placeholder="请输入请假原因"
          placeholder-class="placeholder"
          :maxlength="200"
        />
        <view class="word-count">{{ form.reason.length }}/200</view>
      </view>

      <view class="form-item">
        <view class="form-label">附件上传</view>
        <view class="form-value">
          <view class="upload-area" @click="handleUpload">
            <view class="upload-icon">
              <text class="icon-plus">+</text>
            </view>
            <text class="upload-text">上传图片</text>
          </view>
          <view class="upload-list" v-if="form.attachments.length > 0">
            <view 
              class="upload-item" 
              v-for="(item, index) in form.attachments" 
              :key="index"
            >
              <image class="upload-image" :src="item" mode="aspectFill" />
              <view class="upload-remove" @click.stop="handleRemove(index)">
                <text>×</text>
              </view>
            </view>
          </view>
        </view>
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
import { applyLeave } from '@/api'
import { showToast, showLoading, hideLoading, showModal } from '@/utils'
import dayjs from 'dayjs'

const leaveTypes = ref(['年假', '病假', '事假', '婚假', '产假'])

const form = reactive({
  typeIndex: 0,
  startDate: '',
  endDate: '',
  days: 0,
  reason: '',
  attachments: []
})

const canSubmit = computed(() => {
  return form.startDate && form.endDate && form.reason.trim().length > 0
})

const onTypeChange = (e) => {
  form.typeIndex = e.detail.value
}

const onStartDateChange = (e) => {
  form.startDate = e.detail.value
  calculateDays()
}

const onEndDateChange = (e) => {
  form.endDate = e.detail.value
  calculateDays()
}

const calculateDays = () => {
  if (form.startDate && form.endDate) {
    const start = dayjs(form.startDate)
    const end = dayjs(form.endDate)
    form.days = end.diff(start, 'day') + 1
    if (form.days < 0) {
      form.days = 0
    }
  }
}

const handleUpload = () => {
  if (form.attachments.length >= 3) {
    showToast('最多只能上传3张图片')
    return
  }

  uni.chooseImage({
    count: 3 - form.attachments.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.attachments = [...form.attachments, ...res.tempFilePaths]
    }
  })
}

const handleRemove = (index) => {
  form.attachments.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.startDate) {
    showToast('请选择开始日期')
    return
  }
  if (!form.endDate) {
    showToast('请选择结束日期')
    return
  }
  if (form.days <= 0) {
    showToast('结束日期必须大于等于开始日期')
    return
  }
  if (!form.reason.trim()) {
    showToast('请输入请假原因')
    return
  }

  const confirm = await showModal(`确定要提交请假申请吗？\n请假类型：${leaveTypes.value[form.typeIndex]}\n请假天数：${form.days}天`)
  if (!confirm) return

  showLoading('提交中...')

  try {
    const res = await applyLeave({
      type: leaveTypes.value[form.typeIndex],
      startDate: form.startDate,
      endDate: form.endDate,
      days: form.days,
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
.leave-container {
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

.upload-area {
  width: 160rpx;
  height: 160rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #dcdfe6;
}

.upload-icon {
  width: 60rpx;
  height: 60rpx;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

.icon-plus {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.upload-text {
  font-size: 24rpx;
  color: #909399;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  margin-left: 20rpx;
}

.upload-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}

.upload-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.upload-remove {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-remove text {
  font-size: 28rpx;
  color: #fff;
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
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
