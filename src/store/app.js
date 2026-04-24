import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  const currentRoute = ref('')

  const isSidebarCollapsed = computed(() => sidebarCollapsed.value)
  const isLoading = computed(() => loading.value)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const setCurrentRoute = (route) => {
    currentRoute.value = route
  }

  return {
    sidebarCollapsed,
    loading,
    currentRoute,
    isSidebarCollapsed,
    isLoading,
    toggleSidebar,
    setLoading,
    setCurrentRoute
  }
})
