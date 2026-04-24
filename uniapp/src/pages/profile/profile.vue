<template>
  <view class="profile-container">
    <view class="profile-header">
      <view class="avatar-wrapper">
        <view class="user-avatar">
          <text v-if="userInfo.name">{{ userInfo.name.charAt(0) }}</text>
          <text v-else>用</text>
        </view>
      </view>
      <view class="user-info-header">
        <text class="user-name">{{ userInfo.name || '用户' }}</text>
        <view class="role-badge" :class="userInfo.role">
          <text>{{ roleName }}</text>
        </view>
        <view class="dept-info">
          <text class="dept-icon">🏢</text>
          <text class="dept-text">{{ userInfo.department || '未设置部门' }}</text>
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">基本信息</view>
      
      <view class="form-item">
        <view class="form-label">工号</view>
        <view class="form-value disabled">
          <text>{{ form.employeeCode }}</text>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">用户名</view>
        <view class="form-value disabled">
          <text>{{ form.username }}</text>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">姓名</view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            v-model="form.name" 
            placeholder="请输入姓名"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">性别</view>
        <view class="form-radio-wrapper">
          <radio-group @change="onGenderChange">
            <label class="radio-item">
              <radio :value="'male'" :checked="form.gender === 'male'" color="#409eff" />
              <text class="radio-text">男</text>
            </label>
            <label class="radio-item">
              <radio :value="'female'" :checked="form.gender === 'female'" color="#409eff" />
              <text class="radio-text">女</text>
            </label>
          </radio-group>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">手机号</view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            v-model="form.phone" 
            type="number"
            placeholder="请输入手机号"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">邮箱</view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            v-model="form.email" 
            type="text"
            placeholder="请输入邮箱"
          />
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">工作信息</view>

      <view class="form-item">
        <view class="form-label">职位</view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            v-model="form.position" 
            placeholder="请输入职位"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">入职日期</view>
        <picker 
          mode="date" 
          :value="form.joinDate" 
          :start="'2000-01-01'" 
          :end="currentDate"
          @change="onDateChange"
        >
          <view class="form-value picker-value">
            <text>{{ form.joinDate || '请选择日期' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">联系地址</view>
      <view class="form-item textarea-item">
        <view class="form-textarea-wrapper">
          <textarea 
            class="form-textarea" 
            v-model="form.address" 
            placeholder="请输入联系地址"
            :auto-height="true"
            :maxlength="200"
          />
        </view>
      </view>
    </view>

    <view class="button-section">
      <view class="btn btn-primary" @click="handleSave" :class="{ disabled: loading }">
        <text v-if="!loading">保存修改</text>
        <text v-else>保存中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { updateUserInfo } from '@/api'
import { storage, getRoleName, showToast, showModal } from '@/utils'
import { getCurrentDate as getToday } from '@/utils'

const userInfo = ref(storage.get('userInfo') || {})
const currentDate = ref(getToday())
const loading = ref(false)

const form = reactive({
  id: null,
  username: '',
  name: '',
  role: '',
  department: '',
  avatar: '',
  employeeCode: '',
  gender: 'male',
  phone: '',
  email: '',
  position: '',
  joinDate: '',
  address: ''
})

const roleName = computed(() => {
  return getRoleName(form.role)
})

const initForm = () => {
  const info = userInfo.value || storage.get('userInfo') || {}
  form.id = info.id
  form.username = info.username
  form.name = info.name
  form.role = info.role
  form.department = info.department
  form.avatar = info.avatar
  form.employeeCode = info.employeeCode || `EMP${String(info.id || 1).padStart(3, '0')}`
  form.gender = info.gender || 'male'
  form.phone = info.phone || ''
  form.email = info.email || ''
  form.position = info.position || ''
  form.joinDate = info.joinDate || '2024-01-01'
  form.address = info.address || ''
}

const onGenderChange = (e) => {
  form.gender = e.detail.value
}

const onDateChange = (e) => {
  form.joinDate = e.detail.value
}

const handleSave = async () => {
  if (loading.value) return

  if (!form.name || !form.name.trim()) {
    showToast('请输入姓名')
    return
  }

  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  if (form.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
    showToast('请输入正确的邮箱')
    return
  }

  const confirm = await showModal('确定要保存修改吗？')
  if (!confirm) return

  try {
    loading.value = true
    const res = await updateUserInfo(form)
    if (res.code === 200) {
      const newUserInfo = { ...storage.get('userInfo'), ...form }
      storage.set('userInfo', newUserInfo)
      userInfo.value = newUserInfo
      showToast('保存成功', 'success')
    } else {
      showToast(res.message || '保存失败')
    }
  } catch (error) {
    showToast('保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initForm()
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.profile-header {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  padding: 60rpx 40rpx 80rpx;
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  margin-right: 30rpx;
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-avatar text {
  font-size: 56rpx;
  color: #fff;
  font-weight: bold;
}

.user-info-header {
  flex: 1;
}

.user-name {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
  display: block;
}

.role-badge {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-top: 12rpx;

  &.admin {
    background: rgba(245, 108, 108, 0.3);
  }
  &.manager {
    background: rgba(230, 162, 60, 0.3);
  }
  &.user {
    background: rgba(103, 194, 58, 0.3);
  }

  text {
    font-size: 22rpx;
    color: #fff;
  }
}

.dept-info {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  background: rgba(255, 255, 255, 0.15);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  display: inline-block;
}

.dept-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.dept-text {
  font-size: 24rpx;
  color: #fff;
}

.form-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 0 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
  padding: 30rpx 0 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &.textarea-item {
    display: block;
  }
}

.form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #606266;
  flex-shrink: 0;
}

.form-value {
  flex: 1;
  display: flex;
  justify-content: flex-end;

  &.disabled text {
    color: #c0c4cc;
  }

  text {
    font-size: 28rpx;
    color: #303133;
  }
}

.form-input-wrapper {
  flex: 1;
}

.form-input {
  width: 100%;
  height: 60rpx;
  font-size: 28rpx;
  color: #303133;
  text-align: right;
}

.form-radio-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.radio-item {
  display: flex;
  align-items: center;
  margin-left: 40rpx;

  &:first-child {
    margin-left: 0;
  }
}

.radio-text {
  font-size: 28rpx;
  color: #303133;
  margin-left: 12rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-arrow {
  font-size: 32rpx;
  color: #c0c4cc;
  margin-left: 10rpx;
}

.form-textarea-wrapper {
  width: 100%;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #303133;
  padding: 20rpx 0;
}

.button-section {
  padding: 60rpx 30rpx;
}

.btn {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 32rpx;

  &.btn-primary {
    background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
    color: #fff;

    &.disabled {
      opacity: 0.6;
    }
  }
}
</style>
