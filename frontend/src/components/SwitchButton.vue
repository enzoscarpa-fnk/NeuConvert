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
      class="relative w-16 h-16 bg-[#e0e0e0] rounded-full flex items-center justify-center
             transition-all duration-200 ease-out active:scale-95 disabled:opacity-50"
      :class="pressed && !loading
        ? 'shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#fbfbfb]'
        : 'shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#fbfbfb] hover:shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff]'"
      style="perspective: 1000px;"
    >
      <svg
        class="w-7 h-7 text-blue-500 transition-transform duration-600 ease-in-out"
        :style="{ transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)' }"
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

      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[#e0e0e0] rounded-full">
        <div class="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </button>
  </div>
</template>

<style scoped>
/* Animation spinner de chargement */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
