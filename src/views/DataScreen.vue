<template>
  <div class="data-screen">
    <div class="screen-header">
      <div class="screen-title">企业考勤数据大屏</div>
      <div class="screen-time">{{ currentTime }}</div>
    </div>
    
    <div class="screen-content">
      <div class="screen-panel">
        <div class="screen-panel-title">今日考勤概览</div>
        <div class="screen-stats">
          <div class="screen-stat">
            <div class="screen-stat-label">总员工数</div>
            <div class="screen-stat-value">{{ statistics.totalEmployees }}</div>
          </div>
          <div class="screen-stat">
            <div class="screen-stat-label">已打卡</div>
            <div class="screen-stat-value" style="color: #67c23a;">{{ statistics.todayCheckin }}</div>
          </div>
          <div class="screen-stat">
            <div class="screen-stat-label">迟到</div>
            <div class="screen-stat-value" style="color: #e6a23c;">{{ statistics.todayLate }}</div>
          </div>
          <div class="screen-stat">
            <div class="screen-stat-label">缺勤</div>
            <div class="screen-stat-value" style="color: #f56c6c;">{{ statistics.todayAbsent }}</div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <div class="screen-panel-title">待办事项</div>
          <div class="screen-list">
            <div class="screen-list-item">
              <span class="screen-list-name">请假审批</span>
              <span class="screen-list-status status-warning" v-if="statistics.leavePending > 0">
                {{ statistics.leavePending }} 条待处理
              </span>
              <span class="screen-list-status status-success" v-else>无待处理</span>
            </div>
            <div class="screen-list-item">
              <span class="screen-list-name">加班审批</span>
              <span class="screen-list-status status-warning" v-if="statistics.overtimePending > 0">
                {{ statistics.overtimePending }} 条待处理
              </span>
              <span class="screen-list-status status-success" v-else>无待处理</span>
            </div>
            <div class="screen-list-item">
              <span class="screen-list-name">补卡审批</span>
              <span class="screen-list-status status-warning" v-if="statistics.recheckPending > 0">
                {{ statistics.recheckPending }} 条待处理
              </span>
              <span class="screen-list-status status-success" v-else>无待处理</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="screen-panel">
        <div class="screen-panel-title">实时打卡数据</div>
        <div class="chart-container" ref="centerChartRef" style="height: 300px;"></div>
        
        <div style="margin-top: 20px;">
          <div class="screen-panel-title">部门出勤率</div>
          <div class="chart-container" ref="deptChartRef" style="height: 200px;"></div>
        </div>
      </div>
      
      <div class="screen-panel">
        <div class="screen-panel-title">月度考勤统计</div>
        <div class="chart-container" ref="pieChartRef" style="height: 250px;"></div>
        
        <div style="margin-top: 20px;">
          <div class="screen-panel-title">最近打卡记录</div>
          <div class="screen-list">
            <div
              v-for="(record, index) in recentRecords"
              :key="record.id"
              class="screen-list-item"
            >
              <span class="screen-list-name">
                {{ index + 1 }}. {{ record.userName }}
              </span>
              <span
                class="screen-list-status"
                :class="record.status === 'normal' ? 'status-success' : (record.status === 'late' ? 'status-warning' : 'status-danger')"
              >
                {{ record.time }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div style="position: fixed; top: 20px; right: 20px;">
      <el-button type="primary" @click="goBack">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getStatisticsOverview, getStatisticsChart, getCheckinList } from '@/api'
import { getCurrentTime, getCurrentDate, getWeekDay } from '@/utils'

const router = useRouter()

const centerChartRef = ref(null)
const deptChartRef = ref(null)
const pieChartRef = ref(null)

let centerChart = null
let deptChart = null
let pieChart = null
let timer = null

const currentTime = ref('')
const statistics = ref({
  totalEmployees: 0,
  todayCheckin: 0,
  todayLate: 0,
  todayAbsent: 0,
  leavePending: 0,
  overtimePending: 0,
  recheckPending: 0,
  monthStatistics: {
    normal: 0,
    late: 0,
    early: 0,
    absent: 0
  }
})

const recentRecords = ref([])

const updateTime = () => {
  currentTime.value = `${getCurrentDate()} ${getWeekDay(getCurrentDate())} ${getCurrentTime()}`
}

const fetchData = async () => {
  try {
    const overviewRes = await getStatisticsOverview()
    if (overviewRes.code === 200) {
      statistics.value = overviewRes.data
      renderPieChart()
    }

    const dailyRes = await getStatisticsChart({ type: 'daily' })
    if (dailyRes.code === 200) {
      renderCenterChart(dailyRes.data)
    }

    const deptRes = await getStatisticsChart({ type: 'department' })
    if (deptRes.code === 200) {
      renderDeptChart(deptRes.data)
    }

    const recordsRes = await getCheckinList({ page: 1, pageSize: 5 })
    if (recordsRes.code === 200) {
      recentRecords.value = recordsRes.data.list.map(item => ({
        id: item.id,
        userName: item.userName,
        time: item.checkinTime,
        status: item.checkinStatus
      }))
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const renderCenterChart = (data) => {
  if (!centerChartRef.value) return
  
  centerChart = echarts.init(centerChartRef.value)
  
  centerChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['打卡人数', '迟到人数'],
      textStyle: { color: '#00d4ff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#8c9eb5' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#8c9eb5' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } }
    },
    series: [
      {
        name: '打卡人数',
        type: 'line',
        smooth: true,
        data: data.checkinData,
        itemStyle: { color: '#00d4ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
          ])
        }
      },
      {
        name: '迟到人数',
        type: 'line',
        smooth: true,
        data: data.lateData,
        itemStyle: { color: '#e6a23c' }
      }
    ]
  })
}

const renderDeptChart = (data) => {
  if (!deptChartRef.value) return
  
  deptChart = echarts.init(deptChartRef.value)
  
  deptChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#8c9eb5', formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      data: data.departments,
      axisLine: { lineStyle: { color: '#00d4ff' } },
      axisLabel: { color: '#8c9eb5' }
    },
    series: [
      {
        name: '出勤率',
        type: 'bar',
        data: data.checkinRates,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#7c3aed' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          color: '#00d4ff',
          formatter: '{c}%'
        }
      }
    ]
  })
}

const renderPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  const { normal, late, early, absent } = statistics.value.monthStatistics
  
  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#8c9eb5' }
    },
    series: [
      {
        name: '考勤状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['55%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0, 212, 255, 0.3)',
          borderWidth: 2
        },
        label: {
          show: true,
          color: '#8c9eb5',
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#00d4ff'
          }
        },
        data: [
          { value: normal, name: '正常', itemStyle: { color: '#67c23a' } },
          { value: late, name: '迟到', itemStyle: { color: '#e6a23c' } },
          { value: early, name: '早退', itemStyle: { color: '#f56c6c' } },
          { value: absent, name: '缺勤', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  })
}

const goBack = () => {
  router.back()
}

const handleResize = () => {
  centerChart?.resize()
  deptChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  window.removeEventListener('resize', handleResize)
  centerChart?.dispose()
  deptChart?.dispose()
  pieChart?.dispose()
})
</script>
