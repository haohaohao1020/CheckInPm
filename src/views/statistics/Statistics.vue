<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #409eff;">
            <el-icon size="30"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">本月出勤</div>
            <div class="stat-value">{{ statistics.monthStatistics?.normal || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #e6a23c;">
            <el-icon size="30"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">本月迟到</div>
            <div class="stat-value">{{ statistics.monthStatistics?.late || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #f56c6c;">
            <el-icon size="30"><Close /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">本月早退</div>
            <div class="stat-value">{{ statistics.monthStatistics?.early || 0 }}</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: #909399;">
            <el-icon size="30"><InfoFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-title">本月缺勤</div>
            <div class="stat-value">{{ statistics.monthStatistics?.absent || 0 }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">月度考勤趋势</h3>
          <div class="chart-container" ref="monthlyChartRef"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">部门出勤率</h3>
          <div class="chart-container" ref="deptChartRef"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">考勤状态分布</h3>
          <div class="chart-container" ref="pieChartRef"></div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="card-container">
          <h3 style="margin-bottom: 20px;">待审批统计</h3>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
            <span style="font-size: 16px;">请假审批</span>
            <div>
              <span style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ statistics.leavePending || 0 }}</span>
              <span style="color: #909399;"> 条</span>
            </div>
          </div>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
            <span style="font-size: 16px;">加班审批</span>
            <div>
              <span style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ statistics.overtimePending || 0 }}</span>
              <span style="color: #909399;"> 条</span>
            </div>
          </div>
          <el-divider />
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0;">
            <span style="font-size: 16px;">补卡审批</span>
            <div>
              <span style="font-size: 24px; font-weight: bold; color: #e6a23c;">{{ statistics.recheckPending || 0 }}</span>
              <span style="color: #909399;"> 条</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getStatisticsOverview, getStatisticsChart } from '@/api'

const monthlyChartRef = ref(null)
const deptChartRef = ref(null)
const pieChartRef = ref(null)

let monthlyChart = null
let deptChart = null
let pieChart = null

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
      renderPieChart()
    }

    const monthlyRes = await getStatisticsChart({ type: 'monthly' })
    if (monthlyRes.code === 200) {
      renderMonthlyChart(monthlyRes.data)
    }

    const deptRes = await getStatisticsChart({ type: 'department' })
    if (deptRes.code === 200) {
      renderDeptChart(deptRes.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const renderMonthlyChart = (data) => {
  if (!monthlyChartRef.value) return
  
  monthlyChart = echarts.init(monthlyChartRef.value)
  
  monthlyChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['出勤率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.months,
      axisLabel: {
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'line',
        smooth: true,
        data: data.attendanceRates,
        itemStyle: { color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        }
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
    legend: {
      data: ['出勤率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.departments
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '出勤率',
        type: 'bar',
        data: data.checkinRates,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
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
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true
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

const handleResize = () => {
  monthlyChart?.resize()
  deptChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  fetchData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  monthlyChart?.dispose()
  deptChart?.dispose()
  pieChart?.dispose()
})
</script>
