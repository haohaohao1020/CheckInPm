<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon size="30"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">总员工数</div>
            <div class="stat-value">{{ statistics.totalEmployees }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #67c23a;">
            <el-icon size="30"><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">今日打卡</div>
            <div class="stat-value">{{ statistics.todayCheckin }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon size="30"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">今日迟到</div>
            <div class="stat-value">{{ statistics.todayLate }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f56c6c;">
            <el-icon size="30"><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">今日缺勤</div>
            <div class="stat-value">{{ statistics.todayAbsent }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">本月考勤统计</h3>
          <div class="chart-container" ref="monthChartRef"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">待办事项</h3>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <span>请假审批</span>
            <el-tag type="warning" v-if="statistics.leavePending > 0">{{ statistics.leavePending }} 条待处理</el-tag>
            <el-tag type="success" v-else>无待处理</el-tag>
          </div>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <span>加班审批</span>
            <el-tag type="warning" v-if="statistics.overtimePending > 0">{{ statistics.overtimePending }} 条待处理</el-tag>
            <el-tag type="success" v-else>无待处理</el-tag>
          </div>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <span>补卡审批</span>
            <el-tag type="warning" v-if="statistics.recheckPending > 0">{{ statistics.recheckPending }} 条待处理</el-tag>
            <el-tag type="success" v-else>无待处理</el-tag>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">近7天打卡趋势</h3>
          <div class="chart-container" ref="dailyChartRef"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">部门出勤率</h3>
          <div class="chart-container" ref="deptChartRef"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getStatisticsOverview, getStatisticsChart } from '@/api'

const monthChartRef = ref(null)
const dailyChartRef = ref(null)
const deptChartRef = ref(null)

let monthChart = null
let dailyChart = null
let deptChart = null

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

const fetchData = async () => {
  try {
    const overviewRes = await getStatisticsOverview()
    if (overviewRes.code === 200) {
      statistics.value = overviewRes.data
      renderMonthChart()
    }

    const dailyRes = await getStatisticsChart({ type: 'daily' })
    if (dailyRes.code === 200) {
      renderDailyChart(dailyRes.data)
    }

    const deptRes = await getStatisticsChart({ type: 'department' })
    if (deptRes.code === 200) {
      renderDeptChart(deptRes.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const renderMonthChart = () => {
  if (!monthChartRef.value) return
  
  monthChart = echarts.init(monthChartRef.value)
  const { normal, late, early, absent } = statistics.value.monthStatistics
  
  monthChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '考勤状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
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

const renderDailyChart = (data) => {
  if (!dailyChartRef.value) return
  
  dailyChart = echarts.init(dailyChartRef.value)
  
  dailyChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['打卡人数', '迟到人数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '打卡人数',
        type: 'line',
        smooth: true,
        data: data.checkinData,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
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
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100
    },
    yAxis: {
      type: 'category',
      data: data.departments
    },
    series: [
      {
        name: '出勤率',
        type: 'bar',
        data: data.checkinRates,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }
    ]
  })
}

const handleResize = () => {
  monthChart?.resize()
  dailyChart?.resize()
  deptChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  monthChart?.dispose()
  dailyChart?.dispose()
  deptChart?.dispose()
})
</script>
