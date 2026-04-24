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
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="员工姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="date" label="补卡日期" width="120" />
      <el-table-column prop="type" label="补卡类型" width="120" />
      <el-table-column prop="requestTime" label="申请时间" width="100" />
      <el-table-column prop="reason" label="申请原因" min-width="150" show-overflow-tooltip />
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
          <template v-if="row.status === 'pending'">
            <el-button type="success" size="small" @click="handleApprove(row)">
              通过
            </el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">
              拒绝
            </el-button>
          </template>
          <template v-else>
            <el-button type="text" size="small" @click="handleDetail(row)">
              详情
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

    <el-dialog v-model="detailVisible" title="补卡详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="员工姓名">{{ currentRow.userName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentRow.department }}</el-descriptions-item>
        <el-descriptions-item label="补卡日期">{{ currentRow.date }}</el-descriptions-item>
        <el-descriptions-item label="补卡类型">{{ currentRow.type }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ currentRow.requestTime || '--:--' }}
        </el-descriptions-item>
        <el-descriptions-item label="申请原因">{{ currentRow.reason }}</el-descriptions-item>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecheckList, approveRecheck } from '@/api'
import { getStatusInfo } from '@/utils'

const tableData = ref([])
const approveDialogVisible = ref(false)
const detailVisible = ref(false)
const currentRow = ref({})

const searchForm = reactive({
  userName: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

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
    
    const res = await getRecheckList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取补卡记录失败:', error)
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
    const res = await approveRecheck({
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
