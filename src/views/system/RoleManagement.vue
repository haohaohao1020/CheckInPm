<template>
  <div class="card-container">
    <div class="search-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加角色
      </el-button>
    </div>

    <el-table :data="roleList" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色标识" width="150">
        <template #default="{ row }">
          <el-tag>{{ row.code }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="text" size="small" @click="handlePermission(row)">
            权限配置
          </el-button>
          <el-button
            type="text"
            size="small"
            style="color: #f56c6c;"
            @click="handleDelete(row)"
            :disabled="row.code === 'admin'"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入角色名称"
          />
        </el-form-item>
        <el-form-item label="角色标识" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入角色标识"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="600px">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        :props="{ label: 'name', children: 'children' }"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统所有权限，可以管理所有用户和角色'
  },
  {
    id: 2,
    name: '部门经理',
    code: 'manager',
    description: '可以管理本部门员工，审批请假、加班、补卡等申请'
  },
  {
    id: 3,
    name: '普通员工',
    code: 'user',
    description: '可以打卡、申请请假加班、查看个人考勤记录'
  }
])

const permissionTree = ref([
  {
    id: 1,
    name: '首页',
    code: 'dashboard',
    children: []
  },
  {
    id: 2,
    name: '打卡管理',
    code: 'checkin',
    children: [
      { id: 21, name: '打卡签到', code: 'checkin-sign' },
      { id: 22, name: '打卡记录', code: 'checkin-list' }
    ]
  },
  {
    id: 3,
    name: '补卡审批',
    code: 'checkin-approval',
    children: []
  },
  {
    id: 4,
    name: '请假加班',
    code: 'leave-overtime',
    children: [
      { id: 41, name: '请假管理', code: 'leave' },
      { id: 42, name: '加班管理', code: 'overtime' }
    ]
  },
  {
    id: 5,
    name: '排班管理',
    code: 'schedule',
    children: []
  },
  {
    id: 6,
    name: '考勤统计',
    code: 'statistics',
    children: []
  },
  {
    id: 7,
    name: '数据大屏',
    code: 'data-screen',
    children: []
  },
  {
    id: 8,
    name: '导出功能',
    code: 'export',
    children: []
  },
  {
    id: 9,
    name: '系统管理',
    code: 'system',
    children: [
      { id: 91, name: '用户管理', code: 'user-management' },
      { id: 92, name: '角色权限', code: 'role-management' }
    ]
  }
])

const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('添加角色')
const isEdit = ref(false)
const formRef = ref(null)
const treeRef = ref(null)
const currentRole = ref(null)
const checkedPermissions = ref([])

const form = reactive({
  id: '',
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色标识', trigger: 'blur' }]
}

const rolePermissions = {
  admin: [1, 2, 21, 22, 3, 4, 41, 42, 5, 6, 7, 8, 9, 91, 92],
  manager: [1, 2, 21, 22, 3, 4, 41, 42, 5, 6, 8],
  user: [1, 2, 21, 22, 4, 41, 42, 6]
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加角色'
  form.id = ''
  form.name = ''
  form.code = ''
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.description = row.description
  dialogVisible.value = true
}

const handlePermission = (row) => {
  currentRole.value = row
  checkedPermissions.value = rolePermissions[row.code] || []
  permissionDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      roleList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const submitForm = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (isEdit.value) {
    const item = roleList.value.find(item => item.id === form.id)
    if (item) {
      Object.assign(item, form)
    }
    ElMessage.success('编辑成功')
  } else {
    roleList.value.push({
      id: roleList.value.length + 1,
      ...form
    })
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}

const savePermissions = () => {
  const checkedKeys = treeRef.value.getCheckedKeys()
  const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  
  if (currentRole.value) {
    rolePermissions[currentRole.value.code] = allKeys
  }
  
  ElMessage.success('权限保存成功')
  permissionDialogVisible.value = false
}

onMounted(() => {})
</script>
