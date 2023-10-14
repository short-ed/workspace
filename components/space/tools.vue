<!-- eslint-disable vue/html-self-closing -->
<script setup lang="ts">
import type { Tool } from '~/stores/tools'
import { useToolsStore } from '~/stores/tools'
import { useRectangle } from '~/tools/rectangle'

const toolsStore = useToolsStore()

const toolIsSelected = (tool: Tool): boolean => toolsStore.currentTool === tool
</script>

<template>
  <div class="relative p-1 rounded-md bg-#1C1C1C flex gap-2">
    <button
      type="button"
      class="transition block w-32px h-32px p-1 rounded cursor-pointer hover:fill-white"
      :class="!toolsStore.currentTool ? 'fill-white bg-primary' : 'fill-white/50'"
      @click="toolsStore.unsetTool"
    >
      <svg viewBox="0 0 32 32" class="block">
        <path d="M28.34 13.0601L6.34001 5.06007C6.1614 4.99564 5.96815 4.98339 5.78284 5.02475C5.59753 5.06611 5.42782 5.15937 5.29356 5.29363C5.15931 5.42788 5.06605 5.59759 5.02469 5.7829C4.98333 5.96821 4.99558 6.16146 5.06001 6.34007L13.06 28.3401C13.1299 28.5333 13.2576 28.7004 13.4258 28.8185C13.594 28.9366 13.7945 29 14 29.0001C14.2003 29.0003 14.396 28.9403 14.5618 28.828C14.7276 28.7157 14.8559 28.5561 14.93 28.3701L18.77 18.7701L28.37 14.9301C28.5597 14.8581 28.7231 14.7301 28.8384 14.5631C28.9536 14.3961 29.0154 14.198 29.0154 13.9951C29.0154 13.7921 28.9536 13.594 28.8384 13.427C28.7231 13.26 28.5597 13.132 28.37 13.0601H28.34ZM17.63 17.0601L17.23 17.2201L17.07 17.6201L14 25.2001L7.67001 7.67007L25.2 14.0001L17.63 17.0601Z" />
      </svg>
    </button>

    <!-- Rectangle tool button -->
    <button
      v-for="tool in toolsStore.tools"
      :key="tool.name"
      type="button"
      class="transition block w-32px h-32px p-1 rounded cursor-pointer hover:fill-white"
      :class="toolIsSelected(tool.name) ? 'fill-white bg-primary' : 'fill-white/50'"
      @click="toolsStore.setTool(tool.name)"
    >
      <svg viewBox="0 0 32 32" class="block" :innerHTML="tool.icon">
        <g />
      </svg>
    </button>
  </div>
</template>
