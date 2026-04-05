import { useAppStore } from '@/store'
import type { HtmlTag } from '@/types'
import { generateId } from '@/utils'
import { calculateZoomToFit } from '@/utils/zoom'
import type { ElementNode } from '@/types'
import {
  MousePointer2,
  Square,
  LayoutPanelTop,
  Type,
  Heading1,
  RectangleHorizontal,
  Image,
  Link,
  List,
  TextCursorInput,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Download,
  Minus,
  Copy,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const INSERT_BUTTONS: { tag: HtmlTag; label: string; icon: LucideIcon }[] = [
  { tag: 'div', label: 'Div', icon: Square },
  { tag: 'section', label: 'Section', icon: LayoutPanelTop },
  { tag: 'p', label: 'Texto', icon: Type },
  { tag: 'h1', label: 'Título', icon: Heading1 },
  { tag: 'button', label: 'Botão', icon: RectangleHorizontal },
  { tag: 'img', label: 'Imagem', icon: Image },
  { tag: 'a', label: 'Link', icon: Link },
  { tag: 'ul', label: 'Lista', icon: List },
  { tag: 'input', label: 'Input', icon: TextCursorInput },
]

function getDefaults(tag: HtmlTag): Partial<ElementNode> {
  const now = new Date().toISOString()
  const base = {
    meta: { createdAt: now, updatedAt: now },
  }

  switch (tag) {
    case 'div':
    case 'section':
    case 'article':
      return { ...base, styles: { width: '200px', height: '100px', display: 'flex' } }
    case 'p':
    case 'span':
    case 'label':
      return { ...base, content: 'Texto', styles: {} }
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return { ...base, content: 'Título', styles: { fontSize: '32px', fontWeight: '700' } }
    case 'button':
      return { ...base, content: 'Botão', styles: { padding: '8px 16px' } }
    case 'img':
      return { ...base, styles: { width: '200px', height: '150px', backgroundColor: '#e5e7eb' } }
    case 'a':
      return { ...base, content: 'Link', styles: { color: '#3b82f6', textDecoration: 'underline' }, attributes: { href: '#' } }
    case 'ul':
    case 'ol':
      return { ...base, styles: {} }
    case 'input':
      return { ...base, styles: { padding: '8px', border: '1px solid #d1d5db' }, attributes: { type: 'text', placeholder: 'Digite...' } }
    default:
      return { ...base, styles: {} }
  }
}

export function Toolbar() {
  const project = useAppStore(s => s.project)
  const isSaved = useAppStore(s => s.isSaved)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  const insertElement = useAppStore(s => s.insertElement)
  const setSelectedElementIds = useAppStore(s => s.setSelectedElementIds)
  const canvasSettings = useAppStore(s => s.canvasSettings)
  const updateCanvasSettings = useAppStore(s => s.updateCanvasSettings)
  const undo = useAppStore(s => s.undo)
  const redo = useAppStore(s => s.redo)
  const deleteElement = useAppStore(s => s.deleteElement)
  const duplicateElement = useAppStore(s => s.duplicateElement)

  const selectedElementId = selectedElementIds[0] ?? null
  const hasSelection = selectedElementIds.length > 0

  function handleInsert(tag: HtmlTag) {
    if (!project) return
    const parentId = selectedElementId || project.root.id
    const defaults = getDefaults(tag)
    const now = new Date().toISOString()

    const element: ElementNode = {
      id: generateId(),
      tag,
      label: tag,
      styles: {},
      attributes: {},
      children: [],
      visible: true,
      locked: false,
      meta: { createdAt: now, updatedAt: now },
      ...defaults,
    }

    insertElement(parentId, element)
    setSelectedElementIds([element.id])
  }

  function handleZoom(delta: number) {
    const newZoom = Math.min(3, Math.max(0.25, canvasSettings.zoom + delta))
    updateCanvasSettings({ zoom: Math.round(newZoom * 100) / 100 })
  }

  function handleZoomToFit() {
    const artboardW = project?.canvas?.width ?? 1440
    const artboardH = project?.canvas?.height ?? 900
    const panelW = 288
    const toolbarH = 48 + 28 // toolbar + menubar
    const viewW = window.innerWidth - panelW * 2
    const viewH = window.innerHeight - toolbarH
    const result = calculateZoomToFit(artboardW, artboardH, viewW, viewH)
    updateCanvasSettings(result)
  }

  return (
    <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-2 gap-1 shrink-0">
      {/* Logo / Nome */}
      <div className="flex items-center gap-2 px-2 mr-1">
        <div className="w-6 h-6 rounded-md bg-editor-accent flex items-center justify-center">
          <span className="text-[10px] font-bold text-editor-bg">DtC</span>
        </div>
        <span className="text-sm font-medium text-editor-text hidden sm:inline">
          {project?.name ?? 'Editor'}
        </span>
      </div>

      <Divider />

      {/* Undo / Redo */}
      <ToolbarButton icon={Undo2} tooltip="Desfazer (Ctrl+Z)" onClick={undo} />
      <ToolbarButton icon={Redo2} tooltip="Refazer (Ctrl+Shift+Z)" onClick={redo} />

      <Divider />

      {/* Cursor */}
      <ToolbarButton icon={MousePointer2} tooltip="Selecionar" active />

      <Divider />

      {/* Insert buttons */}
      {INSERT_BUTTONS.map(({ tag, label, icon }) => (
        <ToolbarButton
          key={tag}
          icon={icon}
          tooltip={label}
          onClick={() => handleInsert(tag)}
        />
      ))}

      <Divider />

      {/* Ações do elemento selecionado */}
      <ToolbarButton
        icon={Copy}
        tooltip="Duplicar (Ctrl+D)"
        onClick={() => selectedElementIds.forEach(id => duplicateElement(id))}
        disabled={!hasSelection}
      />
      <ToolbarButton
        icon={Trash2}
        tooltip="Deletar (Del)"
        onClick={() => selectedElementIds.forEach(id => deleteElement(id))}
        disabled={!hasSelection}
        danger
      />

      <div className="flex-1" />

      {/* Zoom */}
      <ToolbarButton icon={ZoomOut} tooltip="Zoom -" onClick={() => handleZoom(-0.1)} />
      <span className="text-[11px] font-mono text-editor-text-dim w-10 text-center tabular-nums">
        {Math.round(canvasSettings.zoom * 100)}%
      </span>
      <ToolbarButton icon={ZoomIn} tooltip="Zoom +" onClick={() => handleZoom(0.1)} />
      <ToolbarButton icon={Maximize} tooltip="Ajustar à tela" onClick={handleZoomToFit} />

      <Divider />

      {/* Save / Export */}
      <ToolbarButton icon={Save} tooltip="Salvar (Ctrl+S)" />
      <ToolbarButton icon={Download} tooltip="Exportar HTML" />

      {/* Status */}
      <div className="flex items-center gap-1.5 ml-2 px-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-editor-success' : 'bg-amber-400'}`} />
        <span className="text-[10px] text-editor-text-dim">
          {isSaved ? 'Salvo' : 'Modificado'}
        </span>
      </div>
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  onClick,
  active,
  disabled,
  danger,
}: {
  icon: LucideIcon
  tooltip: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150
        ${active
          ? 'bg-editor-accent-dim text-editor-accent'
          : danger
            ? 'text-editor-text-dim hover:text-editor-danger hover:bg-editor-danger/10'
            : disabled
              ? 'text-editor-text-muted cursor-not-allowed'
              : 'text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt'
        }
      `}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-editor-border mx-1" />
}
