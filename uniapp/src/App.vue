<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333;
}

.container {
  padding: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.btn-success {
  background: linear-gradient(135deg, #67c23a 0%, #5cb85c 100%);
  border: none;
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.btn-warning {
  background: linear-gradient(135deg, #e6a23c 0%, #f0ad4e 100%);
  border: none;
  border-radius: 50rpx;
  color: #fff;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.text-primary {
  color: #409eff;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-secondary {
  color: #909399;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.text-center {
  text-align: center;
}

.text-bold {
  font-weight: bold;
}

.mt-20 {
  margin-top: 20rpx;
}

.mt-40 {
  margin-top: 40rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.mb-40 {
  margin-bottom: 40rpx;
}

.p-20 {
  padding: 20rpx;
}

.p-30 {
  padding: 30rpx;
}
</style>
