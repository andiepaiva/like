import { useState, useRef, useEffect } from 'react'
import { useAppStore, createEmptyProject } from '@/store'
import {
  FileText,
  Pencil,
  Settings,
  Plus,
  Save,
  Download,
  FolderOpen,
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Sun,
  Moon,
  Grid3X3,
  Maximize,
  Variable,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Tipos do menu ───────────────────────────────────────
type MenuItemDef =
  | { type: 'action'; label: string; icon?: LucideIcon; shortcut?: string; onClick: () => void; disabled?: boolean; danger?: boolean }
  | { type: 'separator' }

type MenuDef = {
  label: string
  icon: LucideIcon
  items: MenuItemDef[]
}

export function MenuBar({ onOpenVariables }: { onOpenVariables?: () => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const project = useAppStore(s => s.project)
  const setProject = useAppStore(s => s.setProject)
  const undo = useAppStore(s => s.undo)
  const redo = useAppStore(s => s.redo)
  const deleteElement = useAppStore(s => s.deleteElement)
  const duplicateElement = useAppStore(s => s.duplicateElement)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  const canvasSettings = useAppStore(s => s.canvasSettings)
  const updateCanvasSettings = useAppStore(s => s.updateCanvasSettings)

  const hasSelection = selectedElementIds.length > 0

  // Fechar ao clicar fora
  useEffect(() => {
    if (!openMenu) return
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [openMenu])

  function handleZoomToFit() {
    const artboardW = project?.canvas?.width ?? 1440
    const artboardH = project?.canvas?.height ?? 900
    const viewW = window.innerWidth - 288 * 2
    const viewH = window.innerHeight - 48 - 28 // toolbar + menubar
    const zoom = Math.min(viewW / artboardW, viewH / artboardH) * 0.9
    const clamped = Math.min(3, Math.max(0.25, Math.round(zoom * 100) / 100))
    updateCanvasSettings({ zoom: clamped, offsetX: 0, offsetY: 0 })
    setOpenMenu(null)
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('light')
    setOpenMenu(null)
  }

  const menus: MenuDef[] = [
    {
      label: 'Arquivo',
      icon: FileText,
      items: [
        { type: 'action', label: 'Novo projeto', icon: Plus, shortcut: 'Ctrl+N', onClick: () => { setProject(createEmptyProject()); setOpenMenu(null) } },
        { type: 'action', label: 'Abrir...', icon: FolderOpen, shortcut: 'Ctrl+O', onClick: () => setOpenMenu(null), disabled: true },
        { type: 'separator' },
        { type: 'action', label: 'Salvar', icon: Save, shortcut: 'Ctrl+S', onClick: () => setOpenMenu(null), disabled: true },
        { type: 'action', label: 'Exportar HTML', icon: Download, shortcut: 'Ctrl+Shift+E', onClick: () => setOpenMenu(null), disabled: true },
      ],
    },
    {
      label: 'Editar',
      icon: Pencil,
      items: [
        { type: 'action', label: 'Desfazer', icon: Undo2, shortcut: 'Ctrl+Z', onClick: () => { undo(); setOpenMenu(null) } },
        { type: 'action', label: 'Refazer', icon: Redo2, shortcut: 'Ctrl+Shift+Z', onClick: () => { redo(); setOpenMenu(null) } },
        { type: 'separator' },
        { type: 'action', label: 'Duplicar', icon: Copy, shortcut: 'Ctrl+D', disabled: !hasSelection, onClick: () => { selectedElementIds.forEach(id => duplicateElement(id)); setOpenMenu(null) } },
        { type: 'action', label: 'Excluir', icon: Trash2, shortcut: 'Del', disabled: !hasSelection, danger: true, onClick: () => { selectedElementIds.forEach(id => deleteElement(id)); setOpenMenu(null) } },
      ],
    },
    {
      label: 'Exibir',
      icon: Settings,
      items: [
        { type: 'action', label: canvasSettings.showGrid ? 'Ocultar grid' : 'Mostrar grid', icon: Grid3X3, onClick: () => { updateCanvasSettings({ showGrid: !canvasSettings.showGrid }); setOpenMenu(null) } },
        { type: 'action', label: 'Ajustar à tela', icon: Maximize, onClick: handleZoomToFit },
        { type: 'separator' },
        { type: 'action', label: 'Variáveis', icon: Variable, onClick: () => { onOpenVariables?.(); setOpenMenu(null) } },
        { type: 'separator' },
        { type: 'action', label: 'Alternar tema claro/escuro', icon: document.documentElement.classList.contains('light') ? Moon : Sun, onClick: toggleTheme },
      ],
    },
  ]

  return (
    <div ref={barRef} className="h-7 bg-editor-surface border-b border-editor-border flex items-center px-1 gap-0.5 shrink-0 relative z-50">
      {menus.map(menu => (
        <div key={menu.label} className="relative">
          <button
            className={`
              h-6 px-2.5 flex items-center gap-1.5 rounded text-[11px] transition-colors
              ${openMenu === menu.label
                ? 'bg-editor-accent-dim text-editor-accent'
                : 'text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt'
              }
            `}
            onMouseDown={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
            onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
          >
            {menu.label}
          </button>

          {openMenu === menu.label && (
            <div className="absolute top-full left-0 mt-0.5 bg-editor-surface border border-editor-border rounded-lg shadow-xl py-1 min-w-[220px] z-50">
              {menu.items.map((item, idx) => {
                if (item.type === 'separator') {
                  return <div key={idx} className="h-px bg-editor-border my-1 mx-2" />
                }
                const Icon = item.icon
                return (
                  <button
                    key={idx}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    className={`
                      w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-[11px] transition-colors
                      ${item.disabled
                        ? 'text-editor-text-muted cursor-not-allowed'
                        : item.danger
                          ? 'text-editor-text-dim hover:text-editor-danger hover:bg-editor-danger/10'
                          : 'text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt'
                      }
                    `}
                  >
                    {Icon && <Icon size={13} strokeWidth={1.5} className="shrink-0" />}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[10px] text-editor-text-muted font-mono">{item.shortcut}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
