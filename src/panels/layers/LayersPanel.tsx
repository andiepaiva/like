import { useState } from 'react'
import { useAppStore } from '@/store'
import type { ElementNode, HtmlTag } from '@/types'
import {
  Square,
  LayoutPanelTop,
  Type,
  Heading1,
  RectangleHorizontal,
  Image,
  Link as LinkIcon,
  List,
  TextCursorInput,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const TAG_ICONS: Partial<Record<HtmlTag, LucideIcon>> = {
  div: Square,
  section: LayoutPanelTop,
  article: LayoutPanelTop,
  p: Type,
  span: Type,
  label: Type,
  h1: Heading1,
  h2: Heading1,
  h3: Heading1,
  h4: Heading1,
  h5: Heading1,
  h6: Heading1,
  button: RectangleHorizontal,
  img: Image,
  a: LinkIcon,
  ul: List,
  ol: List,
  li: List,
  input: TextCursorInput,
  textarea: TextCursorInput,
  select: TextCursorInput,
}

export function LayersPanel() {
  const root = useAppStore(s => s.project?.root)

  if (!root) return null

  return (
    <div className="w-60 bg-editor-surface border-r border-editor-border flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-2.5 border-b border-editor-border flex items-center gap-2">
        <Layers size={14} className="text-editor-text-dim" />
        <span className="text-xs font-semibold text-editor-text-dim uppercase tracking-wider">Layers</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        <LayerNode node={root} depth={0} />
      </div>
    </div>
  )
}

function LayerNode({ node, depth }: { node: ElementNode; depth: number }) {
  const selectedElementId = useAppStore(s => s.selectedElementId)
  const setSelectedElementId = useAppStore(s => s.setSelectedElementId)
  const deleteElement = useAppStore(s => s.deleteElement)
  const duplicateElement = useAppStore(s => s.duplicateElement)
  const updateElement = useAppStore(s => s.updateElement)
  const isSelected = selectedElementId === node.id
  const isRoot = depth === 0
  const [collapsed, setCollapsed] = useState(false)
  const hasChildren = node.children.length > 0

  const Icon = TAG_ICONS[node.tag] || Square

  return (
    <div>
      <div
        className={`
          flex items-center gap-1 pr-2 cursor-pointer text-[11px] transition-colors group h-7
          ${isSelected
            ? 'bg-editor-accent-dim text-editor-accent'
            : 'text-editor-text hover:bg-editor-surface-alt'
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setSelectedElementId(node.id)}
      >
        {/* Chevron de collapse */}
        {hasChildren ? (
          <button
            className="w-4 h-4 flex items-center justify-center shrink-0 text-editor-text-dim hover:text-editor-text"
            onClick={(e) => {
              e.stopPropagation()
              setCollapsed(!collapsed)
            }}
          >
            {collapsed
              ? <ChevronRight size={12} />
              : <ChevronDown size={12} />
            }
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Ícone da tag */}
        <Icon
          size={13}
          strokeWidth={1.5}
          className={`shrink-0 ${isSelected ? 'text-editor-accent' : 'text-editor-text-dim'}`}
        />

        {/* Label */}
        <span className="truncate flex-1 ml-0.5">{node.label}</span>

        {/* Indicadores de estado */}
        {!node.visible && (
          <EyeOff size={11} className="text-editor-text-muted shrink-0" />
        )}
        {node.locked && (
          <Lock size={11} className="text-editor-text-muted shrink-0" />
        )}

        {/* Ações ao hover */}
        {!isRoot && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-text hover:bg-editor-border/50"
              title={node.visible ? 'Ocultar' : 'Mostrar'}
              onClick={(e) => {
                e.stopPropagation()
                updateElement(node.id, { visible: !node.visible })
              }}
            >
              {node.visible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-text hover:bg-editor-border/50"
              title={node.locked ? 'Desbloquear' : 'Bloquear'}
              onClick={(e) => {
                e.stopPropagation()
                updateElement(node.id, { locked: !node.locked })
              }}
            >
              {node.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-accent hover:bg-editor-border/50"
              title="Duplicar"
              onClick={(e) => {
                e.stopPropagation()
                duplicateElement(node.id)
              }}
            >
              <Copy size={11} />
            </button>
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-danger hover:bg-editor-danger/10"
              title="Deletar"
              onClick={(e) => {
                e.stopPropagation()
                deleteElement(node.id)
              }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Filhos */}
      {!collapsed && node.children.map(child => (
        <LayerNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}
