<template>
  <div class="card-container">
    <div class="search-bar">
      <el-input
        v-model="searchForm.userName"
        placeholder="请输入用户名/姓名"
        clearable
        style="width: 200px"
      />
      <el-select
        v-model="searchForm.department"
        placeholder="请选择部门"
        clearable
        style="width: 150px"
      >
        <el-option label="技术部" value="技术部" />
        <el-option label="销售部" value="销售部" />
        <el-option label="市场部" value="市场部" />
        <el-option label="人事部" value="人事部" />
        <el-option label="财务部" value="财务部" />
      </el-select>
      <el-select
        v-model="searchForm.role"
        placeholder="请选择角色"
        clearable
        style="width: 150px"
      >
        <el-option label="超级管理员" value="admin" />
        <el-option label="部门经理" value="manager" />
        <el-option label="普通员工" value="user" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleTagType(row.role)">
            {{ getRoleName(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="text" size="small" @click="handleResetPassword(row)">
            重置密码
          </el-button>
          <el-button type="text" size="small" style="color: #f56c6c;" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入姓名"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="技术部" value="技术部" />
            <el-option label="销售部" value="销售部" />
            <el-option label="市场部" value="市场部" />
            <el-option label="人事部" value="人事部" />
            <el-option label="财务部" value="财务部" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="admin" />
            <el-option label="部门经理" value="manager" />
            <el-option label="普通员工" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList } from '@/api'
import { getRoleName } from '@/utils'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  userName: '',
  department: '',
  role: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: '',
  username: '',
  name: '',
  password: '',
  department: '',
  role: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur', min: 6 }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const fetchData = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      userName: searchForm.userName || undefined,
      department: searchForm.department || undefined,
      role: searchForm.role || undefined
    }
    
    const res = await getUserList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const getRoleTagType = (role) => {
  const typeMap = {
    admin: 'danger',
    manager: 'warning',
    user: 'primary'
  }
  return typeMap[role] || 'info'
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.department = ''
  searchForm.role = ''
  pagination.page = 1
  fetchData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加用户'
  form.id = ''
  form.username = ''
  form.name = ''
  form.password = ''
  form.department = ''
  form.role = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.department = row.department
  form.role = row.role
  dialogVisible.value = true
}

const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置用户 "${row.name}" 的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为：123456')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>
