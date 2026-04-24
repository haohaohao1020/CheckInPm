<template>
  <view class="password-container">
    <view class="tips-section">
      <view class="tips-header">
        <text class="tips-icon">🔒</text>
        <text class="tips-title">密码安全提示</text>
      </view>
      <view class="tips-content">
        <view class="tips-item" v-for="(tip, index) in tipsList" :key="index">
          <text class="tips-bullet">•</text>
          <text class="tips-text">{{ tip }}</text>
        </view>
      </view>
    </view>

    <view class="form-section">
      <view class="section-title">修改密码</view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-icon">🔐</text>
          <text>当前密码</text>
        </view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            :type="showOldPassword ? 'text' : 'password'"
            v-model="form.oldPassword" 
            placeholder="请输入当前密码"
            :maxlength="20"
          />
          <view class="toggle-eye" @click="toggleOldPassword">
            <text v-if="showOldPassword">👁️</text>
            <text v-else>🙈</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-icon">🔑</text>
          <text>新密码</text>
        </view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            :type="showNewPassword ? 'text' : 'password'"
            v-model="form.newPassword" 
            placeholder="请输入新密码"
            :maxlength="20"
            @input="checkPasswordStrength"
          />
          <view class="toggle-eye" @click="toggleNewPassword">
            <text v-if="showNewPassword">👁️</text>
            <text v-else>🙈</text>
          </view>
        </view>
        <view class="password-strength" v-if="form.newPassword">
          <view class="strength-bar">
            <view 
              class="strength-item"
              v-for="(item, index) in 4"
              :key="index"
              :class="[
                `strength-${passwordStrength.level}`,
                { active: index < passwordStrength.level + 1 }
              ]"
            ></view>
          </view>
          <text class="strength-text" :class="`strength-${passwordStrength.level}`">
            密码强度：{{ passwordStrength.text }}
          </text>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-icon">✅</text>
          <text>确认密码</text>
        </view>
        <view class="form-input-wrapper">
          <input 
            class="form-input" 
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="form.confirmPassword" 
            placeholder="请再次输入新密码"
            :maxlength="20"
          />
          <view class="toggle-eye" @click="toggleConfirmPassword">
            <text v-if="showConfirmPassword">👁️</text>
            <text v-else>🙈</text>
          </view>
        </view>
      </view>
    </view>

    <view class="button-section">
      <view class="btn btn-primary" @click="handleSubmit" :class="{ disabled: loading }">
        <text v-if="!loading">确认修改</text>
        <text v-else>修改中...</text>
      </view>
      <view class="btn btn-default" @click="handleReset">
        <text>重置</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { changePassword } from '@/api'
import { showToast, showModal } from '@/utils'

const loading = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordStrength = reactive({
  level: 0,
  text: '弱'
})

const tipsList = [
  '密码长度至少8位',
  '必须包含大小写字母',
  '必须包含数字和特殊字符',
  '不要使用与用户名相同的密码',
  '建议每3个月更换一次密码'
]

const toggleOldPassword = () => {
  showOldPassword.value = !showOldPassword.value
}

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const checkPasswordStrength = () => {
  const password = form.newPassword
  let level = 0
  let text = '弱'

  if (password.length >= 8) level++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) level++
  if (/\d/.test(password)) level++
  if (/[@$!%*?&]/.test(password)) level++

  if (level <= 1) {
    text = '弱'
  } else if (level <= 2) {
    text = '一般'
  } else if (level <= 3) {
    text = '良好'
  } else {
    text = '强'
  }

  passwordStrength.level = level
  passwordStrength.text = text
}

const handleSubmit = async () => {
  if (loading.value) return

  if (!form.oldPassword) {
    showToast('请输入当前密码')
    return
  }

  if (!form.newPassword) {
    showToast('请输入新密码')
    return
  }

  if (form.newPassword.length < 8) {
    showToast('密码长度至少8位')
    return
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.newPassword)) {
    showToast('密码需包含大小写字母、数字和特殊字符')
    return
  }

  if (!form.confirmPassword) {
    showToast('请确认新密码')
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  const confirm = await showModal('确定要修改密码吗？修改后需要重新登录。')
  if (!confirm) return

  try {
    loading.value = true
    const res = await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    if (res.code === 200) {
      showToast('密码修改成功', 'success')
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }, 1500)
    } else {
      showToast(res.message || '密码修改失败')
    }
  } catch (error) {
    showToast('密码修改失败')
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  const confirm = await showModal('确定要清空表单吗？')
  if (!confirm) return

  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  passwordStrength.level = 0
  passwordStrength.text = '弱'
  showToast('已重置', 'success')
}
</script>

<style lang="scss" scoped>
.password-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 120rpx;
}

.tips-section {
  background: #ecf5ff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  border-left: 8rpx solid #409eff;
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.tips-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.tips-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #409eff;
}

.tips-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.tips-bullet {
  font-size: 24rpx;
  color: #409eff;
  margin-right: 10rpx;
  line-height: 36rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #606266;
  line-height: 36rpx;
  flex: 1;
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
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.form-item {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .label-icon {
    font-size: 28rpx;
    margin-right: 10rpx;
  }

  text {
    font-size: 28rpx;
    color: #606266;
    font-weight: 500;
  }
}

.form-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #303133;
}

.toggle-eye {
  padding: 10rpx;
  margin-left: 10rpx;

  text {
    font-size: 36rpx;
  }
}

.password-strength {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 0 10rpx;
}

.strength-bar {
  display: flex;
  gap: 8rpx;
  margin-right: 16rpx;
}

.strength-item {
  width: 60rpx;
  height: 10rpx;
  border-radius: 5rpx;
  background: #e4e7ed;
  transition: all 0.3s;

  &.active {
    background: #c0c4cc;

    &.strength-0,
    &.strength-1 {
      background: #f56c6c;
    }
    &.strength-2 {
      background: #e6a23c;
    }
    &.strength-3 {
      background: #67c23a;
    }
  }
}

.strength-text {
  font-size: 24rpx;
  color: #909399;

  &.strength-0,
  &.strength-1 {
    color: #f56c6c;
  }
  &.strength-2 {
    color: #e6a23c;
  }
  &.strength-3 {
    color: #67c23a;
  }
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
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }

  &.btn-primary {
    background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
    color: #fff;

    &.disabled {
      opacity: 0.6;
    }
  }

  &.btn-default {
    background: #fff;
    color: #606266;
    border: 2rpx solid #dcdfe6;
  }
}
</style>
