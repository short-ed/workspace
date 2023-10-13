import { defineStore } from 'pinia'

export const useContextMenuStore = defineStore('context-menu', () => {
  interface Position {
    x: number
    y: number
  }

  interface Item {
    label: string
    hotkey?: string
    action: (params?: any) => void | Promise<void>
  }

  const isVisible = ref(true)
  const position = ref<Position>({ x: 0, y: 0 })
  const items = ref<Item[]>([])

  const open = ({ positionMenu, itemsMenu }: { positionMenu?: Position; itemsMenu?: Item[] }) => {
    if (positionMenu)
      position.value = positionMenu

    if (itemsMenu)
      items.value = itemsMenu

    isVisible.value = true
  }

  const close = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    position,
    items,
    open,
    close,
  }
})
