<script setup lang="ts">
defineProps<{
  width: number
  height: number
}>()

interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

const canvasEl = ref<HTMLCanvasElement>()
const rectangles = ref<Rectangle[]>([])
const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const endX = ref(0)
const endY = ref(0)

function onMouseDown(e: MouseEvent) {
  const rect = canvasEl.value?.getBoundingClientRect()
  if (!rect)
    return
  isDrawing.value = true
  startX.value = e.clientX - rect.left
  startY.value = e.clientY - rect.top
}

function onMouseMove(e: MouseEvent) {
  if (!isDrawing.value)
    return
  const rect = canvasEl.value?.getBoundingClientRect()
  if (!rect)
    return
  endX.value = e.clientX - rect.left
  endY.value = e.clientY - rect.top
  drawRectangles()
}

function onMouseUp() {
  isDrawing.value = false
  rectangles.value.push({
    x: startX.value,
    y: startY.value,
    width: endX.value - startX.value,
    height: endY.value - startY.value,
  })
  drawRectangles()
}

function drawRectangles() {
  const canvas = canvasEl.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  rectangles.value.forEach((rect: Rectangle) => {
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  })
  if (isDrawing.value) {
    ctx.fillStyle = 'rgba(0,138,96,0.1)'
    ctx.fillRect(startX.value, startY.value, endX.value - startX.value, endY.value - startY.value)
  }
}
</script>

<template>
  <div class="w-[var(--canvas-width,100%)] h-[var(--canvas-height,100%)] bg-neutral-800 pa">
    <canvas
      ref="canvasEl"
      class="absolute inset-0 z-10"
      :width="width"
      :height="height"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    />
    <!-- <FrameSelector v-if="isDragging" class="pointer-events-none" :size="sizePointArea" :position="startPosition" /> -->
    <slot />
  </div>
</template>
