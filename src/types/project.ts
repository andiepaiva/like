import type { ElementNode } from './element'
import type { DesignTokens, GlobalStyle } from './tokens'

export interface CanvasSettings {
  zoom: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
}

export type SyncStatus = 'idle' | 'canvas-to-code' | 'code-to-canvas' | 'error'

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  version: number
  canvas: CanvasSettings
  tokens: DesignTokens
  styles: GlobalStyle[]
  root: ElementNode
}
