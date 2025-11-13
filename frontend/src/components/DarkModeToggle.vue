<script setup>
import { useDarkMode } from '../composables/useDarkMode'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <button
    @click="toggle"
    class="relative w-14 h-14 rounded-full flex items-center justify-center
           transition-all duration-300 ease-out hover:scale-105 active:scale-95"
    :class="isDark
      ? 'bg-[#2c2c2c] shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#3e3e3e]'
      : 'bg-[#e0e0e0] shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#fbfbfb]'"
    aria-label="Toggle dark mode"
  >
    <!-- Icône Soleil (Light mode) -->
    <Transition name="fade" mode="out-in">
      <svg
        v-if="!isDark"
        key="sun"
        class="w-6 h-6 text-orange-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      <!-- Icône Lune (Dark mode) -->
      <svg
        v-else
        key="moon"
        class="w-6 h-6 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}
</style>
