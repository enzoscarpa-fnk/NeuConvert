<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: Number,
  rate: Number,
  currency: String,
  loading: Boolean
})

const formattedResult = computed(() => {
  if (!props.rate) return '0.00'
  const result = props.amount * props.rate
  return result.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})
</script>

<template>
  <div class="bg-[#e0e0e0] rounded-[20px] shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#fbfbfb] p-6 min-h-[120px] flex flex-col justify-center">
    <label class="block text-xs font-semibold text-gray-500 mb-3 ml-1 uppercase tracking-wide">
      Résultat ({{ currency }})
    </label>

    <Transition name="slide-fade" mode="out-in">
      <div v-if="loading" class="flex items-center justify-center py-4">
        <div class="flex gap-1.5">
          <span class="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>

      <div v-else :key="formattedResult">
        <div class="text-3xl sm:text-4xl font-bold text-gray-700 mb-2">
          {{ formattedResult }}
        </div>
        <div class="flex items-center justify-end gap-1.5 text-xs text-gray-500">
          <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>Taux en temps réel</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s ease-in; }
.slide-fade-enter-from { transform: translateY(10px); opacity: 0; }
.slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
.animate-bounce { animation: bounce 1.4s infinite ease-in-out; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>
