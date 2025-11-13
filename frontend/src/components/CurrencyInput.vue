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
    <label class="block text-xs font-semibold text-[var(--color-neu-text)] mb-3 ml-1 uppercase tracking-wide transition-colors duration-300">
      {{ label }} ({{ currency }})
    </label>
    <div class="relative">
      <input
        type="number"
        :value="modelValue"
        @input="handleInput"
        @focus="focused = true"
        @blur="focused = false"
        class="w-full px-6 py-5 bg-[var(--color-neu-bg)] rounded-[20px] text-2xl sm:text-3xl font-bold
               text-[var(--color-neu-text-dark)] focus:outline-none transition-all duration-300 ease-out
               placeholder:text-[var(--color-neu-text)]"
        :style="focused
          ? { boxShadow: 'inset 2px 2px 4px var(--color-neu-shadow-dark), inset -2px -2px 4px var(--color-neu-shadow-light)' }
          : { boxShadow: 'inset 4px 4px 8px var(--color-neu-shadow-dark), inset -4px -4px 8px var(--color-neu-shadow-light)' }"
        placeholder="0"
        inputmode="decimal"
      />
      <div class="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--color-neu-text)] transition-colors duration-300">
        {{ currency }}
      </div>
    </div>
  </div>
</template>
