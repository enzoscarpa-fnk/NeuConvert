<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: Number,
  currency: String,
  label: String
})

const emit = defineEmits(['update:modelValue'])
const focused = ref(false)

const handleInput = (e) => {
  const value = parseFloat(e.target.value)
  emit('update:modelValue', isNaN(value) ? 0 : value)
}
</script>

<template>
  <div class="mb-6">
    <label class="block text-xs font-semibold text-gray-500 mb-3 ml-1 uppercase tracking-wide">
      {{ label }} ({{ currency }})
    </label>
    <div class="relative">
      <input
        type="number"
        :value="modelValue"
        @input="handleInput"
        @focus="focused = true"
        @blur="focused = false"
        class="w-full px-6 py-5 bg-[#e0e0e0] rounded-[20px] text-2xl sm:text-3xl font-bold
               text-gray-700 focus:outline-none transition-all duration-300 ease-out
               placeholder:text-gray-400"
        :class="focused
          ? 'shadow-[inset_2px_2px_4px_#c5c5c5,inset_-2px_-2px_4px_#fbfbfb]'
          : 'shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#fbfbfb]'"
        placeholder="0"
        inputmode="decimal"
      />
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">
        {{ currency }}
      </div>
    </div>
  </div>
</template>
