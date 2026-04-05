import { useState } from 'react'
import { useAppStore } from '@/store'
import { useSelectedElement } from '@/hooks'
import type { CSSProperties } from '@/types'
import {
  Settings2,
  LayoutGrid,
  Ruler,
  Space,
  Paintbrush,
  Type,
  ChevronDown,
  ChevronRight,
  MousePointerClick,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Tipo genérico de campo ──────────────────────────────
type FieldDef = {
  key: keyof CSSProperties
  label: string
  type?: 'select' | 'combo' | 'color'
  options?: string[]
  compact?: boolean
}

// ─── Opções reutilizáveis ────────────────────────────────
const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Georgia', 'Times New Roman', 'Garamond', 'Courier New',
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Source Sans 3', 'Playfair Display', 'Merriweather',
  'system-ui', 'monospace', 'sans-serif', 'serif', 'cursive',
]

const FONT_SIZES = [
  '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px',
  '24px', '28px', '32px', '36px', '40px', '48px', '56px', '64px', '72px', '96px',
]

const FONT_WEIGHTS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900',
]

const LINE_HEIGHTS = [
  'normal', '1', '1.25', '1.375', '1.5', '1.625', '1.75', '2', '2.5',
]

const LETTER_SPACINGS = [
  'normal', '-0.05em', '-0.025em', '0', '0.025em', '0.05em', '0.1em', '0.2em',
]

const GAP_OPTIONS = [
  '0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px',
]

const RADIUS_OPTIONS = [
  '0', '2px', '4px', '6px', '8px', '12px', '16px', '24px', '9999px',
]

const OPACITY_OPTIONS = [
  '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1',
]

const SPACING_OPTIONS = [
  '0', '2px', '4px', '6px', '8px', '10px', '12px', '16px', '20px', '24px', '32px', '40px', '48px', '64px',
]

// ─── Definições dos campos ───────────────────────────────

const LAYOUT_FIELDS: FieldDef[] = [
  { key: 'display', label: 'Display', type: 'select', options: ['block', 'flex', 'grid', 'inline', 'inline-flex', 'none'] },
  { key: 'flexDirection', label: 'Direction', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
  { key: 'justifyContent', label: 'Justify', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
  { key: 'alignItems', label: 'Align', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
  { key: 'gap', label: 'Gap', type: 'combo', options: GAP_OPTIONS },
  { key: 'position', label: 'Position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed'] },
]

const DIMENSION_FIELDS: FieldDef[] = [
  { key: 'width', label: 'W', compact: true },
  { key: 'height', label: 'H', compact: true },
  { key: 'minWidth', label: 'Min W', compact: true },
  { key: 'minHeight', label: 'Min H', compact: true },
  { key: 'maxWidth', label: 'Max W', compact: true },
  { key: 'maxHeight', label: 'Max H', compact: true },
]

const SPACING_FIELDS: FieldDef[] = [
  { key: 'padding', label: 'Padding', type: 'combo', options: SPACING_OPTIONS },
  { key: 'paddingTop', label: '↑ Top', type: 'combo', options: SPACING_OPTIONS },
  { key: 'paddingRight', label: '→ Right', type: 'combo', options: SPACING_OPTIONS },
  { key: 'paddingBottom', label: '↓ Bottom', type: 'combo', options: SPACING_OPTIONS },
  { key: 'paddingLeft', label: '← Left', type: 'combo', options: SPACING_OPTIONS },
  { key: 'margin', label: 'Margin', type: 'combo', options: SPACING_OPTIONS },
  { key: 'marginTop', label: '↑ Top', type: 'combo', options: SPACING_OPTIONS },
  { key: 'marginRight', label: '→ Right', type: 'combo', options: SPACING_OPTIONS },
  { key: 'marginBottom', label: '↓ Bottom', type: 'combo', options: SPACING_OPTIONS },
  { key: 'marginLeft', label: '← Left', type: 'combo', options: SPACING_OPTIONS },
]

const APPEARANCE_FIELDS: FieldDef[] = [
  { key: 'backgroundColor', label: 'Background', type: 'color' },
  { key: 'color', label: 'Cor texto', type: 'color' },
  { key: 'opacity', label: 'Opacidade', type: 'combo', options: OPACITY_OPTIONS },
  { key: 'border', label: 'Border' },
  { key: 'borderRadius', label: 'Radius', type: 'combo', options: RADIUS_OPTIONS },
  { key: 'boxShadow', label: 'Sombra' },
  { key: 'overflow', label: 'Overflow', type: 'select', options: ['visible', 'hidden', 'scroll', 'auto'] },
]

const TYPOGRAPHY_FIELDS: FieldDef[] = [
  { key: 'fontFamily', label: 'Família', type: 'select', options: FONT_FAMILIES },
  { key: 'fontSize', label: 'Tamanho', type: 'combo', options: FONT_SIZES },
  { key: 'fontWeight', label: 'Peso', type: 'select', options: FONT_WEIGHTS },
  { key: 'lineHeight', label: 'Altura L.', type: 'combo', options: LINE_HEIGHTS },
  { key: 'letterSpacing', label: 'Espaço', type: 'combo', options: LETTER_SPACINGS },
  { key: 'textAlign', label: 'Alinhamento', type: 'select', options: ['left', 'center', 'right', 'justify'] },
  { key: 'textDecoration', label: 'Decoração', type: 'select', options: ['none', 'underline', 'line-through', 'overline'] },
]

export function PropertiesPanel() {
  const element = useSelectedElement()
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const updateElement = useAppStore(s => s.updateElement)

  if (!element) {
    return (
      <div className="w-72 bg-editor-surface border-l border-editor-border flex flex-col items-center justify-center shrink-0 gap-3">
        <MousePointerClick size={32} className="text-editor-text-muted" />
        <p className="text-xs text-editor-text-dim text-center px-6 leading-relaxed">
          Selecione um elemento no canvas para editar suas propriedades
        </p>
      </div>
    )
  }

  function handleStyleChange(key: string, value: string) {
    if (!element) return
    updateElementStyles(element.id, { [key]: value || undefined })
  }

  function handleContentChange(value: string) {
    if (!element) return
    updateElement(element.id, { content: value })
  }

  return (
    <div className="w-72 bg-editor-surface border-l border-editor-border shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-editor-border flex items-center gap-2">
        <Settings2 size={14} className="text-editor-text-dim" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-editor-text-dim uppercase tracking-wider">Propriedades</div>
          <div className="text-[10px] text-editor-text-muted mt-0.5 font-mono truncate">
            &lt;{element.tag}&gt; — {element.label}
          </div>
        </div>
      </div>

      {/* Conteúdo de texto */}
      {element.content !== undefined && (
        <Section title="Conteúdo" icon={Type} defaultOpen>
          <input
            type="text"
            value={element.content ?? ''}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full bg-editor-bg text-editor-text text-xs px-2.5 py-1.5 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors"
            placeholder="Texto do elemento..."
          />
        </Section>
      )}

      <Section title="Layout" icon={LayoutGrid} defaultOpen>
        {LAYOUT_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
        ))}
      </Section>

      <Section title="Dimensões" icon={Ruler} defaultOpen>
        <div className="grid grid-cols-2 gap-1.5">
          {DIMENSION_FIELDS.map(field => (
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
          ))}
        </div>
      </Section>

      <Section title="Espaçamento" icon={Space}>
        {SPACING_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
        ))}
      </Section>

      <Section title="Aparência" icon={Paintbrush} defaultOpen>
        {APPEARANCE_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
        ))}
      </Section>

      <Section title="Tipografia" icon={Type} defaultOpen>
        {TYPOGRAPHY_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
        ))}
      </Section>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-editor-border">
      <button
        className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-editor-surface-alt transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown size={12} className="text-editor-text-dim" />
        ) : (
          <ChevronRight size={12} className="text-editor-text-dim" />
        )}
        <Icon size={13} strokeWidth={1.5} className="text-editor-text-dim" />
        <span className="text-[11px] font-medium text-editor-text-dim uppercase tracking-wider">
          {title}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2.5 flex flex-col gap-1.5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Componente de campo unificado ───────────────────────
// Renderiza select, combo (datalist), color ou text conforme o tipo

let comboIdCounter = 0

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
}) {
  const [listId] = useState(() => `combo-${field.key}-${++comboIdCounter}`)
  const labelClass = field.compact ? 'w-10' : 'w-18'

  // ── Select puro ──
  if (field.type === 'select') {
    return (
      <div className="flex items-center gap-2">
        <label className={`text-[10px] text-editor-text-dim ${labelClass} shrink-0`}>{field.label}</label>
        <div className="relative flex-1 min-w-0">
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors appearance-none cursor-pointer pr-6"
            style={field.key === 'fontFamily' && value ? { fontFamily: value } : undefined}
          >
            <option value="">—</option>
            {field.options!.map(opt => (
              <option key={opt} value={opt} style={field.key === 'fontFamily' ? { fontFamily: opt } : undefined}>
                {field.key === 'fontWeight' ? `${opt} — ${weightLabel(opt)}` : opt}
              </option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-editor-text-dim pointer-events-none" />
        </div>
      </div>
    )
  }

  // ── Combo (input + datalist) — permite digitar OU escolher ──
  if (field.type === 'combo') {
    return (
      <div className="flex items-center gap-2">
        <label className={`text-[10px] text-editor-text-dim ${labelClass} shrink-0`}>{field.label}</label>
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            list={listId}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors truncate pr-5"
            placeholder="—"
          />
          <datalist id={listId}>
            {field.options!.map(opt => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
        </div>
      </div>
    )
  }

  // ── Color picker ──
  if (field.type === 'color') {
    return (
      <div className="flex items-center gap-2">
        <label className={`text-[10px] text-editor-text-dim ${labelClass} shrink-0`}>{field.label}</label>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="relative shrink-0">
            <input
              type="color"
              value={value || '#000000'}
              onChange={e => onChange(e.target.value)}
              className="w-7 h-7 rounded-md border border-editor-border cursor-pointer bg-transparent opacity-0 absolute inset-0"
            />
            <div
              className="w-7 h-7 rounded-md border border-editor-border"
              style={{ backgroundColor: value || '#000000' }}
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors font-mono truncate"
            placeholder="#000000"
          />
        </div>
      </div>
    )
  }

  // ── Input de texto padrão ──
  return (
    <div className="flex items-center gap-2">
      <label className={`text-[10px] text-editor-text-dim ${labelClass} shrink-0`}>{field.label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors truncate"
        placeholder="—"
      />
    </div>
  )
}

function weightLabel(w: string) {
  const map: Record<string, string> = {
    '100': 'Thin', '200': 'Extra Light', '300': 'Light', '400': 'Regular',
    '500': 'Medium', '600': 'Semi Bold', '700': 'Bold', '800': 'Extra Bold', '900': 'Black',
  }
  return map[w] ?? w
}
