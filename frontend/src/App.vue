<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import CurrencyInput from './components/CurrencyInput.vue'
import ConversionResult from './components/ConversionResult.vue'
import SwitchButton from './components/SwitchButton.vue'
import Header from './components/Header.vue'
import FooterButton from './components/FooterButton.vue'
import { useDarkMode } from './composables/useDarkMode'

const amount = ref(100)
const fromCurrency = ref('JPY')
const toCurrency = ref('EUR')
const conversionRate = ref(null)
const lastUpdate = ref(null)
const loading = ref(false)
const error = ref(null)
const sakuraAlpha = ref(1)
const fadeValue = ref(1)
const sakuraMode = ref(false)
const apiRemaining = ref(null)
const apiLimit = ref(null)
const showRateLimit = ref(false)

const { isDark } = useDarkMode()

let animationFrameId = null
let petals = []
let fadingOut = false

// const API_URL = 'http://localhost:3000' // dev
const API_URL = '' // prod

class Petal {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = -20
    this.speed = Math.random() * 0.8 + 0.3 // Plus lent (0.3-1.1 au lieu de 1-3)
    this.amplitude = Math.random() * 40 + 20
    this.frequency = Math.random() * 0.008 + 0.004 // Mouvement plus doux
    this.rotation = Math.random() * 360
    this.rotationSpeed = Math.random() * 2 - 1 // Rotation plus lente
    this.size = Math.random() * 8 + 5
    this.opacity = Math.random() * 0.3 + 0.5
    this.swayOffset = Math.random() * Math.PI * 2 // Pour un mouvement décalé
  }

  update() {
    this.y += this.speed
    // Mouvement de balancier naturel
    this.x += Math.sin(this.y * this.frequency + this.swayOffset) * 1.5
    this.rotation += this.rotationSpeed

    if (this.y > this.canvas.height + 20) {
      this.reset()
    }
  }

  draw(ctx, isDark, fadeValue) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate((this.rotation * Math.PI) / 180)

    ctx.globalAlpha = this.opacity * fadeValue

    // Dégradé couleur (pareil qu'avant)
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size)
    if (isDark) {
      gradient.addColorStop(0, '#b39ddb')
      gradient.addColorStop(0.5, '#9575cd')
      gradient.addColorStop(1, '#7e57c2')
    } else {
      gradient.addColorStop(0, '#ffc1e3')
      gradient.addColorStop(0.5, '#ffb3d9')
      gradient.addColorStop(1, '#ff99cc')
    }
    ctx.fillStyle = gradient

    // -- SAKURA PETAL PATH --
    ctx.beginPath()
    // pétale orienté verticalement, pointe vers le bas
    const r = this.size
    // Base du pétale (haut du path)
    ctx.moveTo(0, 0)
    // Bord gauche
    ctx.bezierCurveTo(-0.2*r, -0.1*r, -0.5*r, -0.7*r, 0, -r)
    // Pointe
    ctx.bezierCurveTo(0.5*r, -0.7*r, 0.2*r, -0.1*r, 0, 0)
    // Creux à la base
    ctx.bezierCurveTo(-0.08*r, 0.1*r, 0.08*r, 0.1*r, 0, 0)
    ctx.closePath()
    ctx.fill()

    // Option : liseré blanc léger
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }

}

const startSakuraAnimation = () => {
  const canvas = document.getElementById('sakura-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  petals = []
  for (let i = 0; i < 40; i++) {
    const petal = new Petal(canvas)
    petal.y = Math.random() * canvas.height - canvas.height
    petals.push(petal)
  }

  const animate = () => {
    const canvas = document.getElementById('sakura-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    petals.forEach(petal => {
      petal.update()
      petal.draw(ctx, isDark.value, fadeValue.value) // on passe fadeValue ici
    })

    // Gestion du fade-out
    if (fadingOut) {
      fadeValue.value -= 0.01
      if (fadeValue.value <= 0) {
        fadeValue.value = 0
        fadingOut = false
        sakuraMode.value = false
        petals = []
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

const startFadeOut = () => {
  fadingOut = true
}

const handleToggleSakura = (isActive) => {
  if (isActive) {
    fadeValue.value = 1
    sakuraMode.value = true
    fadingOut = false
    setTimeout(startSakuraAnimation, 100)
  } else {
    // Commencer un fade out au lieu de désactivation brutale
    sakuraMode.value = false
    if (!fadingOut) {
      startFadeOut()
    }
  }
}

const handleResize = () => {
  const canvas = document.getElementById('sakura-canvas')
  if (canvas && sakuraMode.value) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

const toggleInfoDisplay = () => {
  showRateLimit.value = !showRateLimit.value
}

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
        apiRemaining.value = data.remaining
        apiLimit.value = data.limit
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
    apiRemaining.value = data.remaining
    apiLimit.value = data.limit

    localStorage.setItem(`${fromCurrency.value}_${toCurrency.value}`, JSON.stringify({
      rate: data.rate,
      lastUpdate: data.lastUpdate,
      remaining: data.remaining,
      limit: data.limit,
      timestamp: new Date().toISOString()
    }))
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Le backend ne répond pas. Vérifiez qu\'il est démarré'
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

onMounted(() => {
  fetchRate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div
    class="min-h-screen bg-[var(--color-neu-bg)] flex justify-center pt-8 p-4 relative transition-colors duration-300"
  >
    <!-- Canvas pour les pétales -->
    <canvas
      id="sakura-canvas"
      class="fixed inset-0 pointer-events-none z-20"
    />

    <div class="w-full max-w-md relative z-10">
      <!-- Header avec logo et dark mode toggle -->
      <Header />

      <!-- Message d'erreur -->
      <div v-if="error" class="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-[20px] p-4 text-sm text-red-700 dark:text-red-300 transition-colors duration-300">
        <p class="font-semibold mb-1">⚠️ Erreur</p>
        <p>{{ error }}</p>
      </div>

      <!-- Card principale -->
      <div class="bg-[var(--color-neu-bg)] rounded-[28px] p-6 sm:p-8 transition-all duration-300"
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
        <!-- 🆕 Simplifié : affiche toujours quelque chose -->
        <div v-if="lastUpdate"
             @click="toggleInfoDisplay"
             class="text-center text-xs text-[var(--color-neu-text)] cursor-pointer transition-colors duration-300">
          <div class="flex items-center justify-center gap-2">

            <!-- Mode 1 : Affichage "Mis à jour" -->
            <template v-if="!showRateLimit">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Mis à jour : {{ formatDate(lastUpdate) }}</span>
            </template>

            <!-- Mode 2 : Affichage "Requêtes restantes" -->
            <template v-else>
              <!-- Si on a les données de quota -->
              <template v-if="apiRemaining !== null && apiLimit !== null">
                <svg class="w-3 h-3" :class="apiRemaining < 100 ? 'text-orange-500' : 'text-green-500'" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                <span :class="apiRemaining < 100 ? 'text-orange-500 font-semibold' : ''">
                  {{ apiRemaining }} / {{ apiLimit }} requêtes restantes
                </span>
              </template>

              <!-- Si pas de données de quota, affiche un message -->
              <template v-else>
                <svg class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-500">Quota non disponible</span>
              </template>
            </template>
          </div>
        </div>

        <FooterButton @toggle-sakura="handleToggleSakura" />
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
