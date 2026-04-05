import { useState, useEffect } from 'react'
import { useAppStore } from '@/store'
import { useSelectedElement, useSelectedElements } from '@/hooks'
import type { CSSProperties, HtmlTag } from '@/types'
import {
  Settings2,
  LayoutGrid,
  Ruler,
  SeparatorHorizontal,
  Paintbrush,
  Type,
  ChevronDown,
  ChevronRight,
  MousePointerClick,
  Layers,
  Maximize2,
  Tag,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  Move,
  RotateCw,
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

const WIDTH_PRESETS = ['auto', '100%', '50%', 'fit-content']
const HEIGHT_PRESETS = ['auto', '100%', '50%', 'fit-content']

const BORDER_WIDTHS = ['0', '1px', '2px', '3px', '4px']
const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double']

// ─── Definições dos campos ───────────────────────────────

const LAYOUT_FIELDS: FieldDef[] = [
  { key: 'display', label: 'Display', type: 'select', options: ['block', 'flex', 'grid', 'inline', 'inline-flex', 'inline-block', 'none'] },
  { key: 'flexDirection', label: 'Direction', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
  { key: 'flexWrap', label: 'Wrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
  { key: 'justifyContent', label: 'Justify', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
  { key: 'alignItems', label: 'Align', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
  { key: 'gap', label: 'Gap', type: 'combo', options: GAP_OPTIONS },
  { key: 'position', label: 'Position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
]

const DIMENSION_FIELDS: FieldDef[] = [
  { key: 'width', label: 'W', type: 'combo', options: WIDTH_PRESETS, compact: true },
  { key: 'height', label: 'H', type: 'combo', options: HEIGHT_PRESETS, compact: true },
  { key: 'minWidth', label: 'Min W', compact: true },
  { key: 'minHeight', label: 'Min H', compact: true },
  { key: 'maxWidth', label: 'Max W', compact: true },
  { key: 'maxHeight', label: 'Max H', compact: true },
]

const APPEARANCE_FIELDS: FieldDef[] = [
  { key: 'backgroundColor', label: 'Fundo', type: 'color' },
  { key: 'opacity', label: 'Opacidade', type: 'combo', options: OPACITY_OPTIONS },
  { key: 'borderRadius', label: 'Radius', type: 'combo', options: RADIUS_OPTIONS },
  { key: 'boxShadow', label: 'Sombra' },
  { key: 'overflow', label: 'Overflow', type: 'select', options: ['visible', 'hidden', 'scroll', 'auto'] },
]

const TYPOGRAPHY_FIELDS: FieldDef[] = [
  { key: 'color', label: 'Cor', type: 'color' },
  { key: 'fontFamily', label: 'Família', type: 'select', options: FONT_FAMILIES },
  { key: 'fontSize', label: 'Tamanho', type: 'combo', options: FONT_SIZES },
  { key: 'fontWeight', label: 'Peso', type: 'select', options: FONT_WEIGHTS },
  { key: 'lineHeight', label: 'Altura L.', type: 'combo', options: LINE_HEIGHTS },
  { key: 'letterSpacing', label: 'Espaço', type: 'combo', options: LETTER_SPACINGS },
  { key: 'textAlign', label: 'Alinhamento', type: 'select', options: ['left', 'center', 'right', 'justify'] },
  { key: 'textDecoration', label: 'Decoração', type: 'select', options: ['none', 'underline', 'line-through', 'overline'] },
]

// ─── Tags que suportam cada seção ────────────────────────
const CONTAINER_TAGS: Set<string> = new Set([
  'div', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside',
  'figure', 'ul', 'ol', 'li',
])

const TEXT_TAGS: Set<string> = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'label', 'strong', 'em',
  'button', 'a', 'li',
])

const INPUT_TAGS: Set<string> = new Set(['input', 'textarea', 'select'])
const VOID_TAGS: Set<string> = new Set(['img', 'input', 'br', 'hr'])

function tagHasLayout(tag: string) { return CONTAINER_TAGS.has(tag) || tag === 'button' }
function tagHasTypography(tag: string) { return TEXT_TAGS.has(tag) || INPUT_TAGS.has(tag) }
function tagHasContent(tag: string) { return !VOID_TAGS.has(tag) }

export function PropertiesPanel() {
  const element = useSelectedElement()
  const elements = useSelectedElements()
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const updateElement = useAppStore(s => s.updateElement)
  const renameElement = useAppStore(s => s.renameElement)

  if (elements.length === 0) {
    return (
      <div className="w-72 bg-editor-surface border-l border-editor-border flex flex-col items-center justify-center shrink-0 gap-3">
        <MousePointerClick size={32} className="text-editor-text-muted" />
        <p className="text-xs text-editor-text-dim text-center px-6 leading-relaxed">
          Selecione um elemento no canvas para editar suas propriedades
        </p>
      </div>
    )
  }

  if (elements.length > 1) {
    return (
      <div className="w-72 bg-editor-surface border-l border-editor-border flex flex-col items-center justify-center shrink-0 gap-3">
        <Layers size={32} className="text-editor-text-muted" />
        <p className="text-xs text-editor-text-dim text-center px-6 leading-relaxed">
          {elements.length} elementos selecionados
        </p>
      </div>
    )
  }

  if (!element) return null
  const tag = element.tag

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
      {/* Header com nome editável e classe CSS */}
      <div className="px-3 py-2.5 border-b border-editor-border space-y-2">
        <div className="flex items-center gap-2">
          <Settings2 size={14} className="text-editor-text-dim shrink-0" />
          <div className="text-xs font-semibold text-editor-text-dim uppercase tracking-wider">Propriedades</div>
        </div>
        {/* Nome do elemento */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-editor-text-dim w-12 shrink-0">Nome</label>
          <EditableName elementId={element.id} label={element.label} tag={element.tag} onRename={renameElement} />
        </div>
        {/* Classe CSS */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-editor-text-dim w-12 shrink-0">Classe</label>
          <input
            type="text"
            value={element.className?.join(' ') ?? ''}
            onChange={e => {
              const raw = e.target.value
              const classes = raw ? raw.split(/\s+/).filter(Boolean) : []
              updateElement(element.id, { className: classes.length > 0 ? classes : undefined })
            }}
            className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors font-mono truncate"
            placeholder="ex: container hero-section"
          />
        </div>
        <div className="text-[10px] text-editor-text-muted font-mono truncate">
          &lt;{element.tag}&gt;{element.className?.length ? ` .${element.className.join('.')}` : ''}
        </div>
      </div>

      {/* ─── Alinhamento (estilo Figma) ─── */}
      <Section title="Alinhamento" icon={Move} defaultOpen>
        {/* Linha 1: Alinhar horizontal (margin-left/right auto) */}
        <div className="flex items-center gap-0.5">
          <AlignButton icon={AlignHorizontalJustifyStart} tooltip="Alinhar à esquerda" onClick={() => updateElementStyles(element.id, { marginLeft: '0', marginRight: 'auto' })} active={element.styles.marginLeft === '0' && element.styles.marginRight === 'auto'} />
          <AlignButton icon={AlignHorizontalJustifyCenter} tooltip="Centralizar horizontal" onClick={() => updateElementStyles(element.id, { marginLeft: 'auto', marginRight: 'auto' })} active={element.styles.marginLeft === 'auto' && element.styles.marginRight === 'auto'} />
          <AlignButton icon={AlignHorizontalJustifyEnd} tooltip="Alinhar à direita" onClick={() => updateElementStyles(element.id, { marginLeft: 'auto', marginRight: '0' })} active={element.styles.marginLeft === 'auto' && element.styles.marginRight === '0'} />
          <div className="w-px h-5 bg-editor-border mx-1" />
          <AlignButton icon={AlignVerticalJustifyStart} tooltip="Alinhar ao topo" onClick={() => updateElementStyles(element.id, { marginTop: '0', marginBottom: 'auto' })} active={element.styles.marginTop === '0' && element.styles.marginBottom === 'auto'} />
          <AlignButton icon={AlignVerticalJustifyCenter} tooltip="Centralizar vertical" onClick={() => updateElementStyles(element.id, { marginTop: 'auto', marginBottom: 'auto' })} active={element.styles.marginTop === 'auto' && element.styles.marginBottom === 'auto'} />
          <AlignButton icon={AlignVerticalJustifyEnd} tooltip="Alinhar à base" onClick={() => updateElementStyles(element.id, { marginTop: 'auto', marginBottom: '0' })} active={element.styles.marginTop === 'auto' && element.styles.marginBottom === '0'} />
        </div>
        {/* Linha 2: X, Y (posição absoluta) */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-editor-text-dim w-4 shrink-0">X</label>
            <input type="text" value={element.styles.left ?? ''} onChange={e => { if (e.target.value) handleStyleChange('position', 'absolute'); handleStyleChange('left', e.target.value) }} className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="auto" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-editor-text-dim w-4 shrink-0">Y</label>
            <input type="text" value={element.styles.top ?? ''} onChange={e => { if (e.target.value) handleStyleChange('position', 'absolute'); handleStyleChange('top', e.target.value) }} className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="auto" />
          </div>
        </div>
        {/* Linha 3: W, H inline (atalho rápido) */}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-editor-text-dim w-4 shrink-0">W</label>
            <input type="text" value={element.styles.width ?? ''} onChange={e => handleStyleChange('width', e.target.value)} className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="auto" />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-[10px] text-editor-text-dim w-4 shrink-0">H</label>
            <input type="text" value={element.styles.height ?? ''} onChange={e => handleStyleChange('height', e.target.value)} className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="auto" />
          </div>
        </div>
        {/* Linha 4: Rotação */}
        <div className="flex items-center gap-1.5 mt-1">
          <RotateCw size={12} className="text-editor-text-dim shrink-0" />
          <input type="text" value={extractRotation(element.styles.transform)} onChange={e => handleStyleChange('transform', composeRotation(element.styles.transform, e.target.value))} className="w-16 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="0" />
          <span className="text-[10px] text-editor-text-dim">deg</span>
        </div>
      </Section>

      {/* Conteúdo de texto */}
      {tagHasContent(tag) && element.content !== undefined && (
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

      {tagHasLayout(tag) && (
        <Section title="Layout" icon={LayoutGrid} defaultOpen>
          {LAYOUT_FIELDS.map(field => (
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
          ))}
        </Section>
      )}

      <Section title="Dimensões" icon={Ruler} defaultOpen>
        {/* Botões de preset rápido */}
        <div className="flex gap-1 mb-1.5">
          {['100%', 'auto', 'fit-content'].map(preset => (
            <button
              key={preset}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                element.styles.width === preset
                  ? 'bg-editor-accent text-white border-editor-accent'
                  : 'bg-editor-bg text-editor-text-dim border-editor-border hover:border-editor-accent'
              }`}
              onClick={() => handleStyleChange('width', preset)}
            >
              {preset === '100%' ? 'Largura total' : preset}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {DIMENSION_FIELDS.map(field => (
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
          ))}
        </div>
      </Section>

      {/* Espaçamento compacto */}
      <Section title="Espaçamento" icon={SeparatorHorizontal}>
        <div className="space-y-2">
          {/* Padding */}
          <div>
            <div className="text-[10px] text-editor-text-dim mb-1 font-medium">Padding</div>
            <div className="grid grid-cols-4 gap-1">
              <SpacingInput label="↑" value={element.styles.paddingTop ?? ''} onChange={v => handleStyleChange('paddingTop', v)} />
              <SpacingInput label="→" value={element.styles.paddingRight ?? ''} onChange={v => handleStyleChange('paddingRight', v)} />
              <SpacingInput label="↓" value={element.styles.paddingBottom ?? ''} onChange={v => handleStyleChange('paddingBottom', v)} />
              <SpacingInput label="←" value={element.styles.paddingLeft ?? ''} onChange={v => handleStyleChange('paddingLeft', v)} />
            </div>
          </div>
          {/* Margin */}
          <div>
            <div className="text-[10px] text-editor-text-dim mb-1 font-medium">Margin</div>
            <div className="grid grid-cols-4 gap-1">
              <SpacingInput label="↑" value={element.styles.marginTop ?? ''} onChange={v => handleStyleChange('marginTop', v)} />
              <SpacingInput label="→" value={element.styles.marginRight ?? ''} onChange={v => handleStyleChange('marginRight', v)} />
              <SpacingInput label="↓" value={element.styles.marginBottom ?? ''} onChange={v => handleStyleChange('marginBottom', v)} />
              <SpacingInput label="←" value={element.styles.marginLeft ?? ''} onChange={v => handleStyleChange('marginLeft', v)} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Aparência" icon={Paintbrush} defaultOpen>
        {APPEARANCE_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
        ))}
      </Section>

      {/* Border separada com width/style/color */}
      <Section title="Borda" icon={Maximize2}>
        <div className="flex flex-col gap-1.5">
          <Field field={{ key: 'borderWidth', label: 'Espessura', type: 'combo', options: BORDER_WIDTHS }} value={element.styles.borderWidth ?? ''} onChange={v => handleStyleChange('borderWidth', v)} />
          <Field field={{ key: 'borderStyle', label: 'Estilo', type: 'select', options: BORDER_STYLES }} value={element.styles.borderStyle ?? ''} onChange={v => handleStyleChange('borderStyle', v)} />
          <Field field={{ key: 'borderColor', label: 'Cor', type: 'color' }} value={element.styles.borderColor ?? ''} onChange={v => handleStyleChange('borderColor', v)} />
        </div>
      </Section>

      {tagHasTypography(tag) && (
        <Section title="Tipografia" icon={Type} defaultOpen>
          {TYPOGRAPHY_FIELDS.map(field => (
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} />
          ))}
        </Section>
      )}
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
  const labelClass = field.compact ? 'w-10' : 'w-20'

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
            <option value=""></option>
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
            placeholder=""
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
        placeholder=""
      />
    </div>
  )
}

function SpacingInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [listId] = useState(() => `sp-${label}-${++comboIdCounter}`)
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-editor-text-dim mb-0.5">{label}</span>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-editor-bg text-editor-text text-[10px] px-1 py-0.5 rounded border border-editor-border focus:border-editor-accent focus:outline-none text-center"
        placeholder="0"
      />
      <datalist id={listId}>
        {SPACING_OPTIONS.map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
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

function AlignButton({ icon: Icon, tooltip, onClick, active }: { icon: LucideIcon; tooltip: string; onClick: () => void; active: boolean }) {
  return (
    <button
      title={tooltip}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-editor-accent-dim text-editor-accent'
          : 'text-editor-text-dim hover:text-editor-text hover:bg-editor-surface-alt'
      }`}
    >
      <Icon size={14} strokeWidth={1.5} />
    </button>
  )
}

function extractRotation(transform?: string): string {
  if (!transform) return '0'
  const match = transform.match(/rotate\(([^)]+)\)/)
  if (!match) return '0'
  return match[1].replace('deg', '')
}

function composeRotation(existingTransform: string | undefined, degrees: string): string {
  const withoutRotate = (existingTransform || '').replace(/\s*rotate\([^)]*\)/, '').trim()
  if (!degrees || degrees === '0') return withoutRotate
  const rotateStr = `rotate(${degrees}deg)`
  return withoutRotate ? `${withoutRotate} ${rotateStr}` : rotateStr
}

function EditableName({ elementId, label, tag, onRename }: { elementId: string; label: string; tag: string; onRename: (id: string, name: string) => void }) {
  const [local, setLocal] = useState(label)
  useEffect(() => { setLocal(label) }, [elementId, label])
  return (
    <input
      type="text"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== label) onRename(elementId, local) }}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
      className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors truncate"
      placeholder={tag}
    />
  )
}
