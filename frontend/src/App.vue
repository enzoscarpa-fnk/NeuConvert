<script setup>
import { ref, watch, onMounted } from 'vue'
import CurrencyInput from './components/CurrencyInput.vue'
import ConversionResult from './components/ConversionResult.vue'
import SwitchButton from './components/SwitchButton.vue'

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
  <div class="min-h-screen bg-[#e0e0e0] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Header avec drapeaux -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-700 mb-2">
          🇯🇵 JPY ⇄ EUR 🇪🇺
        </h1>
        <p class="text-sm text-gray-500">
          Convertisseur de devises en temps réel
        </p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-[20px] p-4 text-sm text-red-600">
        <p class="font-semibold mb-1">⚠️ Erreur</p>
        <p>{{ error }}</p>
      </div>

      <!-- Card principale avec ombre neumorphism -->
      <div class="bg-[#e0e0e0] rounded-[28px] shadow-[6px_6px_12px_#c5c5c5,-6px_-6px_12px_#fbfbfb] p-6 sm:p-8">
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
          <div class="inline-flex items-center gap-2 bg-[#e0e0e0] rounded-full px-4 py-2
              shadow-[4px_4px_8px_#c5c5c5,-4px_-4px_8px_#fbfbfb]">
            <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span class="text-xs font-semibold text-gray-700">
      1 {{ fromCurrency }} = {{ conversionRate.toFixed(6) }} {{ toCurrency }}
    </span>
          </div>
        </div>

      </div>

      <!-- Footer info -->
      <div v-if="lastUpdate"
           class="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Mis à jour : {{ formatDate(lastUpdate) }}</span>
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
