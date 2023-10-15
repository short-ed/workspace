import { canvasUtil } from '~/utils/canvas/index'

interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

interface DrawResizableFrameParams {
  position: Position
  size: Size
}

const STROKE_COLOR = 'hsla(162, 100%, 27%, 1)'
const STROKE_WEIGHT = 1
const RESIZE_CORNER_RADIUS = 2
const RESIZE_CORNER_SIZE = 8
const RESIZE_CORNER_HALF_SIZE = RESIZE_CORNER_SIZE / 2
const RESIZE_CORNER_FILL = 'white'
const LABEL_TEXT_COLOR = 'white'
const LABEL_PADDING_X = 4
const GAP = 8

function drawResizableFrame(params: DrawResizableFrameParams, ctx: CanvasRenderingContext2D) {
  const { position, size } = params
  canvasUtil.drawRectangle({
    size,
    position,
    stroke: {
      strokeColor: STROKE_COLOR,
      strokeWeight: STROKE_WEIGHT,
    },
  }, ctx)
}

function drawSizeLabel({ position, size }: DrawResizableFrameParams, ctx: CanvasRenderingContext2D) {
  const labelText = `${size.width}x${size.height}`
  ctx.font = '10px monospace'
  ctx.fillStyle = LABEL_TEXT_COLOR
  const LABEL_WIDTH = ctx.measureText(labelText).width + LABEL_PADDING_X * 2
  const x = position.x + size.width / 2 - LABEL_WIDTH / 2
  const y = position.y + size.height + GAP
  ctx.fillStyle = STROKE_COLOR
  ctx.fillRect(x - 4, y, LABEL_WIDTH, 16)
  ctx.fillStyle = LABEL_TEXT_COLOR
  ctx.fillText(labelText, x, y + 12)
}

function drawResizeCorner({ position }: { position: Position }, ctx: CanvasRenderingContext2D) {
  const { x, y } = position
  const cornerPosition = {
    x: x - RESIZE_CORNER_HALF_SIZE,
    y: y - RESIZE_CORNER_HALF_SIZE,
  }
  canvasUtil.drawRectangle({
    size: {
      width: RESIZE_CORNER_SIZE,
      height: RESIZE_CORNER_SIZE,
    },
    corner: {
      cornerRadius: RESIZE_CORNER_RADIUS,
    },
    position: cornerPosition,
    fill: RESIZE_CORNER_FILL,
  }, ctx)
}

let withResize = false
let withLabel = false

export function resizableFrame({ withResizeCorner, withSizeLabel }: { withResizeCorner?: boolean; withSizeLabel?: boolean }) {
  withResize = withResizeCorner ?? false
  withLabel = withSizeLabel ?? false
  const draw = (params: DrawResizableFrameParams, ctx: CanvasRenderingContext2D) => {
    drawResizableFrame(params, ctx)
    if (withLabel)
      drawSizeLabel(params, ctx)
    if (withResize) {
      drawResizeCorner(params, ctx)
      drawResizeCorner({
        position: {
          x: params.position.x + params.size.width,
          y: params.position.y + params.size.height,
        },
      }, ctx)
      drawResizeCorner({
        position: {
          x: params.position.x + params.size.width,
          y: params.position.y,
        },
      }, ctx)
      drawResizeCorner({
        position: {
          x: params.position.x,
          y: params.position.y + params.size.height,
        },
      }, ctx)
    }
  }

  return {
    draw,
  }
}
