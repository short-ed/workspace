<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
}>(), {
  modelValue: 0,
})

const emit = defineEmits(['update:modelValue'])
const localHue = useVModel(props, 'modelValue', emit)

watch(localHue, (newHue) => {
  emit('update:modelValue', newHue)
})

function generateGradientSegment(start: number, end: number, step: number, colorTemplate: (value: number) => string) {
  let segment = ''

  for (let i = start; i <= end; i += step)
    segment += `${colorTemplate(i)}, `

  return segment
}

// 1. Красный к Желтому
const redToYellow = generateGradientSegment(0, 255, 17, i => `rgb(255, ${i}, 0)`)

// 2. Желтый к Зеленому
const yellowToGreen = generateGradientSegment(0, 255, 17, i => `rgb(${255 - i}, 255, 0)`)

// 3. Зеленый к Голубому
const greenToCyan = generateGradientSegment(0, 255, 17, i => `rgb(0, 255, ${i})`)

// 4. Голубой к Синему
const cyanToBlue = generateGradientSegment(0, 255, 17, i => `rgb(0, ${255 - i}, 255)`)

// 5. Синий к Пурпурному
const blueToMagenta = generateGradientSegment(0, 255, 17, i => `rgb(${i}, 0, 255)`)

// 6. Пурпурный к Красному
const magentaToRed = generateGradientSegment(0, 255, 17, i => `rgb(255, 0, ${255 - i})`)

const hueGradient = computed(() => {
  return `linear-gradient(90deg, ${redToYellow}${yellowToGreen}${greenToCyan}${cyanToBlue}${blueToMagenta}${magentaToRed.slice(0, -2)})`
})
</script>

<template>
  <div class="hue-slider" :style="{ backgroundImage: hueGradient }">
    <input v-model="localHue" type="range" class="w-full" min="1" max="360">
  </div>
</template>

<style scoped>
input[type="range"] {
  margin: auto;
  -webkit-appearance: none;
  position: relative;
  overflow: hidden;
  height: 100%;
  background-color: transparent;
  width: 100%;
  cursor: pointer;
  opacity: 0;
}
</style>
