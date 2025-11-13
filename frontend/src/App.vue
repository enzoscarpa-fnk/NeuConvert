<script setup>
import { ref, watch, onMounted } from 'vue'
import CurrencyInput from './components/CurrencyInput.vue'
import ConversionResult from './components/ConversionResult.vue'
import SwitchButton from './components/SwitchButton.vue'
import Header from './components/Header.vue'

const amount = ref(100)
const fromCurrency = ref('JPY')
const toCurrency = ref('EUR')
const conversionRate = ref(null)
const lastUpdate = ref(null)
const loading = ref(false)
const error = ref(null)

const API_URL = 'http://localhost:3000'

const fetchRate = async () => {
  loading.value = true
  error.value = null

  try {
    const cached = localStorage.getItem(`${fromCurrency.value}_${toCurrency.value}`)
    if (cached) {
      const data = JSON.parse(cached)
      const cacheTime = new Date(data.timestamp).getTime()
      if (Date.now() - cacheTime < 3600000) {
        conversionRate.value = data.rate
        lastUpdate.value = data.lastUpdate
        loading.value = false
        return
      }
    }

    const response = await fetch(
      `${API_URL}/api/rates?from=${fromCurrency.value}&to=${toCurrency.value}`
    )

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`)
    }

    const data = await response.json()

    conversionRate.value = data.rate
    lastUpdate.value = data.lastUpdate

    localStorage.setItem(`${fromCurrency.value}_${toCurrency.value}`, JSON.stringify({
      rate: data.rate,
      lastUpdate: data.lastUpdate,
      timestamp: new Date().toISOString()
    }))
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Le backend ne répond pas. Vérifiez qu\'il est démarré (cd backend && npm run dev)'
  } finally {
    loading.value = false
  }
}

const switchCurrencies = () => {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch([fromCurrency, toCurrency], fetchRate)
onMounted(fetchRate)
</script>

<template>
  <div class="min-h-screen bg-[var(--color-neu-bg)] flex justify-center pt-8 p-4 transition-colors duration-300">
    <div class="w-full max-w-md">
      <!-- Header avec logo et dark mode toggle -->
      <Header />

      <!-- Message d'erreur -->
      <div v-if="error" class="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-[20px] p-4 text-sm text-red-700 dark:text-red-300 transition-colors duration-300">
        <p class="font-semibold mb-1">⚠️ Erreur</p>
        <p>{{ error }}</p>
      </div>

      <!-- Card principale -->
      <div class="bg-[var(--color-neu-bg)] rounded-[28px] p-6 sm:p-8 transition-all duration-300"
           :class="$el?.classList.contains('dark')
             ? 'shadow-[6px_6px_12px_var(--color-neu-shadow-dark),-6px_-6px_12px_var(--color-neu-shadow-light)]'
             : 'shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#fbfbfb]'"
           style="box-shadow: 6px 6px 12px var(--color-neu-shadow-dark), -6px -6px 12px var(--color-neu-shadow-light);">
        <CurrencyInput
          :modelValue="amount"
          @update:modelValue="amount = $event"
          :currency="fromCurrency"
          label="Montant"
        />

        <SwitchButton @switch="switchCurrencies" :loading="loading" />

        <ConversionResult
          :amount="amount"
          :rate="conversionRate"
          :currency="toCurrency"
          :loading="loading"
        />

        <!-- Taux de conversion -->
        <div v-if="conversionRate && !loading" class="mt-8 flex justify-center">
          <div class="inline-flex items-center gap-2 bg-[var(--color-neu-bg)] rounded-full px-4 py-2 transition-all duration-300"
               style="box-shadow: 4px 4px 8px var(--color-neu-shadow-dark), -4px -4px 8px var(--color-neu-shadow-light);">
            <svg
              class="w-3.5 h-3.5 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              :style="{ color: 'var(--color-accent)' }"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span class="text-xs font-semibold text-[var(--color-neu-text-dark)] transition-colors duration-300">
              1 {{ fromCurrency }} = {{ conversionRate.toFixed(6) }} {{ toCurrency }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer info -->
      <div class="mt-6 space-y-3">
        <div v-if="lastUpdate"
             class="mt-4 text-center text-xs text-[var(--color-neu-text)] flex items-center justify-center gap-2 transition-colors duration-300">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Mis à jour : {{ formatDate(lastUpdate) }}</span>
        </div>

        <div class="flex justify-center pt-2">
          <div class="inline-flex items-center gap-2 bg-[var(--color-neu-bg)] rounded-full px-4 py-2 transition-all duration-300"
               style="box-shadow: 4px 4px 8px var(--color-neu-shadow-dark), -4px -4px 8px var(--color-neu-shadow-light);">

            <!-- Fox SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 128 128">
              <path fill="#fe9040" d="M122.7 71.1c-2.2-2.3-4.6-3.6-6.3-4.3c-.9-.4 1.9-.2 4.1-1.3c.7-.4 1.3-.9 1.6-1.4c.5-.6.1-1.6-.7-1.6c-.9 0-2.1-.2-3.1-.6c-2.5-1-3.3-2.9-3.3-2.9v-.8s5.3-10.2 6.4-25.4s-4.1-28.5-7.7-30.3c-3.6-1.7-11.4-.3-20.2 6.8c-6.8 5.5-12.2 12.2-13.5 15.2c-.2.5-.8.7-1.3.5c-1.7-.7-6.5-2-14.2-2.1h-1C55.8 23 51 24.3 49.3 25c-.5.2-1.1 0-1.3-.5c-1.4-3-6.7-9.7-13.4-15.1C25.8 2.3 18 .9 14.3 2.6c-3.6 1.7-8.8 15-7.7 30.3C7.7 48.1 13 58.3 13 58.3v.8S12.2 61 9.7 62c-1 .4-2.2.5-3.1.6c-.8 0-1.2 1-.7 1.6c.4.5.9 1 1.6 1.4c2.1 1.1 4.9.9 4.1 1.3c-1.7.7-4.1 2-6.3 4.3C3.1 73.4 2.2 77 2 79.6c-.1.8.8 1.3 1.5 1c1.5-.8 3.9-1.8 6.3-1.7c3.9.1 8.9 6.6 11.2 11.1c2.3 4.4 26.8 29 42.5 30.1v.1h1v-.2c15.7-1 40.2-25.7 42.5-30.1c2.4-4.5 7.4-11 11.2-11.1c2.4-.1 4.8.9 6.3 1.7c.7.4 1.5-.2 1.5-1c-.2-2.5-1.1-6.1-3.3-8.4"/>
              <path fill="#fe9040" d="M123.8 87.9c-2.9-4-7.3-4.3-7.3-4.3c.5-.4 1.2-.6 1.9-.6c.8-.1 1.2-1.1.6-1.7c-1.1-1.1-2.4-1.5-2.9-1.7c-.1 0-.3-.1-.4-.2c-12.7-12.2-47.5 17-51.4 20.3c-.1.1-.3.2-.5.4l-.4-.4C59.6 96.4 24.7 67.3 12 79.4c-.1.1-.2.2-.4.2c-.5.1-1.8.6-2.9 1.7c-.6.6-.2 1.6.6 1.7c.7.1 1.4.3 1.9.6c0 0-4.4.3-7.3 4.3a1 1 0 0 0 .8 1.6c1.9-.1 4.9.4 6.8 3.2c3.1 4.5 4.9 9.2 11.8 13.2c7.2 4.1 11.5 4.9 18.8 9.3c6.7 4 12 10.7 21.3 10.9h.4c9.3-.2 14.8-6.8 21.5-10.9c7.4-4.4 11.7-5.2 18.8-9.3c6.9-4 8.7-8.7 11.8-13.2c1.9-2.8 4.9-3.3 6.8-3.2c1.1 0 1.6-.9 1.1-1.6"/>
              <path fill="#fafafa" d="M119.6 86.2c-1-.6-2.2-1.1-3.6-1.2q-1.5-.15-2.7 0c-1.1.2-1.6-1.3-.6-1.9c.1-.1.2-.1.3-.2c.2-.1.4-.2.6-.2c1-.3.9-1.7-.1-1.9c-1.5-.3-3.4-.4-5.4.2c-3 .8-5.4 2.9-6 3c-1.3.2-1-1-1-1s.2-1 1.6-2.1c.8-.6.2-1.9-.7-1.8c-2.3.2-5.2.7-7.8 1.9c-6.5 2.8-15.6 9.3-22.4 15.9c-2.7 2.6-6 3.6-7.6 3.9c-1.7-.3-5-1.3-7.5-3.9c-6.7-6.8-16.2-13.1-22.7-16c-2.6-1.1-5.5-1.6-7.8-1.9c-1-.1-1.5 1.1-.7 1.8c1.3 1.1 1.6 2.1 1.6 2.1s.3 1.2-1 1c-.6-.1-3-2.2-6-3c-2-.5-3.9-.4-5.4-.2c-1 .2-1.1 1.6-.1 1.9c.2.1.4.2.6.2c.1.1.2.1.3.2c1 .6.5 2-.6 1.9c-.8-.1-1.7-.2-2.7 0c-1.4.2-2.6.7-3.6 1.2c-.8.5-.6 1.7.3 1.8c.7.2 1.5.4 2.3.9c4.5 2.7 5.2 8.2 10.4 12.5c7.2 6 17.7 7.2 27 14.8c8.6 7 12.5 7.7 15.1 7.7h.6c2.6-.1 6.8-.7 15.4-7.7c9.3-7.6 19.8-8.9 27-14.8c5.2-4.3 5.9-9.7 10.4-12.5c.8-.5 1.6-.8 2.3-.9c.8-.1 1-1.3.2-1.7"/>
              <path fill="#2f2f2f" d="M64 93.8c-5.2 0-9.3 2-8.7 5.1c.8 3.7 5.5 6.9 8.8 6.9c3.2 0 7.7-3 8.5-6.9c.6-2.6-3-5.1-8.6-5.1m27.2-26.7c-.6-1.9-5.3-4.4-10.1-1.1c-4.7 3.2-4.3 10.6-3.8 10.9c.7.4.9-.8 3.2-1.1c1.5-.2 4.3.9 7.8-1.6c3-2.1 3.3-5.8 2.9-7.1m-54.4 0c.6-1.9 5.3-4.4 10.1-1.1c4.7 3.2 4.3 10.6 3.8 10.9c-.7.4-.9-.8-3.2-1.1c-1.5-.2-4.3.9-7.8-1.6c-3-2.1-3.3-5.8-2.9-7.1"/>
              <path fill="#ffe0b2" d="M16.2 7.1c1.8-2 9 .8 17.1 12.8c4.2 6.2 4.7 14.4 4.7 14.4s-1.9-2.8-5.7-2.3c-.3 0-.6.4-.4.7c.5 1.2 1.6 4.2.5 5.9c0 0-1.4-4-6.4-3.7c-.4 0-.6.5-.4.8c.8 1.1 2.3 3.5 2.7 6.3c0 0-2-.1-3.9-2c-.3-.3-.8-.1-.9.3c-.1 1.2.1 3 1.1 4.2c0 0-.8.4-1.8-.1c-.4-.2-.8.1-.7.5c.1.6.2 1.4.6 2.1c0 0-.5.2-1.4-.1c-.3-.1-.6 0-.7.4c-.1.5-.2 1.2 0 1.7c0 0-2.2 3.5-5 8.1c0 0-5.8-9.3-5.8-26c.2-14.7 3.5-20.9 6.4-24m95.6 0c-1.8-2-9 .8-17.1 12.8c-4.2 6.3-4.7 14.4-4.7 14.4s1.9-2.8 5.7-2.3c.3 0 .6.4.4.7c-.5 1.2-1.6 4.2-.5 5.9c0 0 1.4-4 6.4-3.7c.4 0 .6.5.4.8c-.8 1.1-2.3 3.5-2.7 6.3c0 0 2-.1 3.9-2c.3-.3.8-.1.9.3c.1 1.2-.1 3-1.1 4.2c0 0 .8.4 1.8-.1c.4-.2.8.1.7.5c-.1.6-.2 1.4-.6 2.1c0 0 .5.2 1.4-.1c.3-.1.6 0 .7.4c.1.5.2 1.2 0 1.7c0 0 2.2 3.5 5 8.1c0 0 5.8-9.3 5.8-26c-.2-14.7-3.5-20.9-6.4-24"/>
              <path fill="none" stroke="#2f2f2f" stroke-miterlimit="10" stroke-width="3" d="M64.1 110.8v-6.9"/>
              <path fill="none" stroke="#2f2f2f" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M53 115.1c1.7.1 6.2.7 11.2-5.1"/>
              <path fill="none" stroke="#2f2f2f" stroke-linecap="round" stroke-miterlimit="10" stroke-width="3" d="M75.3 115.1c-1.7.1-6.2.7-11.2-5.1"/>
              <path fill="#2f2f2f" d="M59.7 115.6s1.9-.8 4.5-.8s4.8.9 4.8.9l-4.8-4.5z"/>
              <circle cx="43.8" cy="67" r="1" fill="#e1e1e1"/>
              <circle cx="84.2" cy="67" r="1" fill="#e1e1e1"/>
            </svg>

            <!-- Heart SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 128 128">
              <path fill="#db4437" d="M90.35 16.05c-11.66 0-21.81 6.97-26.35 17.06c-4.54-10.08-14.69-17.06-26.35-17.06c-15.92 0-28.87 12.96-28.87 28.88c0 35.9 51.79 65.46 54 66.7c.38.21.79.32 1.21.32s.84-.11 1.21-.32c2.2-1.24 54.01-30.8 54.01-66.7c.01-15.92-12.94-28.88-28.86-28.88"/>
            </svg>

            <!-- Rabbit SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 128 128">
              <path fill="#c0c0c0" d="M85.87 63.89s2.97 3.44 4.15 9.25c1.92 9.51 5.01 16.36 5.9 21.84c1.17 7.29.2 15.04-5.33 20.28c-8.47 8.04-20.46 11.18-31.98 11.5c-.56.02-1.13.02-1.71.02c-14.89 0-37.8-5.25-42.75-21.09c-1.46-4.66-.96-11.72 1.02-16.19c2.46-5.55 3.46-12.47 6.12-18.53c1.73-3.95 4.12-7.62 7.32-10.53c.53-.48 1.96-1.21 2.27-1.81c.29-.58.06-1.96.1-2.73c.92-17.35 1.43-43.59 19.42-52.94c2.17-1.13 4.69-1.77 7.04-1.77c4.35 0 8.18 2.2 8.43 7.57c.74 16.15-14.46 29.97-12.28 46.14c.03.26 3.56.56 3.94.58c1.07.07 2.14.12 3.21.14c.36.01 1.16.08 1.91.08c.66 0 1.28-.06 1.52-.29c2.15-2.11 3.02-7.73 4.22-10.49c1.7-3.95 3.67-7.78 5.95-11.43c4.52-7.26 10.35-13.83 17.77-18.24c2.79-1.65 6.03-2.79 9.25-3.21c.53-.07 1.11-.1 1.76-.1c3.18 0 7.42.89 9.37 3c6.54 7.08-2.73 18.41-7.2 23.87c-4.33 5.3-8.92 10.38-13.33 15.62c-2.22 2.59-6.07 5.77-6.09 9.46"/>
              <path fill="#2f2f2f" d="M34.82 88.19c-3.13-.03-5.68 2.93-5.71 6.57c-.01 3.66 2.51 6.63 5.65 6.65c3.11.01 5.68-2.92 5.69-6.59c.04-3.63-2.5-6.62-5.63-6.63m37.93 0c-3.14.01-5.67 3-5.63 6.64c0 3.66 2.57 6.6 5.68 6.59c3.14-.03 5.67-3 5.65-6.65s-2.57-6.61-5.7-6.58m-5.13 24.89c-1.94-.99-3.85 1.9-5.68 2.12c-2.13.25-4.07-.7-4.37-1.74c-.12-.39-.25-1.94-.28-2.28c2.87-1.15 4.3-3.25 4.28-4.37c0-.75-.36-1.45-1.07-1.53c-.76-.09-1.25.31-1.84.73c-1.44 1.02-2.03 1.57-4.33 1.55c-1.55-.01-2.78-.78-3.71-1.6c-.42-.36-1.39-1-2.17-.31c-1.7 1.51 1.02 4.24 2.46 4.88c.65.29 1.2.56 1.81.79c0 .93-.01 1.86-.03 2.02c-.1 1.21-1.36 1.81-2.47 2.09c-.94.23-2.28.06-3.17-.31c-.82-.33-1.34-1.15-1.91-1.77c-.6-.65-1.34-.93-2.04-.58c-1.14.57-1.24 1.96-.57 3.28c.83 1.61 1.82 2.21 2.91 2.82c1.5.85 4.96 1.11 7.22.08c1.86-.85 2.5-1.97 3.84-.94c1.83 1.39 4.45 1.55 6.79.96c1.98-.52 6.97-4.54 4.33-5.89"/>
              <path fill="#ed80ad" d="M101.08 23.97C90.81 24 81.91 34.45 77.34 42.58c-2.06 3.66-3.89 7.83-4.58 11.98c-.48 2.88-.02 5.82 3.25 6.5c1.49.31 2.71-.23 3.74-1.13c1.44-1.28 2.53-3.3 3.5-4.72c2.74-4.04 5.21-8 8.49-11.66c2.59-2.88 4.91-5.77 7.7-8.48c2.47-2.41 5.8-5.59 4.87-9.42c-.32-1.27-2.13-1.68-3.23-1.68M45.96 55.56c.55-2.01.68-4.48.72-6.5c.11-8.5 4.98-17.12 7.97-24.87c1.1-2.85 4.18-11.87-2.14-10.38c-4.97 1.19-9.14 7.33-11.03 11.69c-2.08 4.78-3.29 9.98-3.87 15.16c-.29 2.59-.31 5.2-.19 7.81c.11 2.38-.05 5.26.87 7.49c.65 1.58 1.86 1.93 3.52 1.77c1.35-.13 3.1-.35 3.87-1.51c.12-.2.22-.42.28-.66"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
