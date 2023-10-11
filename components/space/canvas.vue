<script setup lang="ts">
import { useContextMenu } from '~/composables/useContextMenu'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

const emits = defineEmits<{
  'onFinishSelect': [size: Size, pisition: Position],
  'onClickOutsideNodes': []
}>()

const canvasEl = ref()
const { pressed } = useMousePressed({ target: canvasEl, touch: false })
const { elementX: x, elementY: y } = useMouseInElement(canvasEl)

const startPosition = ref({ x: 0, y: 0 })

const helperAreaSize = computed(() => ({
  width: Math.abs(startPosition.value.x - x.value),
  height: Math.abs(startPosition.value.y - y.value)
}))

const helperAreaPosition = computed(() => ({
  x: Math.min(startPosition.value.x, x.value),
  y: Math.min(startPosition.value.y, y.value)
}))

const selectorRectStyle = computed(() => ({
  transform: `
    translate(${Math.min(startPosition.value.x, x.value)}px, ${Math.min(
      startPosition.value.y,
      y.value
  )}px)
    scaleX(${Math.abs(startPosition.value.x - x.value)})
    scaleY(${Math.abs(startPosition.value.y - y.value)})
  `,
}))

watch(pressed, (newPressedValue) => {
  if (newPressedValue) {
    startPosition.value = { x: x.value, y: y.value }
    emits('onClickOutsideNodes')
  } else {
    emits('onFinishSelect', helperAreaSize.value, helperAreaPosition.value)
  }
})

const { open, setMenuItems } = useContextMenu()

const openContext = (e: MouseEvent) => {
  setMenuItems([
    {
      label: 'Canvas menu item',
      action: () => {}
    },
  ])
  open({ x: e.clientX, y: e.clientY })
}

</script>

<template>
<div class="painter-container">
  <slot name="area" v-bind="{ size: helperAreaSize, position: helperAreaPosition }" v-if="pressed">
    <div v-if="pressed" :style="selectorRectStyle" class="painter-rectangle" />
  </slot>
  <div ref="canvasEl" class="absolute top-0 left-0 w-full h-full" @contextmenu.self="openContext">
  </div>
  <slot />
</div>
</template>

<style scoped>
.painter-container {
  position: relative;
  background-color: #141414;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  outline: 12px solid rgba(255, 255, 255, 0.02);
}

.painter-rectangle {
  pointer-events: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  transform-origin: 0 0;
}
</style>