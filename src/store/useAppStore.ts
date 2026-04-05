import { create } from 'zustand'
import type { AppStore } from '@/types'
import {
  findElementById,
  findParentOf,
  updateNodeInTree,
  removeNodeFromTree,
  insertNodeInTree,
  cloneSubtree,
  generateId,
} from '@/utils'

const MAX_HISTORY = 50

export const useAppStore = create<AppStore>((set, get) => ({
  // ─── Projeto ───────────────────────────────────────────────
  project: null,

  setProject: (project) => set({ project }),

  updateElement: (id, changes) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: updateNodeInTree(project.root, id, node => ({
          ...node,
          ...changes,
          meta: { ...node.meta, updatedAt: now },
        })),
      },
      isSaved: false,
    })
  },

  updateElementStyles: (id, styles) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: updateNodeInTree(project.root, id, node => ({
          ...node,
          styles: { ...node.styles, ...styles },
          meta: { ...node.meta, updatedAt: now },
        })),
      },
      isSaved: false,
    })
  },

  insertElement: (parentId, element) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: insertNodeInTree(project.root, parentId, element),
      },
      isSaved: false,
    })
  },

  deleteElement: (id) => {
    const { project, selectedElementId } = get()
    if (!project) return
    if (project.root.id === id) return // nunca deletar root
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: removeNodeFromTree(project.root, id),
      },
      selectedElementId: selectedElementId === id ? null : selectedElementId,
      isSaved: false,
    })
  },

  duplicateElement: (id) => {
    const { project } = get()
    if (!project) return
    if (project.root.id === id) return // nunca duplicar root
    const original = findElementById(project.root, id)
    if (!original) return
    const parent = findParentOf(project.root, id)
    if (!parent) return
    get().pushHistory()
    const clone = cloneSubtree(original, generateId)
    clone.label = `${original.label} (cópia)`
    const siblingIndex = parent.children.findIndex(c => c.id === id)
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: insertNodeInTree(project.root, parent.id, clone, siblingIndex + 1),
      },
      isSaved: false,
    })
  },

  moveElement: (id, newParentId, index) => {
    const { project } = get()
    if (!project) return
    if (project.root.id === id) return // nunca mover root
    const element = findElementById(project.root, id)
    if (!element) return
    get().pushHistory()
    const now = new Date().toISOString()
    const withoutNode = removeNodeFromTree(project.root, id)
    set({
      project: {
        ...project,
        updatedAt: now,
        root: insertNodeInTree(withoutNode, newParentId, element, index),
      },
      isSaved: false,
    })
  },

  renameElement: (id, label) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        root: updateNodeInTree(project.root, id, node => ({
          ...node,
          label,
          meta: { ...node.meta, updatedAt: now },
        })),
      },
      isSaved: false,
    })
  },

  // ─── Seleção ───────────────────────────────────────────────
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),

  // ─── Tokens ────────────────────────────────────────────────
  addToken: (category, token) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        tokens: {
          ...project.tokens,
          [category]: [...project.tokens[category], token],
        },
      },
      isSaved: false,
    })
  },

  updateToken: (id, changes) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    const updateCategory = (tokens: typeof project.tokens.colors) =>
      tokens.map(t => (t.id === id ? { ...t, ...changes } : t))
    set({
      project: {
        ...project,
        updatedAt: now,
        tokens: {
          colors: updateCategory(project.tokens.colors),
          typography: updateCategory(project.tokens.typography),
          spacing: updateCategory(project.tokens.spacing),
          other: updateCategory(project.tokens.other),
        },
      },
      isSaved: false,
    })
  },

  deleteToken: (id) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    const filterCategory = (tokens: typeof project.tokens.colors) =>
      tokens.filter(t => t.id !== id)
    set({
      project: {
        ...project,
        updatedAt: now,
        tokens: {
          colors: filterCategory(project.tokens.colors),
          typography: filterCategory(project.tokens.typography),
          spacing: filterCategory(project.tokens.spacing),
          other: filterCategory(project.tokens.other),
        },
      },
      isSaved: false,
    })
  },

  // ─── Global Styles ────────────────────────────────────────
  addGlobalStyle: (style) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        styles: [...project.styles, style],
      },
      isSaved: false,
    })
  },

  updateGlobalStyle: (id, changes) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        styles: project.styles.map(s => (s.id === id ? { ...s, ...changes } : s)),
      },
      isSaved: false,
    })
  },

  deleteGlobalStyle: (id) => {
    const { project } = get()
    if (!project) return
    get().pushHistory()
    const now = new Date().toISOString()
    set({
      project: {
        ...project,
        updatedAt: now,
        styles: project.styles.filter(s => s.id !== id),
      },
      isSaved: false,
    })
  },

  // ─── Histórico ────────────────────────────────────────────
  history: [],
  historyIndex: -1,

  pushHistory: () => {
    const { project, history, historyIndex } = get()
    if (!project) return
    const snapshot = structuredClone(project)
    // Descartar redo futuro ao criar nova entrada
    const trimmed = history.slice(0, historyIndex + 1)
    trimmed.push(snapshot)
    // Limitar tamanho
    if (trimmed.length > MAX_HISTORY) trimmed.shift()
    set({ history: trimmed, historyIndex: trimmed.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < 0) return
    const snapshot = history[historyIndex]
    if (!snapshot) return
    set({
      project: structuredClone(snapshot),
      historyIndex: historyIndex - 1,
      isSaved: false,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    const snapshot = history[nextIndex]
    if (!snapshot) return
    set({
      project: structuredClone(snapshot),
      historyIndex: nextIndex,
      isSaved: false,
    })
  },

  // ─── Canvas ────────────────────────────────────────────────
  canvasSettings: {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    width: 1440,
    height: 900,
    showGrid: true,
    snapToGrid: true,
    gridSize: 8,
  },

  updateCanvasSettings: (changes) => set(state => ({
    canvasSettings: { ...state.canvasSettings, ...changes },
  })),

  // ─── Sync ──────────────────────────────────────────────────
  syncStatus: 'idle',
  setSyncStatus: (status) => set({ syncStatus: status }),

  // ─── Persistência ──────────────────────────────────────────
  isSaved: true,
  lastSavedAt: null,
  markSaved: () => set({ isSaved: true, lastSavedAt: new Date().toISOString() }),
  markUnsaved: () => set({ isSaved: false }),
}))
