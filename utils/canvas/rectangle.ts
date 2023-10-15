interface Size {
  width: number
  height: number
}
interface Position {
  x: number
  y: number
}
interface Stroke {
  strokeColor: string
  strokeWeight?: number
}
interface Corner {
  cornerRadius: number
}
interface DrawRectangleParams {
  position: Position
  size: Size
  stroke?: Stroke
  corner?: Corner
  fill?: string
}
// Рисует фигуру с закругленными углами
function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// Применяет стиль обводки
function applyStrokeStyle(ctx: CanvasRenderingContext2D, stroke?: Stroke, fill?: string) {
  const hasStroke = stroke?.strokeColor && stroke?.strokeWeight !== undefined
  const hasFill = fill && fill !== 'transparent'

  if (!hasStroke && !hasFill)
    return

  ctx.lineWidth = hasStroke ? stroke.strokeWeight ?? 1 : 1
  ctx.strokeStyle = hasStroke ? stroke.strokeColor : 'black'
  ctx.stroke()
}

// Применяет заливку
function applyFill(ctx: CanvasRenderingContext2D, fill: string = '') {
  if (!fill)
    return

  ctx.fillStyle = fill
  ctx.fill()
}

export function drawRectangle(params: DrawRectangleParams, ctx: CanvasRenderingContext2D) {
  const { position, size, stroke, corner, fill } = params
  const { x, y } = position
  const { width, height } = size
  const radius = corner?.cornerRadius || 0

  // Рисуем прямоугольник или фигуру в зависимости от радиуса
  if (radius === 0)
    ctx.rect(x, y, width, height)
  else
    drawShape(ctx, x, y, width, height, radius)

  applyStrokeStyle(ctx, stroke, fill)
  applyFill(ctx, fill)
}
