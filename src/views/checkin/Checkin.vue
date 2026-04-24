<template>
  <div class="card-container checkin-card">
    <div class="checkin-time">{{ currentTime }}</div>
    <div class="checkin-date">{{ currentDate }} {{ currentWeekDay }}</div>
    
    <el-divider />
    
    <div class="checkin-buttons">
      <el-button
        type="primary"
        size="large"
        :loading="checkinLoading"
        :disabled="!canCheckin"
        @click="handleCheckin('checkin')"
        style="width: 120px; height: 50px; font-size: 16px;"
      >
        <el-icon><Plus /></el-icon>
        上班打卡
      </el-button>
      <el-button
        type="success"
        size="large"
        :loading="checkoutLoading"
        :disabled="!canCheckout"
        @click="handleCheckin('checkout')"
        style="width: 120px; height: 50px; font-size: 16px;"
      >
        <el-icon><Minus /></el-icon>
        下班打卡
      </el-button>
    </div>
    
    <el-divider />
    
    <div class="checkin-status">
      <div class="status-item">
        <div class="status-label">上班打卡</div>
        <div class="status-value" :class="checkinStatusClass">
          {{ checkinStatusText }}
        </div>
      </div>
      <div class="status-item">
        <div class="status-label">下班打卡</div>
        <div class="status-value" :class="checkoutStatusClass">
          {{ checkoutStatusText }}
        </div>
      </div>
      <div class="status-item">
        <div class="status-label">打卡地点</div>
        <div class="status-value" style="color: #409eff;">
          {{ location }}
        </div>
      </div>
    </div>
    
    <el-divider />
    
    <el-card>
      <template #header>
        <span>快速操作</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" plain @click="handleRecheckApply">
            <el-icon><EditPen /></el-icon>
            补卡申请
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" plain @click="handleLeaveApply">
            <el-icon><Calendar /></el-icon>
            请假申请
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" plain @click="handleOvertimeApply">
            <el-icon><Timer /></el-icon>
            加班申请
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" plain @click="handleViewRecords">
            <el-icon><List /></el-icon>
            查看记录
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <el-dialog
      v-model="recheckDialogVisible"
      title="补卡申请"
      width="500px"
    >
      <el-form :model="recheckForm" :rules="recheckRules" label-width="100px">
        <el-form-item label="补卡日期" prop="date">
          <el-date-picker
            v-model="recheckForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="补卡类型" prop="type">
          <el-select v-model="recheckForm.type" placeholder="请选择补卡类型" style="width: 100%">
            <el-option label="补签上班卡" value="补签上班卡" />
            <el-option label="补签下班卡" value="补签下班卡" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间" prop="requestTime">
          <el-time-picker
            v-model="recheckForm.requestTime"
            placeholder="选择时间"
            style="width: 100%"
            format="HH:mm"
            value-format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="申请原因" prop="reason">
          <el-input
            v-model="recheckForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入申请原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recheckDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecheckApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCheckinStore, useUserStore } from '@/store'
import { getStatusInfo, getCurrentDate, getWeekDay } from '@/utils'
import { applyRecheck } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()
const checkinStore = useCheckinStore()
const userStore = useUserStore()

const checkinLoading = ref(false)
const checkoutLoading = ref(false)
const recheckDialogVisible = ref(false)

const currentTime = computed(() => checkinStore.currentTime)
const canCheckin = computed(() => checkinStore.canCheckin)
const canCheckout = computed(() => checkinStore.canCheckout)
const todayCheckin = computed(() => checkinStore.todayCheckin)

const currentDate = computed(() => getCurrentDate())
const currentWeekDay = computed(() => getWeekDay(currentDate.value))

const location = computed(() => todayCheckin.value?.location || '北京市朝阳区科技园区A座')

const checkinStatusText = computed(() => {
  if (!todayCheckin.value) return '未打卡'
  if (!todayCheckin.value.checkinTime) return '未打卡'
  const statusInfo = getStatusInfo(todayCheckin.value.checkinStatus)
  return `${todayCheckin.value.checkinTime} (${statusInfo.label})`
})

const checkoutStatusText = computed(() => {
  if (!todayCheckin.value) return '未打卡'
  if (!todayCheckin.value.checkoutTime) return '未打卡'
  const statusInfo = getStatusInfo(todayCheckin.value.checkoutStatus)
  return `${todayCheckin.value.checkoutTime} (${statusInfo.label})`
})

const checkinStatusClass = computed(() => {
  if (!todayCheckin.value || !todayCheckin.value.checkinTime) return ''
  return getStatusInfo(todayCheckin.value.checkinStatus).class
})

const checkoutStatusClass = computed(() => {
  if (!todayCheckin.value || !todayCheckin.value.checkoutTime) return ''
  return getStatusInfo(todayCheckin.value.checkoutStatus).class
})

const recheckForm = ref({
  date: '',
  type: '',
  requestTime: '',
  reason: ''
})

const recheckRules = {
  date: [{ required: true, message: '请选择补卡日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择补卡类型', trigger: 'change' }],
  requestTime: [{ required: true, message: '请选择申请时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }]
}

const handleCheckin = async (type) => {
  if (type === 'checkin') {
    checkinLoading.value = true
  } else {
    checkoutLoading.value = true
  }
  
  try {
    const res = await checkinStore.performCheckin(type)
    if (res.code === 200) {
      ElMessage.success(res.data.message)
    }
  } catch (error) {
    console.error('打卡失败:', error)
  } finally {
    checkinLoading.value = false
    checkoutLoading.value = false
  }
}

const handleRecheckApply = () => {
  recheckForm.value = {
    date: '',
    type: '',
    requestTime: '',
    reason: ''
  }
  recheckDialogVisible.value = true
}

const submitRecheckApply = async () => {
  try {
    const res = await applyRecheck({
      ...recheckForm.value,
      userId: userStore.userInfo.id,
      userName: userStore.userInfo.name,
      department: userStore.userInfo.department
    })
    if (res.code === 200) {
      ElMessage.success('补卡申请已提交')
      recheckDialogVisible.value = false
    }
  } catch (error) {
    console.error('提交补卡申请失败:', error)
  }
}

const handleLeaveApply = () => {
  router.push('/leave')
}

const handleOvertimeApply = () => {
  router.push('/overtime')
}

const handleViewRecords = () => {
  router.push('/checkin-list')
}

onMounted(() => {
  checkinStore.startTimer()
  checkinStore.fetchTodayCheckin()
})

onUnmounted(() => {
  checkinStore.stopTimer()
})
</script>
