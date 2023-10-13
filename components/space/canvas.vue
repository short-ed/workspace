<script setup lang="ts">
import { useContextMenuStore } from '~/stores/context-menu';

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

const canvasAreaProps = computed(() => ({
  x: helperAreaPosition.value.x,
  y: helperAreaPosition.value.y,
  width: helperAreaSize.value.width,
  height: helperAreaSize.value.height,
  opacity: pressed.value ? 1 : 0
}))

watch(pressed, (newPressedValue) => {
  if (newPressedValue) {
    startPosition.value = { x: x.value, y: y.value }
    emits('onClickOutsideNodes')
  } else {
    emits('onFinishSelect', helperAreaSize.value, helperAreaPosition.value)
  }
})

const contextMEnuStore = useContextMenuStore()

const openContext = (e: MouseEvent) => {
  contextMEnuStore.open({
    positionMenu: { x: e.clientX, y: e.clientY },
    itemsMenu: [
      // {
      //   label: 'Copy',
      //   hotkey: '⌘C',
      //   action: () => {}
      // },
      {
        label: 'Canvas menu item',
      action: () => {}
      },
    ]
  })
}


const elementProps = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 60,
});

const elementDeltaProps = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

</script>

<template>
  <div class="pattern-grid overflow-hidden" ref="canvasEl">
    <!-- <NodeFrame :size="{ width: elementProps.width, height: elementProps.height }" :position="{ x: elementProps.x, y: elementProps.height }"  /> -->
    <NodeFrame v-if="pressed" class="pointer-events-none" :size="canvasAreaProps" :position="canvasAreaProps"  />
    <CanvasArea v-bind="canvasAreaProps" />
    <!-- <div ref="canvasEl" class="absolute top-0 left-0 w-full h-full" @contextmenu.self="openContext">
    </div> -->
    <!-- <slot /> -->
  </div>
</template>

<style scoped>
.painter-container {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background-color: #141414;
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