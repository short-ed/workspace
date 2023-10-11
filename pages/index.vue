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
  <div class="fixed top-0 left-0 w-full h-full bg-#141414 text-white p-0 dots-pattern">
    <div class="z-2 left-0 grid top-0 h-full place-content-center absolute px-2">
      <div class="relative p-1 rounded-md bg-#1C1C1C grid gap-1">
        <button type="button" class="transition block w-32px h-32px p-1  rounded cursor-pointer hover:fill-white" :class="!currentTool ? 'fill-white bg-#141414' : 'fill-white/20'"  @click="currentTool = undefined">
          <svg viewBox="0 0 32 32" class="block">
            <path d="M28.34 13.0601L6.34001 5.06007C6.1614 4.99564 5.96815 4.98339 5.78284 5.02475C5.59753 5.06611 5.42782 5.15937 5.29356 5.29363C5.15931 5.42788 5.06605 5.59759 5.02469 5.7829C4.98333 5.96821 4.99558 6.16146 5.06001 6.34007L13.06 28.3401C13.1299 28.5333 13.2576 28.7004 13.4258 28.8185C13.594 28.9366 13.7945 29 14 29.0001C14.2003 29.0003 14.396 28.9403 14.5618 28.828C14.7276 28.7157 14.8559 28.5561 14.93 28.3701L18.77 18.7701L28.37 14.9301C28.5597 14.8581 28.7231 14.7301 28.8384 14.5631C28.9536 14.3961 29.0154 14.198 29.0154 13.9951C29.0154 13.7921 28.9536 13.594 28.8384 13.427C28.7231 13.26 28.5597 13.132 28.37 13.0601H28.34ZM17.63 17.0601L17.23 17.2201L17.07 17.6201L14 25.2001L7.67001 7.67007L25.2 14.0001L17.63 17.0601Z"/>
          </svg>
        </button>
        <button type="button" class="transition block w-32px h-32px p-1  rounded cursor-pointer hover:fill-white" :class="toolIsSelected(Tool.RECTANGLE) ? 'fill-white bg-#141414' : 'fill-white/20'"  @click="currentTool = Tool.RECTANGLE">
          <svg viewBox="0 0 32 32" class="block">
            <path d="M27 22.1421V9.85807C27.6824 9.68321 28.3064 9.33088 28.8086 8.83687C29.3108 8.34285 29.6733 7.72475 29.8593 7.04531C30.0454 6.36588 30.0483 5.64931 29.8679 4.96837C29.6874 4.28743 29.33 3.66637 28.8318 3.16825C28.3337 2.67013 27.7127 2.3127 27.0317 2.13224C26.3508 1.95177 25.6342 1.95471 24.9548 2.14076C24.2753 2.3268 23.6572 2.68933 23.1632 3.19152C22.6692 3.69371 22.3169 4.31768 22.142 5.00007H9.85801C9.68315 4.31768 9.33082 3.69371 8.8368 3.19152C8.34279 2.68933 7.72468 2.3268 7.04525 2.14076C6.36582 1.95471 5.64925 1.95177 4.96831 2.13224C4.28737 2.3127 3.66631 2.67013 3.16819 3.16825C2.67007 3.66637 2.31264 4.28743 2.13217 4.96837C1.95171 5.64931 1.95465 6.36588 2.1407 7.04531C2.32674 7.72475 2.68926 8.34285 3.19145 8.83687C3.69364 9.33088 4.31762 9.68321 5.00001 9.85807V22.1421C4.31762 22.3169 3.69364 22.6693 3.19145 23.1633C2.68926 23.6573 2.32674 24.2754 2.1407 24.9548C1.95465 25.6343 1.95171 26.3508 2.13217 27.0318C2.31264 27.7127 2.67007 28.3338 3.16819 28.8319C3.66631 29.33 4.28737 29.6875 4.96831 29.8679C5.64925 30.0484 6.36582 30.0454 7.04525 29.8594C7.72468 29.6733 8.34279 29.3108 8.8368 28.8086C9.33082 28.3064 9.68315 27.6825 9.85801 27.0001H22.142C22.3169 27.6825 22.6692 28.3064 23.1632 28.8086C23.6572 29.3108 24.2753 29.6733 24.9548 29.8594C25.6342 30.0454 26.3508 30.0484 27.0317 29.8679C27.7127 29.6875 28.3337 29.33 28.8318 28.8319C29.33 28.3338 29.6874 27.7127 29.8679 27.0318C30.0483 26.3508 30.0454 25.6343 29.8593 24.9548C29.6733 24.2754 29.3108 23.6573 28.8086 23.1633C28.3064 22.6693 27.6824 22.3169 27 22.1421ZM26 4.00007C26.3956 4.00007 26.7823 4.11737 27.1112 4.33714C27.4401 4.5569 27.6964 4.86926 27.8478 5.23471C27.9991 5.60016 28.0388 6.00229 27.9616 6.39025C27.8844 6.77822 27.6939 7.13458 27.4142 7.41429C27.1345 7.69399 26.7782 7.88447 26.3902 7.96165C26.0022 8.03882 25.6001 7.99921 25.2346 7.84783C24.8692 7.69646 24.5568 7.44011 24.3371 7.11121C24.1173 6.78232 24 6.39564 24 6.00007C24.0005 5.4698 24.2114 4.9614 24.5864 4.58645C24.9613 4.21149 25.4697 4.0006 26 4.00007ZM4.00001 6.00007C4.00001 5.60451 4.11731 5.21783 4.33707 4.88893C4.55684 4.56004 4.86919 4.30369 5.23465 4.15232C5.6001 4.00094 6.00223 3.96133 6.39019 4.0385C6.77816 4.11567 7.13452 4.30616 7.41423 4.58586C7.69393 4.86557 7.88441 5.22193 7.96158 5.60989C8.03875 5.99786 7.99915 6.39999 7.84777 6.76544C7.6964 7.13089 7.44005 7.44325 7.11115 7.66301C6.78226 7.88278 6.39558 8.00007 6.00001 8.00007C5.46974 7.99955 4.96134 7.78866 4.58638 7.4137C4.21143 7.03874 4.00054 6.53034 4.00001 6.00007ZM6.00001 28.0001C5.60445 28.0001 5.21777 27.8828 4.88887 27.663C4.55997 27.4433 4.30363 27.1309 4.15225 26.7654C4.00088 26.4 3.96127 25.9979 4.03844 25.6099C4.11561 25.2219 4.30609 24.8656 4.5858 24.5859C4.8655 24.3062 5.22187 24.1157 5.60983 24.0385C5.99779 23.9613 6.39993 24.0009 6.76538 24.1523C7.13083 24.3037 7.44319 24.56 7.66295 24.8889C7.88272 25.2178 8.00001 25.6045 8.00001 26.0001C7.99948 26.5303 7.7886 27.0387 7.41364 27.4137C7.03868 27.7887 6.53028 27.9995 6.00001 28.0001ZM22.142 25.0001H9.85801C9.67889 24.3125 9.31961 23.6852 8.81722 23.1829C8.31484 22.6805 7.68754 22.3212 7.00001 22.1421V9.85807C7.68749 9.67885 8.31474 9.31954 8.81711 8.81717C9.31948 8.3148 9.67879 7.68755 9.85801 7.00007H22.142C22.3211 7.6876 22.6804 8.3149 23.1828 8.81728C23.6852 9.31967 24.3125 9.67895 25 9.85807V22.1421C24.3124 22.3211 23.6851 22.6804 23.1827 23.1828C22.6803 23.6852 22.321 24.3125 22.142 25.0001ZM26 28.0001C25.6045 28.0001 25.2178 27.8828 24.8889 27.663C24.56 27.4433 24.3036 27.1309 24.1523 26.7654C24.0009 26.4 23.9613 25.9979 24.0384 25.6099C24.1156 25.2219 24.3061 24.8656 24.5858 24.5859C24.8655 24.3062 25.2219 24.1157 25.6098 24.0385C25.9978 23.9613 26.3999 24.0009 26.7654 24.1523C27.1308 24.3037 27.4432 24.56 27.663 24.8889C27.8827 25.2178 28 25.6045 28 26.0001C27.9992 26.5303 27.7883 27.0385 27.4134 27.4134C27.0385 27.7883 26.5302 27.9993 26 28.0001Z" />
          </svg>
        </button>
      </div>
    </div>
    <div class="absolute z-1 w-full h-full top-0 left-0 p-10 pl-20">
      <SpaceCanvas class="relative z-1 w-full h-full" @onFinishSelect="onAreaSelect" @onClickOutsideNodes="unselectNodes">
        <template #area="{ size, position }"></template>
        <template #default>
          <NodeManopulator class="absolute z-3" v-for="{node, id } in nodes" :key="id" v-bind="node" :focused="selectedNodeIds.includes(id)" @onFocus="onSelect(id)" @onChange="(props) => changeNodeParams(id, props)">
            <div :style="{'--width': `${node.width}`, '--height': `${node.height}`}" class="w-[calc(var(--width,1)*1px)] h-[calc(var(--height,1)*1px)] bg-white/20 overflow-hidden" />
          </NodeManopulator>
        </template>
      </SpaceCanvas>
    </div>
  </div>
  <ContextMenu />
</template>

<style scoped>
.dots-pattern {
  background-image: radial-gradient(#ffffff10 1px, transparent 1px);
  background-size: 16px 16px;
}
</style>