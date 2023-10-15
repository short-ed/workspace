<script setup lang="ts">
import { useFramesStore } from '~/stores/frames'
import SpaceTools from '~/components/space/tools.vue'

const framesStore = useFramesStore()
</script>

<template>
  <div class="flex justify-center py-2">
    <SpaceTools />
  </div>
  <div class="w-full flex p-10 justify-center gap-4">
    <FrameItem v-for="frame in framesStore.frames" :key="frame.id" :frame="frame" />
  </div>
</template>
