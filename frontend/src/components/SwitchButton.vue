<script setup>
import { ref } from 'vue'

defineProps({ loading: Boolean })

const emit = defineEmits(['switch'])
const pressed = ref(false)
const isFlipped = ref(false)

const handleSwitch = () => {
  isFlipped.value = !isFlipped.value
  emit('switch')
}
</script>

<template>
  <div class="flex justify-center my-8">
    <button
      @click="handleSwitch"
      @touchstart="pressed = true"
      @touchend="pressed = false"
      @mousedown="pressed = true"
      @mouseup="pressed = false"
      @mouseleave="pressed = false"
      :disabled="loading"
      class="relative w-16 h-16 bg-[var(--color-neu-bg)] rounded-full flex items-center justify-center
             transition-all duration-300 ease-out active:scale-95 disabled:opacity-50"
      :style="pressed && !loading
        ? { boxShadow: 'inset 2px 2px 4px var(--color-neu-shadow-dark), inset -2px -2px 4px var(--color-neu-shadow-light)' }
        : { boxShadow: '6px 6px 12px var(--color-neu-shadow-dark), -6px -6px 12px var(--color-neu-shadow-light)' }"
      style="perspective: 1000px;"
    >
      <svg
        class="w-7 h-7 transition-all duration-600 ease-in-out"
        :style="{
          transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
          color: 'var(--color-accent)'
        }"
        style="transform-style: preserve-3d;"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>

      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[var(--color-neu-bg)] rounded-full transition-colors duration-300">
        <div class="w-8 h-8 border-3 rounded-full animate-spin transition-colors duration-300"
             :style="{
               borderColor: 'var(--color-neu-text)',
               borderTopColor: 'var(--color-accent)'
             }">
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
