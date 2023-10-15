import type { BaseNode } from '.'

export function useRectangle(node: BaseNode, ctx: CanvasRenderingContext2D) {
  const rectangle = ref < any & BaseNode > ({
    ...node,
    fillColor: 'hsla(0, 0%, 8%, 1)',
    strikeColor: 'hsla(0, 20%, 0%, 1)',
  })
  const context = ref(ctx)

  const setParams = (properties: Partial<BaseNode>) => {
    rectangle.value = { ...rectangle.value, ...properties }
  }

  const render = (ctx?: CanvasRenderingContext2D) => {
    const canvasCtx = ctx || context.value
    const { x, y, width, height } = rectangle.value
    if (rectangle.value.fillColor) {
      canvasCtx.fillStyle = rectangle.value.fillColor
      canvasCtx.fillRect(x, y, width, height)
    }
    if (rectangle.value.strikeColor) {
      canvasCtx.strokeStyle = rectangle.value.strikeColor
      canvasCtx.strokeRect(x, y, width, height)
    }
  }

  return {
    node: rectangle,
    setParams,
    render,
  }
}
