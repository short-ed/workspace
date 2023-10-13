<script setup lang="ts">
  import { useEventListener, UseMouseEventExtractor } from '@vueuse/core'
import { createProjection, useClamp, useFloor, useProjection } from '@vueuse/math'

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
const RegExHSLA = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i

const HSLAStrToObj = (hsla: string) => {
  if (!RegExHSLA.test(hsla)) {
    throw new Error('Invalid HSLA string')
  }
  const [h, s, l, a] = hsla
    .replace(/hsla\(|\)/g, '')
    .split(',')
    .map((v) => v.trim())
    .map((v, i) => (i === 3 ? parseFloat(v) : parseInt(v, 10)))
  return { h, s, l, a }
}

const hsla = reactiveComputed(() => HSLAStrToObj(value.value))

const pickerPointPosition = computed(() => {
  const x = (hsla.s / 100) * 200
  const y = 200 - (hsla.l / 100) * 200
  return { x, y }
})


const hueGradient = computed(() => {
  let colorsList = '';

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(255, ${i}, 0), `;
  }

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(${255 - i}, 255, 0), `;
  }

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(0, 255, ${i}), `;
  }

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(0, ${255 - i}, 255), `;
  }

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(${i}, 0, 255), `;
  }

  for(let i = 0; i<=255; i+=17){
    colorsList += `rgb(255, 0, ${255 - i}), `;
  }
  colorsList = colorsList.slice(0, -2);
  return `linear-gradient(90deg, ${colorsList})`
})


/**
 * Регистрирует новое событие и его слушатель на HTML-элементе.
 * @param {HTMLElement} element - HTML-элемент, к которому привязывается слушатель события.
 * @param {string} eventName - Имя события, на которое нужно слушать.
 * @param {EventListener} listener - Слушатель события для регистрации.
 * @param {AddEventListenerOptions} options - Дополнительные опции слушателя события (необязательно).
 * @returns {Function} Функция, которая, при вызове, удалит зарегистрированный слушатель события.
 */
const registerEvent = (element: HTMLElement, eventName: string, listener: EventListener, options?: AddEventListenerOptions): Function => {
  element.addEventListener(eventName, listener, options);
  return () => element.removeEventListener(eventName, listener, options);
}

const isOpen = ref(false)
const isDragging = ref(false)
const paletteEl = ref<HTMLDivElement>()
const pickerPointEl = ref()

const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(paletteEl)
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const saturation = computed(() => {
  if (isDragging.value) return clamp(Math.round(elementX.value / elementWidth.value * 100), 0, 100)
  return hsla.s
})
const lightness = computed(() => {
  if (isDragging.value) return 100 - clamp(Math.round(elementY.value / elementHeight.value * 100), 0, 100)
  return hsla.l
})
const handleStart = (event: TouchEvent) => {
  isDragging.value = true
  document.addEventListener('mouseup', handleEnd, true)
}

const handleEnd = (event: MouseEvent) => {
  isDragging.value = false
  document.removeEventListener('mouseup', handleEnd, true)
}

const onOpen = () => {
  isOpen.value = true
}

const onClose = (e?: MouseEvent) => {
  if (e) e.stopPropagation()
  isOpen.value = false
}

const toggle = () => isOpen.value ? onClose() : onOpen()
useEventListener(paletteEl, 'mousedown', handleStart)
onClickOutside(colorPickerEl, onClose)

// const extractor: UseMouseEventExtractor = event => {
//   if (!pressed.value) return null
//   const target = event.target as HTMLElement
//   const rect = target.getBoundingClientRect()
//   return [
//     Math.floor(event.clientX - rect.left),
//     Math.floor(event.clientY - rect.top),
//   ]
// }

// const paletteEl = ref()
// const { width } = useElementSize(paletteEl)
// const { pressed } = useMousePressed({ target: paletteEl })
// const useProjector = createProjection(() => [0, width.value], [0, 100])
// const saturation = useClamp(useFloor(useProjector(elementX)), 0, 100)
// const lightness = useClamp(useFloor(useProjector(elementY)), 0, 100)
// const hue = ref(hslaColor.value.h);
// const colorFromPoint = computed(() => pressed.value ? `hsla(${hue.value}, ${saturation.value}%, ${100 - lightness.value}%, ${hslaColor.value.a})` : `hsla(${hue.value}, ${hslaColor.value.s}%, ${hslaColor.value.l}%, ${hslaColor.value.a})`)
// watch(colorFromPoint, (newColor) => {
//   value.value = newColor
// })

const colorFromPoint = computed(() => `hsla(${hsla.h}, ${saturation.value}%, ${lightness.value}%, ${hsla.a})`)
  watch(colorFromPoint, (newColor) => {
  value.value = newColor
})
// syncRef(colorFromPoint, value)
</script>

<template>
  <div ref="colorPickerEl" class="relative w-32px h-32px" :style="{'--hue': hsla.h, '--color': modelValue, '--x': pickerPointPosition.x+'px', '--y': pickerPointPosition.y+'px'}">
    <button type="button" class="block w-full h-full rounded-4px bg-[--color]" @click="toggle"></button>
    <div class="absolute left-[calc(100%+10px)] top-0 w-200px rounded-4px overflow-hidden" v-if="isOpen">
      <div class="aspect-1/1 bg-gray relative overflow-hidden"  ref="paletteEl">
        <div class="w-full h-full bg-gradient-to-t bg-gradient-from-[rgb(0,0,0)] bg-gradient-to-[rgb(255,255,255)]"></div>
        <div class="absolute top-0 left-0 right-0 bottom-0 w-full mix-blend-overlay h-full bg-gradient-to-r bg-gradient-from-[hsla(var(--hue),100%,50%,0)] bg-gradient-to-[hsla(var(--hue),100%,50%,100%)]"></div>
        <button type="button" class="absolute top-0 left-0 z-10 bg-[--color] w-20px h-20px translate-x-[calc(-50%+var(--x))] translate-y-[calc(-50%+var(--y))] rounded-full border-black border-2px shadow-[white_0px_0px_0px_2px_inset]" ref="pickerPointEl" />
      </div>
      <div class="h-16px" :style="{ backgroundImage: hueGradient }">
        <input type="range" class="w-full" v-model="hsla.h" min="0" max="360">
      </div>
    </div>
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