<template>
  <div class="change-password-container">
    <el-card shadow="never" class="password-card">
      <template #header>
        <div class="card-header">
          <span class="title">修改密码</span>
          <span class="subtitle">为了您的账户安全，请定期修改密码</span>
        </div>
      </template>

      <div class="password-content">
        <div class="tips-section">
          <el-alert
            title="密码安全提示"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul class="tips-list">
                <li>密码长度至少8位</li>
                <li>必须包含大小写字母、数字和特殊字符</li>
                <li>不要使用与用户名相同的密码</li>
                <li>建议每3个月更换一次密码</li>
              </ul>
            </template>
          </el-alert>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="password-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input
              v-model="form.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              @input="checkPasswordStrength"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <div class="password-strength" v-if="form.newPassword">
              <span class="strength-label">密码强度：</span>
              <div class="strength-bar">
                <span
                  class="strength-item"
                  v-for="(item, index) in 4"
                  :key="index"
                  :class="[
                    `strength-${passwordStrength.level}`,
                    { active: index < passwordStrength.level + 1 }
                  ]"
                ></span>
              </div>
              <span class="strength-text" :class="`strength-${passwordStrength.level}`">
                {{ passwordStrength.text }}
              </span>
            </div>
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            >
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              <el-icon><Check /></el-icon>
              确认修改
            </el-button>
            <el-button @click="handleReset">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { changePassword } from '@/api'

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordStrength = reactive({
  level: 0,
  text: '弱'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: '密码必须包含大小写字母、数字和特殊字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
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
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const res = await changePassword({
          oldPassword: form.oldPassword,
          newPassword: form.newPassword
        })
        if (res.code === 200) {
          ElMessage.success('密码修改成功')
          formRef.value.resetFields()
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  if (formRef.value) {
    ElMessageBox.confirm('确定要清空表单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      formRef.value.resetFields()
      passwordStrength.level = 0
      passwordStrength.text = '弱'
    }).catch(() => {})
  }
}
</script>

<style lang="scss" scoped>
.change-password-container {
  padding: 0;
}

.password-card {
  :deep(.el-card__header) {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.card-header {
  display: flex;
  flex-direction: column;

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .subtitle {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }
}

.password-content {
  max-width: 500px;
}

.tips-section {
  margin-bottom: 30px;

  .tips-list {
    margin: 10px 0 0 20px;
    padding: 0;

    li {
      font-size: 13px;
      color: #606266;
      line-height: 22px;
    }
  }
}

.password-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

.password-strength {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;

  .strength-label {
    color: #909399;
    margin-right: 8px;
  }

  .strength-bar {
    display: flex;
    gap: 4px;
    margin-right: 8px;

    .strength-item {
      width: 40px;
      height: 6px;
      border-radius: 3px;
      background: #e4e7ed;
      transition: all 0.3s;

      &.active {
        background: #c0c4cc;

        &.strength-0 {
          background: #f56c6c;
        }
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
  }

  .strength-text {
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
}
</style>
