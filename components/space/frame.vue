<script setup lang="ts">
import { ref } from 'vue'

enum Tool {
  RECTANGLE = 'RECTANGLE',
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const currentTool = ref<Tool | undefined>()

interface Node {
  type: Tool
  x: number
  y: number
  width: number
  height: number
}

interface CanvasNode {
  id: string
  node: Node
}

const nodes = ref<CanvasNode[]>([])
const selectedNodeIds = ref<string[]>([])

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

function onAreaSelect(size: Size, position: Position) {
  if (currentTool.value === Tool.RECTANGLE) {
    currentTool.value = undefined
    const id = generateUniqueId()
    nodes.value.push({
      id,
      node: {
        type: Tool.RECTANGLE,
        ...size,
        ...position,
      },
    })
    selectedNodeIds.value = [id]
  }
}

function unselectNodes() {
  selectedNodeIds.value = []
}
</script>

<template>
  <div class="relative">
    <SpaceCanvas class="relative w-full h-full" @on-finish-select="onAreaSelect" @on-click-outside-nodes="unselectNodes" />
  </div>
</template>
