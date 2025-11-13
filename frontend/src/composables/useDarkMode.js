import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
  const isDark = ref(false)

  // Charger la préférence depuis localStorage
  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDark.value = saved === 'true'
    } else {
      // Détecter la préférence système
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  })

  // Appliquer le thème
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Toggle avec sauvegarde
  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value.toString())
    applyTheme()
  }

  // Watch pour changements
  watch(isDark, applyTheme)

  return { isDark, toggle }
}
