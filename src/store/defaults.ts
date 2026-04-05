import type { Project, CanvasSettings, ElementNode } from '@/types'
import { generateId } from '@/utils'

const DEFAULT_CANVAS: CanvasSettings = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  width: 1440,
  height: 900,
  showGrid: true,
  snapToGrid: true,
  gridSize: 8,
}

export function createEmptyProject(name = 'Novo Projeto'): Project {
  const now = new Date().toISOString()
  const root: ElementNode = {
    id: generateId(),
    tag: 'div',
    label: 'Root',
    styles: { width: '100%', minHeight: '100vh' },
    attributes: {},
    children: [],
    visible: true,
    locked: false,
    meta: { createdAt: now, updatedAt: now },
  }

  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    version: 1,
    canvas: { ...DEFAULT_CANVAS },
    tokens: { colors: [], typography: [], spacing: [], other: [] },
    styles: [],
    root,
  }
}
