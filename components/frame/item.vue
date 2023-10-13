<script setup lang="ts">
export interface FrameItemProps {
  id: string
  name: string
  width: number
  height: number
}

defineProps<{ frame: FrameItemProps }>()
</script>

<template>
  <div class="relative" :style="{ '--frame-width': `${frame.width}px`, '--frame-height': `${frame.height}px` }">
    <div class="absolute bottom-100% left-0 h-22px text-10px px-3 flex items-center bg-primary rounded-t-2px font-medium">
      {{ frame.name }}
    </div>
    <div border="~ primary" class="w-[--frame-width] h-[--frame-height]">
      <FrameCanvas v-bind="frame" />
    </div>
  </div>
</template>
