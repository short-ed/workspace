<script setup lang="ts">
import { computed, defineEmits, ref, watch } from 'vue'
import { useContextMenuStore } from '~/stores/context-menu'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

const emits = defineEmits<{
  'onFinishSelect': [size: Size, position: Position]
  'onClickOutsideNodes': []
}>()

const canvasEl = ref<HTMLDivElement | null>(null)
const { pressed } = useMousePressed({ target: canvasEl, touch: false })
const { elementX: x, elementY: y } = useMouseInElement(canvasEl)

const startPosition = ref<Position>({ x: 0, y: 0 })

const helperAreaSize = computed<Size>(() => ({
  width: Math.abs(startPosition.value.x - x.value),
  height: Math.abs(startPosition.value.y - y.value),
}))

const helperAreaPosition = computed<Position>(() => ({
  x: Math.min(startPosition.value.x, x.value),
  y: Math.min(startPosition.value.y, y.value),
}))

const canvasAreaProps = computed(() => ({
  x: helperAreaPosition.value.x,
  y: helperAreaPosition.value.y,
  width: helperAreaSize.value.width,
  height: helperAreaSize.value.height,
  opacity: pressed.value ? 1 : 0,
}))

watch(pressed, (newPressedValue) => {
  if (newPressedValue) {
    startPosition.value = { x: x.value, y: y.value }
    emits('onClickOutsideNodes')
  }
  else {
    emits('onFinishSelect', helperAreaSize.value, helperAreaPosition.value)
  }
})
</script>

<template>
  <div ref="canvasEl" class="pattern-grid overflow-hidden">
    <NodeFrame v-if="pressed" class="pointer-events-none" :size="canvasAreaProps" :position="canvasAreaProps" />
    <CanvasArea v-bind="canvasAreaProps" />
  </div>
</template>

<style scoped>
.pattern-grid {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background-color: #141414;
}

.pointer-events-none {
  pointer-events: none;
}
</style>
