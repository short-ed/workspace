interface Position {
  x: number
  y: number
}

const isVisible= ref(true)
const position = ref<Position>({x: 0, y: 0})
const items = ref<{
  label: string
  hotkey?: string
  action: (params?: any) => void | Promise<void>
}[]>([])

export const useContextMenu = () => {

  const setMenuItems = (menuItems: {
    label: string
    hotkey?: string
    action: (params?: any) => void | Promise<void>
  }[]) => {
    items.value = menuItems
  }

  const open = (positionMenu?: Position) => {
    if (positionMenu) {
      position.value = positionMenu
    }
    isVisible.value = true
  }

  const close = () => {
    isVisible.value = false
  }

  return {
    isVisible,
    position,
    open,
    close,
    setMenuItems,
    items
  }
}