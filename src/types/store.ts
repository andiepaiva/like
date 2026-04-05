import type { ElementNode, CSSProperties } from './element'
import type { Token, GlobalStyle } from './tokens'
import type { Project, CanvasSettings, SyncStatus } from './project'

export interface AppStore {
  // ─── Projeto ───────────────────────────────────────────────
  project: Project | null
  setProject: (project: Project) => void
  updateElement: (id: string, changes: Partial<ElementNode>) => void
  updateElementStyles: (id: string, styles: Partial<CSSProperties>) => void
  updateElementStylesSilent: (id: string, styles: Partial<CSSProperties>) => void
  insertElement: (parentId: string, element: ElementNode) => void
  deleteElement: (id: string) => void
  deleteElements: (ids: string[]) => void
  duplicateElement: (id: string) => void
  moveElement: (id: string, newParentId: string, index: number) => void
  renameElement: (id: string, label: string) => void

  // ─── Seleção ───────────────────────────────────────────────
  selectedElementIds: string[]
  setSelectedElementIds: (ids: string[]) => void
  toggleSelectedElement: (id: string) => void
  addSelectedElement: (id: string) => void

  // ─── Tokens e Estilos Globais ──────────────────────────────
  addToken: (category: 'colors' | 'typography' | 'spacing' | 'other', token: Token) => void
  updateToken: (id: string, changes: Partial<Token>) => void
  deleteToken: (id: string) => void
  addGlobalStyle: (style: GlobalStyle) => void
  updateGlobalStyle: (id: string, changes: Partial<GlobalStyle>) => void
  deleteGlobalStyle: (id: string) => void

  // ─── Histórico (Undo/Redo) ─────────────────────────────────
  history: Project[]
  future: Project[]
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // ─── Canvas ────────────────────────────────────────────────
  canvasSettings: CanvasSettings
  updateCanvasSettings: (changes: Partial<CanvasSettings>) => void

  // ─── Sync ──────────────────────────────────────────────────
  syncStatus: SyncStatus
  setSyncStatus: (status: SyncStatus) => void

  // ─── Persistência ──────────────────────────────────────────
  isSaved: boolean
  lastSavedAt: string | null
  markSaved: () => void
  markUnsaved: () => void
}
