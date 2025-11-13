<script setup>
import AppLogo from './AppLogo.vue'
import DarkModeToggle from './DarkModeToggle.vue'
</script>

<template>
  <div class="flex justify-center mb-8">
    <!-- Card neumorphism -->
    <div class="w-full max-w-md bg-[var(--color-neu-bg)] rounded-[24px] px-6 py-5 transition-all duration-300"
         style="box-shadow: 6px 6px 12px var(--color-neu-shadow-dark), -6px -6px 12px var(--color-neu-shadow-light);">

      <div class="flex items-center justify-between gap-4">
        <!-- Logo + Titre -->
        <div class="flex items-center gap-4 flex-1">
          <AppLogo :size="64" />

          <div class="flex flex-col">
            <h1 class="text-sm text-[var(--color-neu-text)] transition-colors duration-300">
              Convertisseur
            </h1>
            <p class="text-xl font-bold text-[var(--color-neu-text-dark)] transition-colors duration-300">
              JPY ⇄ EUR
            </p>
          </div>
        </div>

        <!-- Toggle Dark Mode -->
        <DarkModeToggle />
      </div>
    </div>
  </div>
</template>
