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
        v-model="searchForm.status"
        placeholder="请选择状态"
        clearable
        style="width: 150px"
      >
        <el-option label="待审批" value="pending" />
        <el-option label="已通过" value="approved" />
        <el-option label="已拒绝" value="rejected" />
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
        加班申请
      </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="员工姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="date" label="加班日期" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="100" />
      <el-table-column prop="endTime" label="结束时间" width="100" />
      <el-table-column prop="hours" label="时长(小时)" width="100" />
      <el-table-column prop="reason" label="加班原因" min-width="150" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusInfo(row.status).type">
            {{ getStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="申请时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleDetail(row)">
            详情
          </el-button>
          <template v-if="row.status === 'pending' && isManager">
            <el-button type="success" size="small" @click="handleApprove(row)">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">
              拒绝
            </el-button>
          </template>
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

    <el-dialog v-model="addDialogVisible" title="加班申请" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="加班日期" prop="date">
          <el-date-picker
            v-model="addForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker
            v-model="addForm.startTime"
            placeholder="选择开始时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker
            v-model="addForm.endTime"
            placeholder="选择结束时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="加班原因" prop="reason">
          <el-input
            v-model="addForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入加班原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">提交申请</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveDialogVisible" title="审批" width="400px">
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="审批结果">
          <el-tag :type="approveForm.result === 'approved' ? 'success' : 'danger'">
            {{ approveForm.result === 'approved' ? '通过' : '拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approveForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="加班详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="员工姓名">{{ currentRow.userName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentRow.department }}</el-descriptions-item>
        <el-descriptions-item label="加班日期">{{ currentRow.date }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ currentRow.hours }} 小时</el-descriptions-item>
        <el-descriptions-item label="加班原因">{{ currentRow.reason }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusInfo(currentRow.status).type">
            {{ getStatusInfo(currentRow.status).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ currentRow.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentRow.approveTime" label="审批时间">
          {{ currentRow.approveTime }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRow.approveComment" label="审批意见">
          {{ currentRow.approveComment }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOvertimeList, applyOvertime, approveOvertime } from '@/api'
import { getStatusInfo } from '@/utils'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const isManager = computed(() => userStore.isManager)

const tableData = ref([])
const addDialogVisible = ref(false)
const approveDialogVisible = ref(false)
const detailVisible = ref(false)
const currentRow = ref({})
const addFormRef = ref(null)

const searchForm = reactive({
  userName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const addForm = reactive({
  date: '',
  startTime: '',
  endTime: '',
  reason: ''
})

const addRules = {
  date: [{ required: true, message: '请选择加班日期', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入加班原因', trigger: 'blur' }]
}

const approveForm = reactive({
  id: null,
  result: '',
  comment: ''
})

const fetchData = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      userName: searchForm.userName || undefined,
      status: searchForm.status || undefined
    }
    
    const res = await getOvertimeList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取加班记录失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.status = ''
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
  addForm.date = ''
  addForm.startTime = ''
  addForm.endTime = ''
  addForm.reason = ''
  addDialogVisible.value = true
}

const submitAdd = async () => {
  const valid = await addFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    const start = parseInt(addForm.startTime.split(':')[0])
    const end = parseInt(addForm.endTime.split(':')[0])
    const hours = end - start
    
    const res = await applyOvertime({
      ...addForm,
      hours,
      userId: userStore.userInfo.id,
      userName: userStore.userInfo.name,
      department: userStore.userInfo.department
    })
    if (res.code === 200) {
      ElMessage.success('加班申请已提交')
      addDialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    console.error('提交加班申请失败:', error)
  }
}

const handleApprove = (row) => {
  approveForm.id = row.id
  approveForm.result = 'approved'
  approveForm.comment = ''
  approveDialogVisible.value = true
}

const handleReject = (row) => {
  approveForm.id = row.id
  approveForm.result = 'rejected'
  approveForm.comment = ''
  approveDialogVisible.value = true
}

const submitApprove = async () => {
  try {
    const res = await approveOvertime({
      id: approveForm.id,
      status: approveForm.result,
      comment: approveForm.comment
    })
    if (res.code === 200) {
      ElMessage.success('审批成功')
      approveDialogVisible.value = false
      fetchData()
    }
  } catch (error) {
    console.error('审批失败:', error)
  }
}

const handleDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>
