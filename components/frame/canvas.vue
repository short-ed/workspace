<script setup lang="ts">
import { useToolsStore } from '~/stores/tools'
import type { BaseNode, NodeComposition, RectangleNode } from '~/tools'
import { useRectangle } from '~/tools/rectangle'

defineProps<{
  width: number
  height: number
}>()

interface CanvasNodeComposition {
  id: string
  isSelect: boolean
  node: NodeComposition
}

const canvasEl = ref<HTMLCanvasElement>()
const rectangles = ref<CanvasNodeComposition[]>([])
const isDrawing = ref(false)
const startX = ref(0)
const startY = ref(0)
const endX = ref(0)
const endY = ref(0)

function getCanvasContext() {
  if (!canvasEl.value)
    throw new Error('Canvas element is not defined')
  const context = canvasEl.value?.getContext('2d')
  if (!context)
    throw new Error('Canvas context is not defined')
  return {
    ctx: context,
    canvas: canvasEl.value,
  }
}
const toolsStore = useToolsStore()

function onMouseDown(e: MouseEvent) {
  if (toolsStore.currentTool === undefined)
    return
  const rect = (canvasEl.value as HTMLElement).getBoundingClientRect()
  isDrawing.value = true
  startX.value = e.clientX - rect.left
  startY.value = e.clientY - rect.top
  const { ctx } = getCanvasContext()
  const rectangle = useRectangle({
    x: startX.value,
    y: startY.value,
    width: 0,
    height: 0,
  }, ctx)
  undelectAll()
  rectangles.value.push({
    id: generateUId(),
    node: rectangle,
    isSelect: true,
  })
}

function onMouseMove(e: MouseEvent) {
  if (!isDrawing.value)
    return
  const rect = (canvasEl.value as HTMLElement).getBoundingClientRect()
  endX.value = e.clientX - rect.left
  endY.value = e.clientY - rect.top
  const selectedNode = findSelectedNode()
  if (selectedNode) {
    selectedNode.node.setParams({
      x: startX.value,
      y: startY.value,
      width: endX.value - startX.value,
      height: endY.value - startY.value,
    })
  }
  drawRectangles()
}

function generateUId() {
  return Math.random().toString(36).substr(2, 9)
}

function undelectAll() {
  rectangles.value.forEach((node) => {
    node.isSelect = false
  })
}

function findSelectedNode() {
  return rectangles.value.find(node => node.isSelect)
}

function onMouseUp(e: MouseEvent) {
  isDrawing.value = false
  const selectedNode = findSelectedNode()
  if (!selectedNode)
    return

  const rect = (canvasEl.value as HTMLElement).getBoundingClientRect()
  endX.value = e.clientX - rect.left
  endY.value = e.clientY - rect.top
  const x = Math.min(startX.value, endX.value)
  const y = Math.min(startY.value, endY.value)
  const width = Math.abs(endX.value - startX.value)
  const height = Math.abs(endY.value - startY.value)
  selectedNode.node.setParams({
    x,
    y,
    width,
    height,
  })
  drawRectangles()
  drowSelectionFrame(x, y, width, height)
  toolsStore.unsetTool()
}

function drawRectangles() {
  const { ctx, canvas } = getCanvasContext()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  rectangles.value.forEach((node) => {
    node.node.render()
  })
  if (isDrawing.value) {
    const x = Math.min(startX.value, endX.value)
    const y = Math.min(startY.value, endY.value)
    const width = Math.abs(endX.value - startX.value)
    const height = Math.abs(endY.value - startY.value)
    drowSelectionFrame(x, y, width, height)
  }
}

function drowSelectionFrame(x: number, y: number, width: number, height: number, { resizeHandlers }: { resizeHandlers?: boolean } = { resizeHandlers: true }) {
  const { ctx } = getCanvasContext()
  const borderStrokeColor = 'hsla(162, 100%, 27%, 1)'
  const handlerSize = 10
  const cornerRadius = 3 // Радиус скругления углов
  const borderColor = 'hsla(162, 100%, 27%, 1)'
  const borderWidth = 1

  ctx.strokeStyle = borderStrokeColor
  ctx.strokeRect(x, y, width, height)

  // Рисование маркеров изменения размера
  const drowResizeHandle = (x: number, y: number) => {
    const rectX = x - handlerSize / 2
    const rectY = y - handlerSize / 2
    const rectWidth = handlerSize
    const rectHeight = handlerSize
    ctx.beginPath()

    // Верхний левый угол
    ctx.lineTo(rectX, rectY + cornerRadius)
    ctx.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius)

    // Верхний правый угол
    ctx.lineTo(rectX + rectWidth - cornerRadius, rectY)
    ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius, cornerRadius)

    // Нижний правый угол
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius)
    ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - cornerRadius, rectY + rectHeight, cornerRadius)

    // Нижний левый угол
    ctx.lineTo(rectX + cornerRadius, rectY + rectHeight)
    ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - cornerRadius, cornerRadius)

    // Завершаем контур и закрашиваем прямоугольник
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.fill()

    // Отрисовка рамки
    ctx.lineWidth = borderWidth
    ctx.strokeStyle = borderColor
    ctx.stroke()
  }

  function drowSizeLabel(x: number, y: number, width: number, height: number) {
    ctx.font = '10px monospace'
    const label = `${width}x${height}`
    const labelWidth = ctx.measureText(label).width + 8
    const labelHeight = 16
    const labelX = x + width / 2 - labelWidth / 2
    const labelY = y + height + 8
    ctx.fillStyle = 'hsla(162, 100%, 27%, 1)'
    ctx.fillRect(labelX - 4, labelY, labelWidth, labelHeight)
    ctx.fillStyle = 'white'
    ctx.fillText(label, labelX, labelY + 12)
  }

  if (resizeHandlers) {
    drowResizeHandle(x, y)
    drowResizeHandle(x + width, y)
    drowResizeHandle(x, y + height)
    drowResizeHandle(x + width, y + height)
    drowSizeLabel(x, y, width, height)
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
    <slot />
  </div>
</template>
