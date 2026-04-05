import { useEffect, useState, useRef } from 'react'
import { useAppStore, createEmptyProject } from '@/store'
import { MenuBar } from '@/components/MenuBar'
import { Toolbar } from '@/components/Toolbar'
import { LayersPanel } from '@/panels/layers/LayersPanel'
import { PropertiesPanel } from '@/panels/properties/PropertiesPanel'
import { VariablesPanel } from '@/panels/variables/VariablesPanel'
import { Canvas } from '@/canvas/Canvas'
import { loadProject, saveProject } from '@/services/persistence'

function App() {
  const project = useAppStore(s => s.project)
  const setProject = useAppStore(s => s.setProject)
  const markSaved = useAppStore(s => s.markSaved)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  const deleteElements = useAppStore(s => s.deleteElements)
  const [showVariables, setShowVariables] = useState(false)
  const [loading, setLoading] = useState(true)

  // ─── Carregar do IndexedDB na inicialização ────────────────
  useEffect(() => {
    loadProject()
      .then(saved => {
        if (saved) {
          setProject(saved)
          markSaved()
        } else {
          setProject(createEmptyProject())
          markSaved()
        }
      })
      .catch(() => {
        setProject(createEmptyProject())
        markSaved()
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-save debounced ao IndexedDB ──────────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (loading || !project) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveProject(project).then(() => {
        useAppStore.getState().markSaved()
      }).catch(() => {})
    }, 500)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [project, loading])

  // ─── Atalhos de teclado unificados ───
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Delete / Backspace apaga elementos selecionados
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = useAppStore.getState().selectedElementIds
        if (ids.length === 0) return
        e.preventDefault()
        deleteElements(ids)
        return
      }

      // Ctrl+Z / Ctrl+Shift+Z para undo/redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        const { undo, redo } = useAppStore.getState()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteElements])

  if (loading || !project) {
    return (
      <div className="h-screen w-screen bg-editor-bg text-editor-text flex items-center justify-center">
        <p className="text-editor-text-dim">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-editor-bg text-editor-text flex flex-col overflow-hidden">
      <MenuBar onOpenVariables={() => setShowVariables(true)} />
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LayersPanel />
        <Canvas />
        <PropertiesPanel />
      </div>
      {showVariables && <VariablesPanel onClose={() => setShowVariables(false)} />}
    </div>
  )
}

export default App
