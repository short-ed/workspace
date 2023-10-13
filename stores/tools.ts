import { defineStore } from 'pinia'

export type Tool = 'rectangle'
export const useToolsStore = defineStore('tools', () => {
  const currentTool = ref<Tool>()

  const setTool = (tool: Tool) => {
    currentTool.value = tool
  }

  const unsetTool = () => {
    currentTool.value = undefined
  }

  return {
    currentTool,
    setTool,
    unsetTool,
  }
})
