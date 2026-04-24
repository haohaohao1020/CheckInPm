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
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 240px"
      />
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="userName" label="员工姓名" width="100" />
      <el-table-column prop="department" label="部门" width="100" />
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="checkinTime" label="上班打卡" width="100">
        <template #default="{ row }">
          <div>
            <span>{{ row.checkinTime || '--:--' }}</span>
            <el-tag
              v-if="row.checkinStatus"
              :type="getStatusInfo(row.checkinStatus).type"
              size="small"
              style="margin-left: 5px"
            >
              {{ getStatusInfo(row.checkinStatus).label }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="checkoutTime" label="下班打卡" width="100">
        <template #default="{ row }">
          <div>
            <span>{{ row.checkoutTime || '--:--' }}</span>
            <el-tag
              v-if="row.checkoutStatus"
              :type="getStatusInfo(row.checkoutStatus).type"
              size="small"
              style="margin-left: 5px"
            >
              {{ getStatusInfo(row.checkoutStatus).label }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="打卡地点" min-width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="text" size="small" @click="handleDetail(row)">
            详情
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

    <el-dialog v-model="detailVisible" title="打卡详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="员工姓名">{{ currentRow.userName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentRow.department }}</el-descriptions-item>
        <el-descriptions-item label="日期">{{ currentRow.date }}</el-descriptions-item>
        <el-descriptions-item label="上班打卡时间">
          {{ currentRow.checkinTime || '--:--' }}
          <el-tag
            v-if="currentRow.checkinStatus"
            :type="getStatusInfo(currentRow.checkinStatus).type"
            size="small"
            style="margin-left: 10px"
          >
            {{ getStatusInfo(currentRow.checkinStatus).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下班打卡时间">
          {{ currentRow.checkoutTime || '--:--' }}
          <el-tag
            v-if="currentRow.checkoutStatus"
            :type="getStatusInfo(currentRow.checkoutStatus).type"
            size="small"
            style="margin-left: 10px"
          >
            {{ getStatusInfo(currentRow.checkoutStatus).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="打卡地点">{{ currentRow.location }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCheckinList, exportCheckin } from '@/api'
import { getStatusInfo, downloadFile } from '@/utils'
import * as XLSX from 'xlsx'

const tableData = ref([])
const detailVisible = ref(false)
const currentRow = ref({})

const searchForm = reactive({
  userName: '',
  department: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const fetchData = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      userName: searchForm.userName || undefined,
      department: searchForm.department || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined
    }
    
    const res = await getCheckinList(params)
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取打卡记录失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.userName = ''
  searchForm.department = ''
  searchForm.dateRange = []
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

const handleDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleExport = async () => {
  try {
    const res = await exportCheckin()
    if (res.code === 200) {
      const data = res.data.map(item => ({
        'ID': item.id,
        '员工姓名': item.userName,
        '部门': item.department,
        '日期': item.date,
        '上班打卡': item.checkinTime,
        '上班状态': getStatusInfo(item.checkinStatus).label,
        '下班打卡': item.checkoutTime,
        '下班状态': getStatusInfo(item.checkoutStatus).label,
        '打卡地点': item.location
      }))
      
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '打卡记录')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      downloadFile(blob, `打卡记录_${new Date().toISOString().split('T')[0]}.xlsx`)
      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>
