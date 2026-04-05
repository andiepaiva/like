import { useState } from 'react'
import { useAppStore } from '@/store'
import { generateId } from '@/utils'
import type { Token } from '@/types'
import {
  X,
  Plus,
  Maximize2,
  Minimize2,
  Palette,
  Type,
  Ruler,
  Hash,
  Trash2,
  Pencil,
  Check,
} from 'lucide-react'

type TokenCategory = 'colors' | 'typography' | 'spacing' | 'other'

const CATEGORY_META: { key: TokenCategory; label: string; icon: typeof Palette; placeholder: string }[] = [
  { key: 'colors', label: 'Cores', icon: Palette, placeholder: '#3b82f6' },
  { key: 'typography', label: 'Tipografia', icon: Type, placeholder: '16px' },
  { key: 'spacing', label: 'Espaçamento', icon: Ruler, placeholder: '8px' },
  { key: 'other', label: 'Outros', icon: Hash, placeholder: '1px solid #ccc' },
]

export function VariablesPanel({ onClose }: { onClose: () => void }) {
  const project = useAppStore(s => s.project)
  const addToken = useAppStore(s => s.addToken)
  const updateToken = useAppStore(s => s.updateToken)
  const deleteToken = useAppStore(s => s.deleteToken)

  const [activeTab, setActiveTab] = useState<TokenCategory>('colors')
  const [expanded, setExpanded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newDesc, setNewDesc] = useState('')

  if (!project) return null

  const tokens = project.tokens[activeTab]
  const meta = CATEGORY_META.find(c => c.key === activeTab)!

  function handleCreate() {
    if (!newName.trim() || !newValue.trim()) return
    const token: Token = {
      id: generateId(),
      name: newName.trim(),
      value: newValue.trim(),
      description: newDesc.trim() || undefined,
    }
    addToken(activeTab, token)
    setNewName('')
    setNewValue('')
    setNewDesc('')
    setCreating(false)
  }

  function handleUpdate(id: string, changes: Partial<Token>) {
    updateToken(id, changes)
    setEditingId(null)
  }

  return (
    <div className={`fixed ${expanded ? 'inset-4' : 'left-8 top-16 w-[460px] h-[520px]'} bg-editor-surface border border-editor-border rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-editor-accent" />
          <span className="text-sm font-semibold text-editor-text">Variáveis</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(!expanded)} className="w-7 h-7 flex items-center justify-center rounded-md text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt transition-colors">
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Tabs de categoria */}
      <div className="flex border-b border-editor-border">
        {CATEGORY_META.map(cat => {
          const Icon = cat.icon
          const count = project.tokens[cat.key].length
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveTab(cat.key); setCreating(false); setEditingId(null) }}
              className={`flex-1 px-3 py-2 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                activeTab === cat.key
                  ? 'text-editor-accent border-editor-accent'
                  : 'text-editor-text-dim border-transparent hover:text-editor-text hover:bg-editor-surface-alt'
              }`}
            >
              <Icon size={13} strokeWidth={1.5} />
              {cat.label}
              {count > 0 && (
                <span className="text-[9px] bg-editor-accent-dim text-editor-accent px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Lista de tokens */}
      <div className="flex-1 overflow-y-auto p-3">
        {tokens.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <meta.icon size={36} className="text-editor-text-muted" />
            <div>
              <p className="text-sm font-medium text-editor-text">Nenhuma variável criada</p>
              <p className="text-xs text-editor-text-dim mt-1 max-w-[280px]">
                Salve {meta.label.toLowerCase()} para reutilizar em estilos, protótipos e elementos.
              </p>
            </div>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-editor-accent text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus size={13} />
              Criar
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {tokens.map(token => (
              <TokenRow
                key={token.id}
                token={token}
                category={activeTab}
                isEditing={editingId === token.id}
                onEdit={() => setEditingId(token.id)}
                onSave={(changes) => handleUpdate(token.id, changes)}
                onCancel={() => setEditingId(null)}
                onDelete={() => deleteToken(token.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Criar nova variável */}
      {creating ? (
        <div className="border-t border-editor-border p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome (ex: primary-blue)"
              className="flex-1 bg-editor-bg text-editor-text text-[11px] px-2.5 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none"
              autoFocus
            />
            {activeTab === 'colors' ? (
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={newValue || '#3b82f6'}
                  onChange={e => setNewValue(e.target.value)}
                  className="w-8 h-8 rounded-md border border-editor-border cursor-pointer"
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder={meta.placeholder}
                  className="w-24 bg-editor-bg text-editor-text text-[11px] px-2.5 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none font-mono"
                />
              </div>
            ) : (
              <input
                type="text"
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                placeholder={meta.placeholder}
                className="w-32 bg-editor-bg text-editor-text text-[11px] px-2.5 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none font-mono"
              />
            )}
          </div>
          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            className="w-full bg-editor-bg text-editor-text text-[11px] px-2.5 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="text-[11px] text-editor-text-dim px-3 py-1 rounded-md hover:bg-editor-surface-alt transition-colors">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={!newName.trim() || !newValue.trim()} className="text-[11px] bg-editor-accent text-white px-3 py-1 rounded-md hover:opacity-90 disabled:opacity-40 transition-opacity">
              Criar
            </button>
          </div>
        </div>
      ) : tokens.length > 0 && (
        <div className="border-t border-editor-border p-2 flex justify-center">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-[11px] text-editor-accent hover:text-editor-text transition-colors px-3 py-1.5 rounded-md hover:bg-editor-accent-dim"
          >
            <Plus size={13} />
            Nova variável
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Linha de token ──────────────────────────────────────
function TokenRow({
  token,
  category,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  token: Token
  category: TokenCategory
  isEditing: boolean
  onEdit: () => void
  onSave: (changes: Partial<Token>) => void
  onCancel: () => void
  onDelete: () => void
}) {
  const [name, setName] = useState(token.name)
  const [value, setValue] = useState(token.value)

  if (isEditing) {
    return (
      <div className="p-2 rounded-lg bg-editor-bg border border-editor-accent/30 space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 bg-editor-surface text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none"
            autoFocus
          />
          {category === 'colors' ? (
            <div className="flex items-center gap-1">
              <input type="color" value={value || '#000000'} onChange={e => setValue(e.target.value)} className="w-6 h-6 rounded border border-editor-border cursor-pointer" />
              <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-20 bg-editor-surface text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none font-mono" />
            </div>
          ) : (
            <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-28 bg-editor-surface text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none font-mono" />
          )}
        </div>
        <div className="flex justify-end gap-1.5">
          <button onClick={onCancel} className="text-[10px] text-editor-text-dim px-2 py-0.5 rounded hover:bg-editor-surface-alt">Cancelar</button>
          <button onClick={() => onSave({ name, value })} className="text-[10px] bg-editor-accent text-white px-2 py-0.5 rounded hover:opacity-90">
            <Check size={11} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-editor-surface-alt transition-colors">
      {/* Preview da cor */}
      {category === 'colors' && (
        <div className="w-6 h-6 rounded-md border border-editor-border shrink-0" style={{ backgroundColor: token.value }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-editor-text font-medium truncate">{token.name}</div>
        <div className="text-[10px] text-editor-text-dim font-mono truncate">{token.value}</div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="w-6 h-6 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-text hover:bg-editor-bg transition-colors">
          <Pencil size={11} />
        </button>
        <button onClick={onDelete} className="w-6 h-6 flex items-center justify-center rounded text-editor-text-dim hover:text-editor-danger hover:bg-editor-danger/10 transition-colors">
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}
