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

  // Atualiza estilos SEM pushHistory — para uso em resize/drag frame-by-frame
  updateElementStylesSilent: (id, styles) => {
    const { project } = get()
    if (!project) return
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
    const { project, selectedElementIds } = get()
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
      selectedElementIds: selectedElementIds.filter(i => i !== id),
      isSaved: false,
    })
  },

  deleteElements: (ids) => {
    const { project } = get()
    if (!project) return
    const idSet = new Set(ids)
    idSet.delete(project.root.id)
    if (idSet.size === 0) return
    // Filtrar IDs cujo ancestral também está na seleção
    const topLevel = [...idSet].filter(id => {
      let parent = findParentOf(project.root, id)
      while (parent) {
        if (idSet.has(parent.id)) return false
        parent = findParentOf(project.root, parent.id)
      }
      return true
    })
    if (topLevel.length === 0) return
    get().pushHistory()
    const now = new Date().toISOString()
    let newRoot = project.root
    for (const id of topLevel) {
      newRoot = removeNodeFromTree(newRoot, id)
    }
    set({
      project: { ...project, updatedAt: now, root: newRoot },
      selectedElementIds: [],
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

  duplicateElements: (ids) => {
    const { project } = get()
    if (!project) return
    const idSet = new Set(ids.filter(id => project.root.id !== id))
    if (idSet.size === 0) return
    // Filtrar IDs cujo ancestral também está na seleção (evitar duplicação dupla)
    const topLevel = [...idSet].filter(id => {
      let parent = findParentOf(project.root, id)
      while (parent) {
        if (idSet.has(parent.id)) return false
        parent = findParentOf(project.root, parent.id)
      }
      return true
    })
    if (topLevel.length === 0) return
    get().pushHistory()
    let newRoot = project.root
    const cloneIds: string[] = []
    for (const id of topLevel) {
      const original = findElementById(newRoot, id)
      if (!original) continue
      const parent = findParentOf(newRoot, id)
      if (!parent) continue
      const clone = cloneSubtree(original, generateId)
      clone.label = `${original.label} (cópia)`
      cloneIds.push(clone.id)
      const siblingIndex = parent.children.findIndex(c => c.id === id)
      newRoot = insertNodeInTree(newRoot, parent.id, clone, siblingIndex + 1)
    }
    const now = new Date().toISOString()
    set({
      project: { ...project, updatedAt: now, root: newRoot },
      selectedElementIds: cloneIds,
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
  selectedElementIds: [],
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  toggleSelectedElement: (id) => {
    const { selectedElementIds } = get()
    if (selectedElementIds.includes(id)) {
      set({ selectedElementIds: selectedElementIds.filter(i => i !== id) })
    } else {
      set({ selectedElementIds: [...selectedElementIds, id] })
    }
  },
  addSelectedElement: (id) => {
    const { selectedElementIds } = get()
    if (!selectedElementIds.includes(id)) {
      set({ selectedElementIds: [...selectedElementIds, id] })
    }
  },

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
  // Modelo: history contém snapshots do passado. O estado ATUAL é sempre `project`.
  // pushHistory salva o estado ANTES da mutação.
  // undo: salva estado atual como futuro, restaura último do passado.
  // redo: salva estado atual como passado, restaura primeiro do futuro.
  history: [],
  future: [],

  pushHistory: () => {
    const { project, history } = get()
    if (!project) return
    const snapshot = structuredClone(project)
    const trimmed = [...history, snapshot]
    if (trimmed.length > MAX_HISTORY) trimmed.shift()
    // Nova ação descarta redo futuro
    set({ history: trimmed, future: [] })
  },

  undo: () => {
    const { history, future, project } = get()
    if (history.length === 0 || !project) return
    const prev = history[history.length - 1]
    set({
      project: structuredClone(prev),
      history: history.slice(0, -1),
      future: [structuredClone(project), ...future],
      isSaved: false,
    })
  },

  redo: () => {
    const { history, future, project } = get()
    if (future.length === 0 || !project) return
    const next = future[0]
    set({
      project: structuredClone(next),
      history: [...history, structuredClone(project)],
      future: future.slice(1),
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
    showGrid: false,
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
