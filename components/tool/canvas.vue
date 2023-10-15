<script setup lang="ts">
  import { useToolsStore } from '~/stores/tools'
  import type { NodeComposition } from '~/tools'
  import { useRectangle } from '~/tools/rectangle'
  import { canvasUtil } from '~/utils/canvas'

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
  const nodes = ref<CanvasNodeComposition[]>([])
  const isDrawing = ref(false)
  const startX = ref(0)
  const startY = ref(0)
  const endX = ref(0)
  const endY = ref(0)

  const toolsStore = useToolsStore()

  const generateUId = () => Math.random().toString(36).substring(2, 9)

  const ESC_KEY_CODE = 27
  const DELETE_KEY_CODE = 46
  const BACKSPACE_KEY_CODE = 8

  function handleKeyDown(event: KeyboardEvent) {
    const isDeleteKey = [DELETE_KEY_CODE, BACKSPACE_KEY_CODE].includes(event.keyCode)
    const isEscKey = event.keyCode === ESC_KEY_CODE
    const isCanceling = isDrawing.value && isEscKey
    const selectedNode = findSelectedNode()
    if (selectedNode) {
      if (isCanceling || isDeleteKey) {
        if (isCanceling) isDrawing.value = false
        removeNodeById(selectedNode.id as string)
        unselectAll()
      }
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

    watch(hasSelectedNode, (newValue, oldValue) => {
      if (newValue && oldValue === false)
        document.addEventListener('keydown', handleKeyDown, true)
      else if (newValue === false && oldValue)
        document.removeEventListener('keydown', handleKeyDown, true)
    }, { immediate: true })

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

    function removeNodeById(id: string) {
      const index = nodes.value.findIndex(node => node.id === id)
      if (index === -1)
        return
      nodes.value.splice(index, 1)
      if (selectedNodeIds.value.includes(id))
        selectedNodeIds.value = selectedNodeIds.value.filter(nodeId => nodeId !== id)
    }

    function startDrawNode(node: CanvasNodeComposition) {
      nodes.value.push(node)
      selectNodeById(node.id)
    }

    function clickOnNode(node: CanvasNodeComposition) {
      if (selectedNodeIds.value.includes(node.id))
        return
      selectNodeById(node.id)
    }

    function findNodeByPoint(x: number, y: number) {
      return nodes.value.findLast((node) => {
        const { x: nodeX, y: nodeY, width, height } = node.node.node
        return (x > nodeX && x < nodeX + width && y > nodeY && y < nodeY + height)
      })
    }

    function clickWithoutTool(e: MouseEvent) {
      const rect = (canvasEl.value as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const node = findNodeByPoint(x, y)
      if (node) {
        clickOnNode(node)
        return
      } else {
        unselectAll()
      }
    }

    function onMouseDown(e: MouseEvent) {
      const rect = (canvasEl.value as HTMLElement).getBoundingClientRect()
      if (toolsStore.currentTool === undefined) {
        clickWithoutTool(e)
        return
      }
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
      unselectAll()
      const id = generateUId()
      nodes.value.push({
        id,
        node: rectangle,
        isSelect: false,
      })
      selectNodeById(id)
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

    function findSelectedNode() {
      return rectangles.value.find(node => node.isSelect)
    }

    const { elementX, elementY } = useMouseInElement(canvasEl)
    const hoveredNodeId = computed(() => {
      if (isDrawing.value)
        return null
      const x = elementX.value
      const y = elementY.value
      const nodeOutPoint = rectangles.value.find((node) => {
        const { x: nodeX, y: nodeY, width, height } = node.node.node
        const matchX = x > nodeX && x < nodeX + width
        const matchY = y > nodeY && y < nodeY + height
        return matchX && matchY
      })

      if (nodeOutPoint) {
        if (nodeOutPoint.isSelect)
          return null
        return nodeOutPoint.id
      }
      return null
    })

    function onMouseUp(e: MouseEvent) {
      if (!isDrawing.value)
        return
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
      drawSelectionFrame(x, y, width, height)
      toolsStore.unsetTool()
    }

    function drawRectangles() {
      const { ctx, canvas } = getCanvasContext()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      rectangles.value.forEach((node) => {
        node.node.render()
        if (node.id === hoveredNodeId.value) {
          const { x, y, width, height } = node.node.node
          ctx.strokeStyle = 'hsla(216, 91%, 52%, 1)'
          ctx.strokeRect(x, y, width, height)
          drawSelectionFrame(x, y, width, height, { resizeHandlers: false })
        }
        if (node.isSelect && !isDrawing.value) {
          const { x, y, width, height } = node.node.node
          drawSelectionFrame(x, y, width, height)
        }
      })
      if (isDrawing.value) {
        const x = Math.min(startX.value, endX.value)
        const y = Math.min(startY.value, endY.value)
        const width = Math.abs(endX.value - startX.value)
        const height = Math.abs(endY.value - startY.value)
        drawSelectionFrame(x, y, width, height)
      }
    }

    function drawSelectionFrame(x: number, y: number, width: number, height: number, { resizeHandlers }: { resizeHandlers?: boolean } = { resizeHandlers: true }) {
      const { ctx } = getCanvasContext()
      const borderStrokeColor = 'hsla(162, 100%, 27%, 1)'
      const handlerSize = 10
      const cornerRadius = 3 // Радиус скругления углов
      const borderColor = 'hsla(162, 100%, 27%, 1)'
      const borderWidth = 1

      ctx.strokeStyle = borderStrokeColor
      ctx.strokeRect(x, y, width, height)

      // Рисование маркеров изменения размера
      const drawResizeHandle = (x: number, y: number) => {
        canvasUtil.drawRectangle({
          size: { width: handlerSize, height: handlerSize },
          position: { x: x - handlerSize / 2, y: y - handlerSize / 2 },
          stroke: {
            strokeColor: borderColor,
            strokeWeight: borderWidth,
          },
          corner: {
            cornerRadius,
          },
          fill: 'white',
        }, ctx)
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
        drawResizeHandle(x, y)
        drawResizeHandle(x + width, y)
        drawResizeHandle(x, y + height)
        drawResizeHandle(x + width, y + height)
        drowSizeLabel(x, y, width, height)
      }
    }

    watch(hoveredNodeId, (id) => {
      if (id)
        canvasEl.value?.classList.add('cursor-move')
      else
        canvasEl.value?.classList.remove('cursor-move')
      drawRectangles()
    })
</script>

<template>
<div class="relative">
  <div class="absolute right-100% px-4">
    <ul>
      <li v-for="node in rectangles" :key="node.id">
        {{ node.id }}
      </li>
    </ul>
  </div>
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
</div>
</template>
