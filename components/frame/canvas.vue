<script setup lang="ts">
import type { UseNode } from '~/tools'
import { useRectangle } from '~/tools/rectangle'
import { canvasUtil } from '~/utils/canvas'

defineProps<{
  width: number
  height: number
}>()

interface Node {
  id: string
  composable: UseNode
}

const toolsStore = useToolsStore()
const canvas = ref<HTMLCanvasElement>()
const nodes = ref<Node[]>([])

const creatingNodeId = ref<string>()

const {
  isDrawing,
  selectedArea,
  canvasWidth,
  canvasHeight,
  canvasRef,
  x,
  y,
} = useMouseOnCanvas(canvas)

const needsRedraw = ref(true)

const generateUId = () => Math.random().toString(36).substring(2, 9)

function createNode() {
  const ctx = (canvasRef.value as HTMLCanvasElement).getContext('2d')
  if (ctx) {
    const node = useRectangle({
      x: selectedArea.value.x,
      y: selectedArea.value.y,
      width: selectedArea.value.width,
      height: selectedArea.value.height,
    }, ctx)
    const id = generateUId()
    creatingNodeId.value = id
    nodes.value.push({
      id,
      composable: node,
    })
  }
}

function resizeCreateNode() {
  const node = nodes.value.find(({ id }) => id === creatingNodeId.value)
  if (node) {
    node.composable.setParams({
      x: selectedArea.value.x,
      y: selectedArea.value.y,
      width: selectedArea.value.width,
      height: selectedArea.value.height,
    })
  }
}

function findNodeByPoint(x: number, y: number) {
  return nodes.value.findLast(({ composable }) => {
    const { x: nodeX, y: nodeY, width, height } = composable.node
    return (x > nodeX && x < nodeX + width && y > nodeY && y < nodeY + height)
  })
}

watch([isDrawing, selectedArea, canvasWidth, canvasHeight], ([newIsDrawing], [oldIsDrawing]) => {
  if (toolsStore.currentTool) {
    const startedDrawing = newIsDrawing && !oldIsDrawing
    const drawing = newIsDrawing && oldIsDrawing
    const stoppedDrawing = !newIsDrawing && oldIsDrawing
    if (startedDrawing) {
      if (needsRedraw.value)
        createNode()
    }
    if (drawing || stoppedDrawing) {
      if (creatingNodeId.value)
        resizeCreateNode()
    }
    if (stoppedDrawing) {
      if (creatingNodeId.value) {
        creatingNodeId.value = undefined
        toolsStore.unsetTool()
      }
    }
  }
  else {
    if (selectedArea.value.width === 0 || selectedArea.value.height === 0) {
      const selectedNode = findNodeByPoint(x.value, y.value)
      if (selectedNode)
        selectNodeById(selectedNode.id)

      else
        unselectAll()
    }
  }

  needsRedraw.value = true
})

const animationFrameId = ref<number>()

function drawSizeLabel(ctx: CanvasRenderingContext2D) {
  const labelText = `${selectedArea.value.width}x${selectedArea.value.height}`
  ctx.font = '10px monospace'
  ctx.fillStyle = 'hsla(9, 79%, 58%, 1)'
  const LABEL_WIDTH = ctx.measureText(labelText).width + 8
  const x = selectedArea.value.x + selectedArea.value.width / 2 - LABEL_WIDTH / 2
  const y = selectedArea.value.y + selectedArea.value.height + 8
  ctx.fillStyle = 'hsla(9, 79%, 58%, 1)'
  ctx.fillRect(x - 4, y, LABEL_WIDTH, 16)
  ctx.fillStyle = 'white'
  ctx.fillText(labelText, x, y + 12)
}

const HOVER_STROKE_COLOR = 'hsla(216, 75%, 48%, 1)'
const SELECTED_STROKE_COLOR = 'hsla(9, 79%, 58%, 1)'

function drawHoveredNode(ctx: CanvasRenderingContext2D, node: Node['composable']['node']) {
  const { x, y, width, height } = toValue(node)
  ctx.strokeStyle = HOVER_STROKE_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.stroke()
}

function drawSelectedNode(ctx: CanvasRenderingContext2D, node: Node['composable']['node']) {
  const { x, y, width, height } = toValue(node)
  ctx.strokeStyle = SELECTED_STROKE_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.stroke()
}

const selectedNodeIds = ref<string[]>([])

// Снять выделения со всех элементов
function unselectAll() {
  selectedNodeIds.value = []
}

// Выделить элемент по id
function selectNodeById(id: string) {
  selectedNodeIds.value = [id]
}

const hasSelectedNode = computed(() => nodes.value.some(({ id }) => selectedNodeIds.value.includes(id)))

const ESC_KEY_CODE = 27
const DELETE_KEY_CODE = 46
const BACKSPACE_KEY_CODE = 8

function handleKeyDown(event: KeyboardEvent) {
  const isDeleteKey = [DELETE_KEY_CODE, BACKSPACE_KEY_CODE].includes(event.keyCode)
  const isEscKey = event.keyCode === ESC_KEY_CODE
  if (isEscKey && creatingNodeId.value) {
    removeNodeById(creatingNodeId.value)
    creatingNodeId.value = undefined
    isDrawing.value = false
    toolsStore.unsetTool()
  }
  if (isDeleteKey && hasSelectedNode.value) {
    selectedNodeIds.value.forEach(id => removeNodeById(id))
    unselectAll()
    toolsStore.unsetTool()
  }
}

watch(hasSelectedNode, (newValue, oldValue) => {
  if (newValue && oldValue === false)
    document.addEventListener('keydown', handleKeyDown, true)
  else if (newValue === false && oldValue)
    document.removeEventListener('keydown', handleKeyDown, true)
}, { immediate: true })

function removeNodeById(id: string) {
  const index = nodes.value.findIndex(node => node.id === id)
  if (index === -1)
    return
  nodes.value.splice(index, 1)
  if (selectedNodeIds.value.includes(id))
    selectedNodeIds.value = selectedNodeIds.value.filter(nodeId => nodeId !== id)
}

function draw() {
  if (needsRedraw.value) {
    const ctx = canvas.value?.getContext('2d')
    if (!ctx)
      return

    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
    nodes.value.forEach(({ composable, id }) => {
      composable.render()
      if (selectedNodeIds.value.includes(id))
        drawSelectedNode(ctx, composable.node)
    })
    if (isDrawing.value) {
      if (toolsStore.currentTool) {
        ctx.strokeStyle = 'hsla(9, 79%, 58%, 1)'
        ctx.fillStyle = 'hsla(9, 79%, 58%, 0)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.rect(selectedArea.value.x, selectedArea.value.y, selectedArea.value.width, selectedArea.value.height)
        ctx.fill()
        ctx.stroke()
        drawSizeLabel(ctx)
      }
      else {
        ctx.strokeStyle = 'white'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.rect(selectedArea.value.x, selectedArea.value.y, selectedArea.value.width, selectedArea.value.height)
        ctx.fill()
        ctx.stroke()
      }
    }
    else {
      const hoveredNode = findNodeByPoint(x.value, y.value)
      if (hoveredNode && !selectedNodeIds.value.includes(hoveredNode.id))
        drawHoveredNode(ctx, hoveredNode.composable.node)
    }
  }

  animationFrameId.value = requestAnimationFrame(draw)
}

onUnmounted(() => {
  if (typeof animationFrameId.value === 'number')
    cancelAnimationFrame(animationFrameId.value)
})

onMounted(() => {
  draw()
})
</script>

<template>
  <div class="absolute left-100% px-4">
    <pre class="text-xs uppercase">{{ { tool: toolsStore.currentTool ?? null, isDrawing, selectedArea, canvasWidth, canvasHeight } }}</pre>
  </div>
  <div class="absolute right-100% px-4 text-right">
    <div v-for="node in nodes" :key="node.id" class="text-xs uppercase">
      <div class="truncate" :class="selectedNodeIds.includes(node.id) ? 'text-amber' : ''">
        <span class="text-gray">node id: </span> {{ node.id }}
      </div>
      <div class="truncate">
        x:{{ node.composable.node.x }} y: {{ node.composable.node.y }} | w: {{ node.composable.node.width }} h: {{ node.composable.node.height }}
      </div>
    </div>
  </div>
  <div class="w-[var(--canvas-width,100%)] h-[var(--canvas-height,100%)] bg-neutral-800 pa">
    <canvas ref="canvas" class="absolute inset-0 z-10" :width="width" :height="height" />
  </div>
</template>
