<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface TransformerData {
  isDragging: boolean;
  isResizing: boolean;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  elementX: number;
  elementY: number;
  elementWidth: number;
  elementHeight: number;
}

const data = ref<TransformerData>({
  isDragging: false,
  isResizing: false,
  startX: 0,
  startY: 0,
  startWidth: 0,
  startHeight: 0,
  elementX: 0,
  elementY: 0,
  elementWidth: 100,
  elementHeight: 100,
});

const element = ref<HTMLElement | null>(null);

const startDrag = (event: MouseEvent) => {
  data.value.isDragging = true;
  data.value.startX = event.clientX;
  data.value.startY = event.clientY;
  data.value.elementX = element.value?.offsetLeft ?? 0;
  data.value.elementY = element.value?.offsetTop ?? 0;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
};

const drag = (event: MouseEvent) => {
  if (data.value.isDragging) {
    const deltaX = event.clientX - data.value.startX;
    const deltaY = event.clientY - data.value.startY;
    data.value.elementX += deltaX;
    data.value.elementY += deltaY;
    data.value.startX = event.clientX;
    data.value.startY = event.clientY;
  }
};

const stopDrag = () => {
  data.value.isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
};

const startResize = (event: MouseEvent) => {
  data.value.isResizing = true;
  data.value.startX = event.clientX;
  data.value.startY = event.clientY;
  data.value.startWidth = data.value.elementWidth;
  data.value.startHeight = data.value.elementHeight;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
};

const resize = (event: MouseEvent) => {
  if (data.value.isResizing) {
    const deltaX = event.clientX - data.value.startX;
    const deltaY = event.clientY - data.value.startY;
    data.value.elementWidth = Math.max(data.value.startWidth + deltaX, 10);
    data.value.elementHeight = Math.max(data.value.startHeight + deltaY, 10);
  }
};

const stopResize = () => {
  data.value.isResizing = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
};


// onMounted(() => {
//   element.value = $refs.element;
// });

// onUnmounted(() => {
//   element.value = null;
// });

</script>

<template>
  <div class="canvas">
    <div
      class="element"
      :style="{ width: data.elementWidth + 'px', height: data.elementHeight + 'px', transform: `translate(${data.elementX}px, ${data.elementY}px)` }"
      ref="element"
      @mousedown="startDrag"
    >
      <slot />
    </div>
    <div
      class="resize-handle"
      :style="{ transform: `translate(${data.elementX + data.elementWidth}px, ${data.elementY + data.elementHeight}px)` }"
      ref="resizeHandle"
      @mousedown="startResize"
    />
  </div>
</template>

<style scoped>
.canvas {
  position: relative;
  width: 100%;
  height: 100%;
}

.element {
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid black;
}

.resize-handle {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: black;
  cursor: se-resize;
}

.canvas-transformer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}
</style>
