<template>
  <view class="login-container">
    <view class="login-bg">
      <view class="login-logo">
        <text class="logo-text">考勤打卡</text>
      </view>
      <view class="login-title">企业考勤打卡系统</view>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input 
          class="form-input" 
          v-model="loginForm.username" 
          placeholder="请输入用户名" 
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">密码</text>
        <input 
          class="form-input" 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入密码" 
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-checkbox">
        <checkbox-group @change="onCheckboxChange">
          <label class="checkbox-label">
            <checkbox :checked="loginForm.remember" color="#409eff" />
            <text class="checkbox-text">记住我</text>
          </label>
        </checkbox-group>
      </view>
      
      <button class="login-btn" :loading="loading" @click="handleLogin">
        登 录
      </button>
      
      <view class="test-accounts">
        <text class="test-title">测试账号：</text>
        <view class="test-item">
          <text class="test-label">管理员：</text>
          <text class="test-value">admin / 123456</text>
        </view>
        <view class="test-item">
          <text class="test-label">经理：</text>
          <text class="test-value">manager / 123456</text>
        </view>
        <view class="test-item">
          <text class="test-label">员工：</text>
          <text class="test-value">user1 / 123456</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { login } from '@/api'
import { storage, showToast, showLoading, hideLoading } from '@/utils'

const loading = ref(false)

const loginForm = reactive({
  username: 'user1',
  password: '123456',
  remember: true
})

const onCheckboxChange = (e) => {
  loginForm.remember = e.detail.value.length > 0
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    showToast('请输入用户名和密码')
    return
  }
  
  loading.value = true
  showLoading('登录中...')
  
  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 200) {
      storage.set('token', res.data.token)
      storage.set('userInfo', res.data.userInfo)
      storage.set('permissions', res.data.permissions)
      
      showToast('登录成功')
      
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
    hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #409eff 0%, #667eea 100%);
  position: relative;
}

.login-bg {
  padding: 80rpx 0 60rpx;
  text-align: center;
}

.login-logo {
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.login-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.login-form {
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 60rpx 40rpx 40rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  min-height: 60vh;
}

.form-item {
  margin-bottom: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  padding-bottom: 20rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #909399;
  margin-bottom: 15rpx;
}

.form-input {
  font-size: 32rpx;
  color: #303133;
  height: 60rpx;
}

.placeholder {
  color: #c0c4cc;
}

.form-checkbox {
  margin-bottom: 50rpx;
}

.checkbox-label {
  display: flex;
  align-items: center;
}

.checkbox-text {
  font-size: 28rpx;
  color: #606266;
  margin-left: 10rpx;
}

.login-btn {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
}

.test-accounts {
  margin-top: 60rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.test-title {
  font-size: 26rpx;
  color: #909399;
  display: block;
  margin-bottom: 20rpx;
}

.test-item {
  display: flex;
  margin-bottom: 15rpx;
}

.test-label {
  font-size: 24rpx;
  color: #909399;
  width: 120rpx;
}

.test-value {
  font-size: 24rpx;
  color: #606266;
}
</style>
