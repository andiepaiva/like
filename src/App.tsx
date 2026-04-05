import { useEffect, useState } from 'react'
import { useAppStore, createEmptyProject } from '@/store'
import { MenuBar } from '@/components/MenuBar'
import { Toolbar } from '@/components/Toolbar'
import { LayersPanel } from '@/panels/layers/LayersPanel'
import { PropertiesPanel } from '@/panels/properties/PropertiesPanel'
import { VariablesPanel } from '@/panels/variables/VariablesPanel'
import { Canvas } from '@/canvas/Canvas'

function App() {
  const project = useAppStore(s => s.project)
  const setProject = useAppStore(s => s.setProject)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  const deleteElement = useAppStore(s => s.deleteElement)
  const setSelectedElementIds = useAppStore(s => s.setSelectedElementIds)
  const [showVariables, setShowVariables] = useState(false)

  useEffect(() => {
    if (!project) {
      setProject(createEmptyProject())
    }
  }, [project, setProject])

  // ─── Atalho: Delete / Backspace apaga elementos selecionados ───
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = useAppStore.getState().selectedElementIds
        if (ids.length === 0) return
        e.preventDefault()
        ids.forEach(id => deleteElement(id))
        setSelectedElementIds([])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteElement, setSelectedElementIds])

  if (!project) {
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
