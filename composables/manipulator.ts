export const useManipulator = () => {
  const start = ref({ x: 0, y: 0, width: 0, height: 0 })
  const delta = ref({ x: 0, y: 0, width: 0, height: 0 })
  const end = ref({ x: 0, y: 0, width: 0, height: 0 })
  const isDragging = ref(false)
  const isResizing = ref(false)

  const onStart = (e: MouseEvent) => {
    isDragging.value = true
    start.value = {
      x: e.clientX,
      y: e.clientY,
      width: end.value.width,
      height: end.value.height,
    }
  }

  const onMove = (e: MouseEvent) => {
    if (isDragging.value) {
      delta.value = {
        x: e.clientX - start.value.x,
        y: e.clientY - start.value.y,
        width: 0,
        height: 0,
      }
    }

    if (isResizing.value) {
      delta.value = {
        x: 0,
        y: 0,
        width: e.clientX - start.value.x,
        height: e.clientY - start.value.y,
      }
    }
  }

  const onFinish = () => {
    isDragging.value = false
    end.value = {
      x: start.value.x + delta.value.x,
      y: start.value.y + delta.value.y,
      width: start.value.width + delta.value.width,
      height: start.value.height + delta.value.height,
    }
    delta.value = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    }
  }

  return {
    onStart,
    onMove,
    onFinish,
  }
}