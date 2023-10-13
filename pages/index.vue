<script setup lang="ts">
import { useFramesStore } from '~/stores/frames'
import type { Tool } from '~/stores/tools'
import { useToolsStore } from '~/stores/tools'
import SpaceTools from '~/components/space/tools.vue'

const framesStore = useFramesStore()
const toolsStore = useToolsStore()
const toolIsSelected = (tool: Tool): boolean => toolsStore.currentTool === tool
</script>

<template>
  <div class="flex justify-center py-2">
    <SpaceTools />
  </div>
  <div class="w-full flex p-10 justify-center gap-4">
    <FrameItem v-for="frame in framesStore.frames" :key="frame.id" :frame="frame" />
  </div>
</template>
