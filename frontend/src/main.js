import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import './assets/tailwind.css'
import Particles from '@tsparticles/vue3'
import { loadConfettiPreset } from '@tsparticles/preset-confetti'

const app = createApp(App)

app.use(Particles, {
  init: async engine => {
    await loadConfettiPreset(engine)
  }
})

app.mount('#app')
