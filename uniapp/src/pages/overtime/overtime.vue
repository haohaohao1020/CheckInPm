<template>
  <view class="overtime-container">
    <view class="form-list">
      <view class="form-item" v-if="isManager">
        <view class="form-label">选择部门</view>
        <picker 
          :range="departmentList" 
          :value="form.departmentIndex"
          @change="onDepartmentChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.department }">
              {{ form.department || '请选择部门' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item" v-if="isManager">
        <view class="form-label">选择员工</view>
        <picker 
          :range="filteredEmployeeList" 
          range-key="name"
          :value="form.employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="form-value">
            <text class="value-text" :class="{ placeholder: !form.userName }">
              {{ form.userName ? `${form.userName} (${form.employeeCode || '工号'})` : '请选择员工' }}
            </text>
            <text class="value-arrow">›</text>
          </view>
        </picker>
      </view>

      <view class="form-item" v-if="!isManager">
        <view class="form-label">申请人</view>
        <view class="form-value">
          <text class="value-text">{{ currentUserInfo.name || '当前用户' }}</text>
        </view>
      </view>

      <view class="form-item" v-if="!isManager">
        <view class="form-label">部门</view>
        <view class="form-value">
          <text class="value-text">{{ currentUserInfo.department || '未设置' }}</text>
        </view>
      </view>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { applyOvertime } from '@/api'
import { storage, showToast, showLoading, hideLoading, showModal, getRoleName } from '@/utils'

const currentUserInfo = ref(storage.get('userInfo') || {})

const isManager = computed(() => {
  return currentUserInfo.value.role === 'admin' || currentUserInfo.value.role === 'manager'
})

const departmentList = ref(['技术部', '销售部', '市场部', '人事部', '财务部'])

const employeeList = ref([
  { id: 1, name: '管理员', code: 'EMP001', department: '技术部', role: 'admin' },
  { id: 2, name: '经理', code: 'EMP002', department: '销售部', role: 'manager' },
  { id: 3, name: '张三', code: 'EMP003', department: '技术部', role: 'user' },
  { id: 4, name: '李四', code: 'EMP004', department: '技术部', role: 'user' },
  { id: 5, name: '王五', code: 'EMP005', department: '销售部', role: 'user' },
  { id: 6, name: '赵六', code: 'EMP006', department: '市场部', role: 'user' },
  { id: 7, name: '钱七', code: 'EMP007', department: '人事部', role: 'user' },
  { id: 8, name: '孙八', code: 'EMP008', department: '财务部', role: 'user' }
])

const filteredEmployeeList = computed(() => {
  if (!form.department) return []
  return employeeList.value.filter(emp => emp.department === form.department)
})

const form = reactive({
  date: '',
  startTime: '',
  endTime: '',
  hours: 0,
  reason: '',
  department: '',
  departmentIndex: -1,
  employeeIndex: -1,
  userId: null,
  userName: '',
  employeeCode: ''
})

const canSubmit = computed(() => {
  const baseValid = form.date && form.startTime && form.endTime && form.hours > 0 && form.reason.trim().length > 0
  
  if (isManager.value) {
    return baseValid && form.department && form.userId
  }
  return baseValid
})

const onDepartmentChange = (e) => {
  form.departmentIndex = e.detail.value
  form.department = departmentList.value[form.departmentIndex]
  form.employeeIndex = -1
  form.userId = null
  form.userName = ''
  form.employeeCode = ''
}

const onEmployeeChange = (e) => {
  form.employeeIndex = e.detail.value
  const selectedEmployee = filteredEmployeeList.value[form.employeeIndex]
  if (selectedEmployee) {
    form.userId = selectedEmployee.id
    form.userName = selectedEmployee.name
    form.employeeCode = selectedEmployee.code
  }
}

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
  if (isManager.value) {
    if (!form.department) {
      showToast('请选择部门')
      return
    }
    if (!form.userId) {
      showToast('请选择员工')
      return
    }
  }
  
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

  const submitData = {
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    hours: form.hours,
    reason: form.reason
  }

  if (isManager.value) {
    submitData.userId = form.userId
    submitData.userName = form.userName
    submitData.department = form.department
  } else {
    submitData.userId = currentUserInfo.value.id
    submitData.userName = currentUserInfo.value.name
    submitData.department = currentUserInfo.value.department
  }

  const confirm = await showModal(
    `确定要提交加班申请吗？\n${isManager.value ? `员工：${form.userName || currentUserInfo.value.name}\n` : ''}加班日期：${form.date}\n加班时长：${form.hours}小时`
  )
  if (!confirm) return

  showLoading('提交中...')

  try {
    const res = await applyOvertime(submitData)

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

onMounted(() => {
  if (!isManager.value && currentUserInfo.value) {
    form.userId = currentUserInfo.value.id
    form.userName = currentUserInfo.value.name
    form.department = currentUserInfo.value.department
  }
})
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
