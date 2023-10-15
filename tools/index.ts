import type { useRectangle } from './rectangle'

// interface IndividualCorner {
//   topLeftRadius: number
//   topRightRadius: number
//   bottomLeftRadius: number
//   bottomRightRadius: number
// }

// interface Corner {
//   cornerRadius: number | IndividualCorner
// }

// interface IndividualStroke {
//   strokeTopWeight: number
//   strokeBottomWeight: number
//   strokeLeftWeight: number
//   strokeRightWeight: number
// }

// interface Stroke {
//   strokeWeight: number | IndividualStroke
//   strikeColor: string
// }

// interface Fill {
//   fillColor: string
// }

interface DimensionAndPosition {
  x: number
  y: number
  width: number
  height: number
}

interface BaseNodeMixin extends DimensionAndPosition {}

export interface BaseNode extends BaseNodeMixin {}

export interface UseNode {
  node: MaybeRef<BaseNode>
  setParams: (properties: Partial<BaseNode>) => void
  render: (ctx?: CanvasRenderingContext2D) => void
}

export type RectangleNode = ReturnType<typeof useRectangle>
