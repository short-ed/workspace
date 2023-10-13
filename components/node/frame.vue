<template>
  <div class="frame absolute" :style="cssVariables">
    <div class="border-primary resize-handle corner top-left" @mousedown="startResize($event, 'top-left')"></div>
    <div class="border-primary resize-handle corner top-right" @mousedown="startResize($event, 'top-right')"></div>
    <div class="border-primary resize-handle corner bottom-left" @mousedown="startResize($event, 'bottom-left')"></div>
    <div class="border-primary resize-handle corner bottom-right" @mousedown="startResize($event, 'bottom-right')"></div>
    <div class="after:bg-primary resize-handle edge top" @mousedown="startResize($event, 'top')"></div>
    <div class="after:bg-primary resize-handle edge bottom" @mousedown="startResize($event, 'bottom')"></div>
    <div class="after:bg-primary resize-handle edge left" @mousedown="startResize($event, 'left')"></div>
    <div class="after:bg-primary resize-handle edge right" @mousedown="startResize($event, 'right')"></div>
    <div class="absolute top-0 -left-0 translate-y-[calc(var(--height)*1px+8px)] translate-x-[calc((var(--width)*1px-1px)/2)]">
    <div class="h-16px rounded-2px bg-primary px-4px text-10px flex items-center justify-center translate-x--50%">{{ size.width }}x{{ size.height }}</div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps } from 'vue'

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

const props = defineProps<{
  position: Position
  size: Size
}>()

const emits = defineEmits<{
  'update:position': [position: Position],
  'update:size': [size: Size]
}>()

// const onResize = ({
//   width,
//   height,
//   x,
//   y
// } :{
//   width?: number,
//   height?: number,
//   x?: number,
//   y?: number
// }) => {
//   emits('update:modelValue', {
//     width: width ?? props.modelValue.width,
//     height: height ?? props.modelValue.height,
//     x: x ?? props.modelValue.x,
//     y: y ?? props.modelValue.y
//   })
// }

const isResizing = ref(false)
const resizeHandle = ref<string | null>(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

const startResize = (event: MouseEvent, handle: string) => {
  isResizing.value = true
  resizeHandle.value = handle
  startX.value = event.clientX
  startY.value = event.clientY
  startWidth.value = props.size.width
  startHeight.value = props.size.height
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
}

const resize = (event: MouseEvent) => {
  if (!isResizing.value) return
  const deltaX = event.clientX - startX.value
  const deltaY = event.clientY - startY.value

  let deltaPosition = { x: 0, y: 0 }
  let deltaSize = { width: 0, height: 0 }

  if (resizeHandle.value?.includes('top')) {
    deltaPosition.y = deltaY
    deltaSize.height = -deltaY
  }
  if (resizeHandle.value?.includes('bottom')) {
    deltaSize.height = deltaY
  }
  if (resizeHandle.value?.includes('left')) {
    deltaPosition.x = deltaX
    deltaSize.width = -deltaX
  }
  if (resizeHandle.value?.includes('right')) {
    deltaSize.width = deltaX
  }

  // onResize({
  //   width: startWidth.value + deltaSize.width,
  //   height: startHeight.value + deltaSize.height,
  //   x: props.position.x + deltaPosition.x,
  //   y: props.position.y + deltaPosition.y
  // })
}

const stopResize = () => {
  isResizing.value = false
  resizeHandle.value = null
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
}

onMounted(() => {
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
})

const cssVariables = computed(() => ({
  '--width': `${props.size.width}`,
  '--height': `${props.size.height}`,
  '--x': `${props.position.x}`,
  '--y': `${props.position.y}`,
}))

</script>

<style scoped>
.frame {
  --handler-size: 8px;
  width: calc(var(--width, 0)*1px);
  height: calc(var(--height, 0)*1px);
  transform: translate(calc(var(--x)*1px), calc(var(--y)*1px));
}

.resize-handle {
  position: absolute;
}

.resize-handle.corner {
  z-index: 1;
  width: var(--handler-size, 10px);
  height: var(--handler-size, 10px);
  background-color: #fff;
  border-width: 1px;
}

.resize-handle.edge::after {
  content: '';
  display: block;
  min-width: 1px;
  min-height: 1px;
}

.top,
.top-left,
.top-right {
  top: calc(var(--handler-size, 10px)/-2);
}

.bottom,
.bottom-left,
.bottom-right {
  bottom: calc(var(--handler-size, 10px)/-2);
}

.left,
.top-left,
.bottom-left {
  left: calc(var(--handler-size, 10px)/-2);
}

.right,
.top-right,
.bottom-right {
  right: calc(var(--handler-size, 10px)/-2);
}

.top-left,
.bottom-right {
  cursor: nwse-resize;
}

.top-right,
.bottom-left {
  cursor: nesw-resize;
}

.top,
.bottom {
  left: 0;
  right: 0;

  display: grid;
  place-content: center stretch;
  height: var(--handler-size, 10px);
  cursor: ns-resize;
}

.left,
.right {
  top: 0;
  bottom: 0;
  
  display: grid;
  place-content: stretch center;
  width: var(--handler-size, 10px);
  cursor: ew-resize;
}
</style>
