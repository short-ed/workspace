import { Target } from 'nuxt/dist/head/runtime/types'

/**
 * Тип для представления возможного элемента canvas.
 */
type MaybeCanvasElement = HTMLCanvasElement | undefined | null

/**
 * Тип для представления возможной ссылки на элемент.
 */
type MaybeCanvasRef<T extends MaybeCanvasElement = MaybeCanvasElement> = MaybeRef<T>

/**
 * Интерфейс для представления выбранной области.
 */
interface SelectedArea {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Интерфейс для представления результата useMouseCanvas.
 */
interface UseMouseOnCanvasReturn {
  x: Ref<number>
  y: Ref<number>
  canvasWidth: Ref<number>
  canvasHeight: Ref<number>
  canvasX: Ref<number>
  canvasY: Ref<number>
  isDrawing: Ref<boolean>
  selectedArea: Ref<SelectedArea>
  canvasRef: Ref<MaybeCanvasElement>
  stop: () => void
}

/**
 * Интерфейс для представления позиции начала рисования.
 */
interface StartDrawingPosition {
  x: number
  y: number
}

/**
 * calculateSelectedArea - функция для вычисления выбранной области.
 * @param {StartDrawingPosition} start - позиция начала рисования.
 * @param {StartDrawingPosition} end - позиция конца рисования.
 * @returns {SelectedArea} - объект с данными о выбранной области.
 * @example const selectedArea = calculateSelectedArea(start, end);
 */
function calculateSelectedArea(start: StartDrawingPosition, end: StartDrawingPosition): SelectedArea {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const width = Math.abs(start.x - end.x)
  const height = Math.abs(start.y - end.y)
  return { x, y, width, height }
}

/**
 * useMouseOnCanvas - это Composable метод, который отслеживает движение мыши на холсте и создает
 * виртуальную область выделения, когда пользователь зажимает мышь и перемещает курсор.
 *
 * @param {MaybeCanvasRef} canvas - ссылка на элемент canvas.
 * @returns {UseMouseCanvasResult} - объект с данными о текущем состоянии мыши и холста.
 * @example
 * const { x, y, selectedArea } = useMouseOnCanvas(canvasRef);
 */
export function useMouseOnCanvas(canvas: MaybeCanvasRef): UseMouseOnCanvasReturn {
  const { x: mouseX, y: mouseY } = useMouse()
  const canvasRef = ref(canvas)

  const x = ref(0)
  const y = ref(0)
  const canvasX = ref(0)
  const canvasY = ref(0)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const isDrawing = ref(false)

  const startDrawingPosition = reactive<StartDrawingPosition>({
    x: 0,
    y: 0,
  })

  const selectedArea = ref<SelectedArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })

  /**
   * stop - функция для остановки отслеживания.
   */
  const stop = watch([canvasRef, mouseX, mouseY], () => {
    const canvas = unrefElement(canvasRef)
    if (!canvas)
      return

    const {
      width,
      height,
      left,
      top,
    } = canvas.getBoundingClientRect()

    canvasWidth.value = width
    canvasHeight.value = height
    canvasX.value = left
    canvasY.value = top

    x.value = mouseX.value - canvasX.value
    y.value = mouseY.value - canvasY.value

    if (isDrawing.value)
      selectedArea.value = calculateSelectedArea(startDrawingPosition, { x: x.value, y: y.value })
  }, { immediate: true })

  /**
   * startDrawing - функция для начала процесса рисования.
   */
  const startDrawing = (): void => {
    isDrawing.value = true
    startDrawingPosition.x = x.value
    startDrawingPosition.y = y.value
    selectedArea.value = calculateSelectedArea(startDrawingPosition, { x: x.value, y: y.value })
  }

  /**
   * stopDrawing - функция для завершения процесса рисования.
   */
  const stopDrawing = (): void => {
    isDrawing.value = false
  }

  useEventListener(canvasRef, 'mousedown', startDrawing)
  useEventListener(window, 'mouseup', stopDrawing)

  return {
    x,
    y,
    canvasWidth,
    canvasHeight,
    canvasX,
    canvasY,
    isDrawing,
    selectedArea,
    canvasRef,
    stop,
  }
}
