<script setup>
defineProps({
  size: { type: Number, default: 80 }
})
</script>

<template>
  <svg
    :class="`w-${size/4} h-${size/4}`"
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <mask id="cutoutMask">
        <rect width="100" height="100" fill="white"/>
        <circle cx="62" cy="62" r="34" fill="black"/>
        <circle cx="62" cy="62" r="28" fill="white"/>
      </mask>
    </defs>

    <g mask="url(#cutoutMask)">
      <circle cx="38" cy="38" r="28" :fill="'var(--color-accent)'"/>
      <text x="38" y="38"
            font-family="system-ui, sans-serif"
            font-size="50"
            font-weight="bold"
            fill="white"
            text-anchor="middle"
            dominant-baseline="central">€</text>
    </g>

    <g :stroke="'var(--color-accent)'" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M 88 18 L 75 18"/>
      <path d="M 78 15 L 75 18 L 78 21"/>
    </g>

    <circle cx="62" cy="62" r="28" :fill="'var(--color-accent)'"/>
    <text x="62" y="62"
          font-family="system-ui, sans-serif"
          font-size="46"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          dominant-baseline="central">¥</text>

    <g :stroke="'var(--color-accent)'" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M 12 82 L 25 82"/>
      <path d="M 22 79 L 25 82 L 22 85"/>
    </g>
  </svg>
</template>
