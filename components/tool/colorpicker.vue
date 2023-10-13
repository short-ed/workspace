<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

const props = withDefaults(defineProps<{
  modelValue: string // color string in HSLA format (hsla(0, 0%, 0%, 1))
}>(), {
  modelValue: 'hsla(0, 0%, 0%, 1)',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const colorPickerEl = ref()
const value = useVModel(props, 'modelValue', emit)
const HSLA_REGEX = /^hsla\(\s*(-?\d{1,3}(?:\.\d+)?(?:deg|grad|rad|turn)?)\s*,\s*((?:100(?:\.0+)?|[1-9]?\d(?:\.\d+)?)%)\s*,\s*((?:100(?:\.0+)?|[1-9]?\d(?:\.\d+)?)%)\s*,\s*((?:1(?:\.0+)?|0(?:\.\d+)?))\s*\)$/i

function isHSLAString(str) {
  return HSLA_REGEX.test(str)
}

function HSLAStrToObj(hsla: string) {
  if (!isHSLAString(hsla))
    throw new Error('Invalid HSLA string')

  const [h, s, l, a] = hsla
    .replace(/hsla\(|\)/g, '')
    .split(',')
    .map(v => v.trim())
    .map((v, i) => (i === 3 ? Number.parseFloat(v) : Number.parseInt(v, 10)))
  return { h, s, l, a }
}

const hsla = reactiveComputed(() => HSLAStrToObj(value.value))

const pickerPointPosition = computed(() => {
  const x = (hsla.s / 100) * 200
  const y = 200 - (hsla.l / 100) * 200
  return { x, y }
})

const isOpen = ref(false)
const isDragging = ref(false)
const paletteEl = ref<HTMLDivElement>()
const pickerPointEl = ref()

const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(paletteEl)
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const saturation = computed(() => {
  if (isDragging.value)
    return clamp(Math.round(elementX.value / elementWidth.value * 100), 0, 100)
  return hsla.s
})
const lightness = computed(() => {
  if (isDragging.value)
    return 100 - clamp(Math.round(elementY.value / elementHeight.value * 100), 0, 100)
  return hsla.l
})
function handleStart() {
  isDragging.value = true
  document.addEventListener('mouseup', handleEnd, true)
}

function handleEnd() {
  isDragging.value = false
  document.removeEventListener('mouseup', handleEnd, true)
}

function onOpen() {
  isOpen.value = true
}

function onClose(e?: MouseEvent) {
  if (e)
    e.stopPropagation()
  isOpen.value = false
}

const toggle = () => isOpen.value ? onClose() : onOpen()
onClickOutside(colorPickerEl, onClose)

const colorFromPoint = computed(() => `hsla(${hsla.h}, ${saturation.value}%, ${lightness.value}%, ${hsla.a})`)
watch(colorFromPoint, (newColor) => {
  value.value = newColor
})
</script>

<template>
  <div ref="colorPickerEl" class="relative w-32px h-32px" :style="{ '--hue': hsla.h, '--color': modelValue, '--x': `${pickerPointPosition.x}px`, '--y': `${pickerPointPosition.y}px` }">
    <button type="button" class="block w-full h-full rounded-4px bg-[--color]" @click="toggle" />
    <div v-if="isOpen" class="absolute left-[calc(100%+10px)] top-0 w-200px rounded-4px overflow-hidden">
      <div ref="paletteEl" class="aspect-1/1 bg-gray relative overflow-hidden" @mousedown="handleStart">
        <div class="w-full h-full bg-gradient-to-t bg-gradient-from-[rgb(0,0,0)] bg-gradient-to-[rgb(255,255,255)]" />
        <div class="absolute top-0 left-0 right-0 bottom-0 w-full mix-blend-overlay h-full bg-gradient-to-r bg-gradient-from-[hsla(var(--hue),100%,50%,0)] bg-gradient-to-[hsla(var(--hue),100%,50%,100%)]" />
        <button ref="pickerPointEl" type="button" class="absolute top-0 left-0 z-10 bg-[--color] w-20px h-20px translate-x-[calc(-50%+var(--x))] translate-y-[calc(-50%+var(--y))] rounded-full border-black border-2px shadow-[white_0px_0px_0px_2px_inset]" />
      </div>
      <ToolHueSlider v-model="hsla.h" />
    </div>
  </div>
</template>
