<template>
  <div class="card-container">
    <div class="search-bar">
      <el-input
        v-model="searchForm.userName"
        placeholder="请输入员工姓名"
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
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="primary" @click="handleAdd" v-if="isManager">
        <el-icon><Plus /></el-icon>
        添加排班
      </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="员工姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="scheduleType" label="排班类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getScheduleTypeColor(row.scheduleType)">
            {{ row.scheduleType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="checkinTime" label="上班时间" width="100" />
      <el-table-column prop="checkoutTime" label="下班时间" width="100" />
      <el-table-column prop="startDate" label="生效日期" width="120" />
      <el-table-column prop="endDate" label="失效日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusInfo(row.status).type">
            {{ getStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" v-if="isManager">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="text" size="small" @click="handleDelete(row)">
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
        <el-form-item label="员工" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择员工" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排班类型" prop="scheduleType">
          <el-select v-model="form.scheduleType" placeholder="请选择排班类型" style="width: 100%" @change="handleScheduleTypeChange">
            <el-option label="早班" value="早班" />
            <el-option label="中班" value="中班" />
            <el-option label="晚班" value="晚班" />
            <el-option label="弹性工作制" value="弹性工作制" />
          </el-select>
        </el-form-item>
        <el-form-item label="上班时间" prop="checkinTime">
          <el-time-picker
            v-model="form.checkinTime"
            placeholder="选择上班时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="下班时间" prop="checkoutTime">
          <el-time-picker
            v-model="form.checkoutTime"
            placeholder="选择下班时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="生效日期" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="选择生效日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="失效日期" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="选择失效日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScheduleList, addSchedule, getUserList } from '@/api'
import { getStatusInfo } from '@/utils'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const isManager = computed(() => userStore.isManager)

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('添加排班')
const isEdit = ref(false)
const formRef = ref(null)

const userList = ref([])

const searchForm = reactive({
  userName: '',
  department: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  userId: '',
  userName: '',
  department: '',
  scheduleType: '',
  checkinTime: '',
  checkoutTime: '',
  startDate: '',
  endDate: ''
})

const rules = {
  userId: [{ required: true, message: '请选择员工', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择排班类型', trigger: 'change' }],
  checkinTime: [{ required: true, message: '请选择上班时间', trigger: 'change' }],
  checkoutTime: [{ required: true, message: '请选择下班时间', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择失效日期', trigger: 'change' }]
}

const scheduleTimeMap = {
  '早班': { checkin: '08:00', checkout: '17:00' },
  '中班': { checkin: '09:00', checkout: '18:00' },
  '晚班': { checkin: '13:00', checkout: '22:00' },
  '弹性工作制': { checkin: '10:00', checkout: '19:00' }
}

const fetchData = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      userName: searchForm.userName || undefined,
      department: searchForm.department || undefined
    }
    
    const res = await getScheduleList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取排班列表失败:', error)
  }
}

const fetchUserList = async () => {
  try {
    const res = await getUserList({ page: 1, pageSize: 100 })
    if (res.code === 200) {
      userList.value = res.data.list
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const getScheduleTypeColor = (type) => {
  const colorMap = {
    '早班': 'primary',
    '中班': 'success',
    '晚班': 'warning',
    '弹性工作制': 'info'
  }
  return colorMap[type] || 'info'
}

const handleScheduleTypeChange = (type) => {
  const timeMap = scheduleTimeMap[type]
  if (timeMap) {
    form.checkinTime = timeMap.checkin
    form.checkoutTime = timeMap.checkout
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.department = ''
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
  dialogTitle.value = '添加排班'
  form.userId = ''
  form.userName = ''
  form.department = ''
  form.scheduleType = ''
  form.checkinTime = ''
  form.checkoutTime = ''
  form.startDate = ''
  form.endDate = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑排班'
  form.userId = row.userId
  form.userName = row.userName
  form.department = row.department
  form.scheduleType = row.scheduleType
  form.checkinTime = row.checkinTime
  form.checkoutTime = row.checkoutTime
  form.startDate = row.startDate
  form.endDate = row.endDate
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该排班吗？', '提示', {
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
  
  const selectedUser = userList.value.find(u => u.id === form.userId)
  if (selectedUser) {
    form.userName = selectedUser.name
    form.department = selectedUser.department
  }
  
  try {
    const res = await addSchedule(form)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}

onMounted(() => {
  fetchData()
  fetchUserList()
})
</script>
