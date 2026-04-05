import { useEffect } from 'react'
import { useAppStore, createEmptyProject } from '@/store'
import { Toolbar } from '@/components/Toolbar'
import { LayersPanel } from '@/panels/layers/LayersPanel'
import { PropertiesPanel } from '@/panels/properties/PropertiesPanel'
import { Canvas } from '@/canvas/Canvas'

function App() {
  const project = useAppStore(s => s.project)
  const setProject = useAppStore(s => s.setProject)

  useEffect(() => {
    if (!project) {
      setProject(createEmptyProject())
    }
  }, [project, setProject])

  if (!project) {
    return (
      <div className="h-screen w-screen bg-editor-bg text-editor-text flex items-center justify-center">
        <p className="text-editor-text-dim">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-editor-bg text-editor-text flex flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LayersPanel />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  )
}

export default App
