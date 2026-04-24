import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTodayCheckin, doCheckin } from '@/api'
import { getCurrentTime } from '@/utils'
import dayjs from 'dayjs'

export const useCheckinStore = defineStore('checkin', () => {
  const todayCheckin = ref(null)
  const currentTime = ref(getCurrentTime())
  const timeInterval = ref(null)

  const canCheckin = computed(() => {
    if (!todayCheckin.value) return false
    return !todayCheckin.value.checkinTime
  })

  const canCheckout = computed(() => {
    if (!todayCheckin.value) return false
    return todayCheckin.value.checkinTime && !todayCheckin.value.checkoutTime
  })

  const checkinStatus = computed(() => {
    if (!todayCheckin.value) return null
    return {
      checkin: todayCheckin.value.checkinStatus,
      checkout: todayCheckin.value.checkoutStatus
    }
  })

  const startTimer = () => {
    if (timeInterval.value) {
      clearInterval(timeInterval.value)
    }
    timeInterval.value = setInterval(() => {
      currentTime.value = getCurrentTime()
    }, 1000)
  }

  const stopTimer = () => {
    if (timeInterval.value) {
      clearInterval(timeInterval.value)
      timeInterval.value = null
    }
  }

  const fetchTodayCheckin = async () => {
    const res = await getTodayCheckin()
    if (res.code === 200) {
      todayCheckin.value = res.data
    }
    return res
  }

  const performCheckin = async (type) => {
    const res = await doCheckin({ type })
    if (res.code === 200) {
      if (type === 'checkin') {
        todayCheckin.value.checkinTime = res.data.time
        todayCheckin.value.checkinStatus = res.data.status
      } else {
        todayCheckin.value.checkoutTime = res.data.time
        todayCheckin.value.checkoutStatus = res.data.status
      }
    }
    return res
  }

  return {
    todayCheckin,
    currentTime,
    canCheckin,
    canCheckout,
    checkinStatus,
    startTimer,
    stopTimer,
    fetchTodayCheckin,
    performCheckin
  }
})
