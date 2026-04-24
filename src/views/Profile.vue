<template>
  <div class="profile-container">
    <el-card shadow="never" class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人信息</span>
          <span class="subtitle">查看和编辑您的个人资料</span>
        </div>
      </template>

      <div class="profile-content">
        <div class="profile-avatar-section">
          <el-avatar :size="100" :src="form.avatar">
            <el-icon size="50"><User /></el-icon>
          </el-avatar>
          <div class="avatar-info">
            <h2 class="user-name">{{ form.name }}</h2>
            <el-tag :type="roleTagType" class="role-tag">{{ roleName }}</el-tag>
            <p class="user-department">
              <el-icon><OfficeBuilding /></el-icon>
              {{ form.department }}
            </p>
          </div>
        </div>

        <el-divider />

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="profile-form"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="工号" prop="employeeCode">
                <el-input v-model="form.employeeCode" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio label="male">男</el-radio>
                  <el-radio label="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="职位" prop="position">
                <el-input v-model="form.position" placeholder="请输入职位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="入职日期" prop="joinDate">
                <el-date-picker
                  v-model="form.joinDate"
                  type="date"
                  placeholder="请选择日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%;"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="联系地址" prop="address">
            <el-input
              v-model="form.address"
              type="textarea"
              :rows="2"
              placeholder="请输入联系地址"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSave" :loading="loading">
              <el-icon><Check /></el-icon>
              保存修改
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store'
import { updateUserInfo } from '@/api'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  id: null,
  username: '',
  name: '',
  role: '',
  department: '',
  avatar: '',
  employeeCode: '',
  gender: '',
  phone: '',
  email: '',
  position: '',
  joinDate: '',
  address: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱', trigger: 'blur' }
  ]
}

const roleName = computed(() => {
  const roleMap = {
    admin: '超级管理员',
    manager: '部门经理',
    user: '普通员工'
  }
  return roleMap[form.role] || '未知角色'
})

const roleTagType = computed(() => {
  const typeMap = {
    admin: 'danger',
    manager: 'warning',
    user: 'success'
  }
  return typeMap[form.role] || 'info'
})

const initForm = () => {
  const userInfo = userStore.userInfo
  form.id = userInfo.id
  form.username = userInfo.username
  form.name = userInfo.name
  form.role = userInfo.role
  form.department = userInfo.department
  form.avatar = userInfo.avatar
  form.employeeCode = userInfo.employeeCode || `EMP${String(userInfo.id).padStart(3, '0')}`
  form.gender = userInfo.gender || 'male'
  form.phone = userInfo.phone || ''
  form.email = userInfo.email || ''
  form.position = userInfo.position || ''
  form.joinDate = userInfo.joinDate || '2024-01-01'
  form.address = userInfo.address || ''
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const res = await updateUserInfo(form)
        if (res.code === 200) {
          userStore.userInfo = { ...userStore.userInfo, ...form }
          ElMessage.success('保存成功')
        }
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const handleReset = () => {
  ElMessageBox.confirm('确定要重置表单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    initForm()
    ElMessage.info('已重置')
  }).catch(() => {})
}

onMounted(() => {
  initForm()
})
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 0;
}

.profile-card {
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

.profile-content {
  max-width: 800px;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  padding: 20px 0;

  .avatar-info {
    margin-left: 30px;

    .user-name {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }

    .role-tag {
      margin-bottom: 12px;
    }

    .user-department {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #606266;
      margin: 0;

      .el-icon {
        margin-right: 6px;
      }
    }
  }
}

.profile-form {
  margin-top: 20px;

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}
</style>
