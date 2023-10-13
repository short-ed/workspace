<script setup lang="ts">
enum Tool {
  RECTANGLE = 'RECTANGLE',
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const currentTool = ref<Tool>()

interface Node {
  type: Tool
  x: number
  y: number
  width: number
  height: number
}

interface CanvasNode  {
  id: string
  node: Node
}

const nodes = ref<CanvasNode[]>([])
const selectedNodeIds = ref<CanvasNode['id'][]>([])

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

const onAreaSelect = (size: Size, position: Position) => {
  if (currentTool.value === Tool.RECTANGLE) {
    currentTool.value = undefined
    const id = generateUniqueId()
    nodes.value.push({
      id,
      node: {
        type: Tool.RECTANGLE,
        ...size,
        ...position,
      }
    })
    selectedNodeIds.value = [id]
  }
}


const onSelect = (id: string) => {
  selectedNodeIds.value = [id]
}

const unselectNodes  = () => {
  selectedNodeIds.value = []
}

const changeNodeParams = (nodeId: string, props: Size & Position) => {
  const node = nodes.value.find(({id}) => id === nodeId)
  if (node) {
    node.node.x = props.x
    node.node.y = props.y
    node.node.width = props.width
    node.node.height = props.height
  }
}

const toolIsSelected = (tool: Tool) => currentTool.value === tool
</script>

<template>
  <div class="relative">
    <SpaceCanvas class="relative w-full h-full" @onFinishSelect="onAreaSelect" @onClickOutsideNodes="unselectNodes">
      <!-- <template #default>
        <NodeManopulator class="absolute z-3" v-for="{node, id } in nodes" :key="id" v-bind="node" :focused="selectedNodeIds.includes(id)" @onFocus="onSelect(id)" @onChange="(props) => changeNodeParams(id, props)">
          <div :style="{'--width': `${node.width}`, '--height': `${node.height}`}" class="w-[calc(var(--width,1)*1px)] h-[calc(var(--height,1)*1px)] bg-white/20 overflow-hidden" />
        </NodeManopulator>
      </template> -->
    </SpaceCanvas>
  </div>
</template>
