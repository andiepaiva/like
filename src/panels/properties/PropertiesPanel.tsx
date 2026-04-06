import { useState, useEffect, useId, useRef } from 'react'
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
  type?: 'select' | 'combo' | 'color' | 'number'
  options?: string[]
  compact?: boolean
  unit?: string    // unidade CSS para campos numéricos (ex: 'px', 'em')
  min?: number     // valor mínimo para scrubbing (default: sem limite)
  step?: number    // step base do scrubbing (default: 1)
}

// ─── Opções reutilizáveis ────────────────────────────────
const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Trebuchet MS',
  'Georgia', 'Times New Roman', 'Garamond', 'Courier New',
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Nunito', 'Raleway', 'Source Sans 3', 'Playfair Display', 'Merriweather',
  'system-ui', 'monospace', 'sans-serif', 'serif', 'cursive',
]

const FONT_WEIGHTS = [
  '100', '200', '300', '400', '500', '600', '700', '800', '900',
]

const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double']

// ─── Definições dos campos ───────────────────────────────

const LAYOUT_FIELDS: FieldDef[] = [
  { key: 'display', label: 'Display', type: 'select', options: ['block', 'flex', 'grid', 'inline', 'inline-flex', 'inline-block', 'none'] },
  { key: 'flexDirection', label: 'Direction', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
  { key: 'flexWrap', label: 'Wrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
  { key: 'justifyContent', label: 'Justify', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
  { key: 'alignItems', label: 'Align', type: 'select', options: ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] },
  { key: 'gap', label: 'Gap', type: 'number', unit: 'px', min: 0 },
  { key: 'position', label: 'Position', type: 'select', options: ['static', 'relative', 'absolute', 'fixed', 'sticky'] },
]

const DIMENSION_FIELDS: FieldDef[] = [
  { key: 'width', label: 'W', type: 'number', unit: 'px', min: 0, compact: true },
  { key: 'height', label: 'H', type: 'number', unit: 'px', min: 0, compact: true },
  { key: 'minWidth', label: 'Min W', type: 'number', unit: 'px', min: 0, compact: true },
  { key: 'minHeight', label: 'Min H', type: 'number', unit: 'px', min: 0, compact: true },
  { key: 'maxWidth', label: 'Max W', type: 'number', unit: 'px', min: 0, compact: true },
  { key: 'maxHeight', label: 'Max H', type: 'number', unit: 'px', min: 0, compact: true },
]

const APPEARANCE_FIELDS: FieldDef[] = [
  { key: 'backgroundColor', label: 'Fundo', type: 'color' },
  { key: 'opacity', label: 'Opacidade', type: 'number', min: 0, step: 0.1 },
  { key: 'borderRadius', label: 'Radius', type: 'number', unit: 'px', min: 0 },
  { key: 'boxShadow', label: 'Sombra' },
  { key: 'overflow', label: 'Overflow', type: 'select', options: ['visible', 'hidden', 'scroll', 'auto'] },
]

const TYPOGRAPHY_FIELDS: FieldDef[] = [
  { key: 'color', label: 'Cor', type: 'color' },
  { key: 'fontFamily', label: 'Família', type: 'select', options: FONT_FAMILIES },
  { key: 'fontSize', label: 'Tamanho', type: 'number', unit: 'px', min: 0 },
  { key: 'fontWeight', label: 'Peso', type: 'select', options: FONT_WEIGHTS },
  { key: 'fontStyle', label: 'Estilo', type: 'select', options: ['normal', 'italic', 'oblique'] },
  { key: 'lineHeight', label: 'Altura L.', type: 'number', step: 0.1, min: 0 },
  { key: 'letterSpacing', label: 'Espaço', type: 'number', unit: 'em', step: 0.01 },
  { key: 'textAlign', label: 'Alinhamento', type: 'select', options: ['left', 'center', 'right', 'justify'] },
  { key: 'verticalAlign', label: 'Alinhar V.', type: 'select', options: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom'] },
  { key: 'textDecoration', label: 'Decoração', type: 'select', options: ['none', 'underline', 'line-through', 'overline'] },
  { key: 'textTransform', label: 'Caixa', type: 'select', options: ['none', 'uppercase', 'lowercase', 'capitalize'] },
  { key: 'whiteSpace', label: 'Quebra', type: 'select', options: ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'] },
  { key: 'textOverflow', label: 'Truncar', type: 'select', options: ['clip', 'ellipsis'] },
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
const LIST_TAGS: Set<string> = new Set(['ul', 'ol', 'li'])
const VOID_TAGS: Set<string> = new Set(['img', 'input', 'br', 'hr'])

function tagHasLayout(tag: string) { return CONTAINER_TAGS.has(tag) || tag === 'button' }
function tagHasTypography(tag: string) { return TEXT_TAGS.has(tag) || INPUT_TAGS.has(tag) || LIST_TAGS.has(tag) }
function tagHasContent(tag: string) { return !VOID_TAGS.has(tag) }

export function PropertiesPanel() {
  const element = useSelectedElement()
  const elements = useSelectedElements()
  const updateElementStyles = useAppStore(s => s.updateElementStyles)
  const updateElementStylesSilent = useAppStore(s => s.updateElementStylesSilent)
  const pushHistory = useAppStore(s => s.pushHistory)
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

  function handleScrubStart() {
    pushHistory()
  }

  function handleScrubMove(key: string, value: string) {
    if (!element) return
    updateElementStylesSilent(element.id, { [key]: value || undefined })
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
          <InlineScrubField label="X" value={element.styles.left ?? ''} unit="px" onChange={v => { if (v) handleStyleChange('position', 'absolute'); handleStyleChange('left', v) }} styleKey="left" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
          <InlineScrubField label="Y" value={element.styles.top ?? ''} unit="px" onChange={v => { if (v) handleStyleChange('position', 'absolute'); handleStyleChange('top', v) }} styleKey="top" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
        </div>
        {/* Linha 3: W, H inline (atalho rápido) */}
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <InlineScrubField label="W" value={element.styles.width ?? ''} unit="px" min={0} onChange={v => handleStyleChange('width', v)} styleKey="width" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
          <InlineScrubField label="H" value={element.styles.height ?? ''} unit="px" min={0} onChange={v => handleStyleChange('height', v)} styleKey="height" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
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
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
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
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
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
              <SpacingInput label="↑" value={element.styles.paddingTop ?? ''} onChange={v => handleStyleChange('paddingTop', v)} styleKey="paddingTop" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="→" value={element.styles.paddingRight ?? ''} onChange={v => handleStyleChange('paddingRight', v)} styleKey="paddingRight" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="↓" value={element.styles.paddingBottom ?? ''} onChange={v => handleStyleChange('paddingBottom', v)} styleKey="paddingBottom" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="←" value={element.styles.paddingLeft ?? ''} onChange={v => handleStyleChange('paddingLeft', v)} styleKey="paddingLeft" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
            </div>
          </div>
          {/* Margin */}
          <div>
            <div className="text-[10px] text-editor-text-dim mb-1 font-medium">Margin</div>
            <div className="grid grid-cols-4 gap-1">
              <SpacingInput label="↑" value={element.styles.marginTop ?? ''} onChange={v => handleStyleChange('marginTop', v)} styleKey="marginTop" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="→" value={element.styles.marginRight ?? ''} onChange={v => handleStyleChange('marginRight', v)} styleKey="marginRight" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="↓" value={element.styles.marginBottom ?? ''} onChange={v => handleStyleChange('marginBottom', v)} styleKey="marginBottom" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
              <SpacingInput label="←" value={element.styles.marginLeft ?? ''} onChange={v => handleStyleChange('marginLeft', v)} styleKey="marginLeft" onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Aparência" icon={Paintbrush} defaultOpen>
        {APPEARANCE_FIELDS.map(field => (
          <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
        ))}
      </Section>

      {/* Border separada com width/style/color */}
      <Section title="Borda" icon={Maximize2}>
        <div className="flex flex-col gap-1.5">
          <Field field={{ key: 'borderWidth', label: 'Espessura', type: 'number', unit: 'px', min: 0 }} value={element.styles.borderWidth ?? ''} onChange={v => handleStyleChange('borderWidth', v)} onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
          <Field field={{ key: 'borderStyle', label: 'Estilo', type: 'select', options: BORDER_STYLES }} value={element.styles.borderStyle ?? ''} onChange={v => handleStyleChange('borderStyle', v)} />
          <Field field={{ key: 'borderColor', label: 'Cor', type: 'color' }} value={element.styles.borderColor ?? ''} onChange={v => handleStyleChange('borderColor', v)} />
        </div>
      </Section>

      {tagHasTypography(tag) && (
        <Section title="Tipografia" icon={Type} defaultOpen>
          {TYPOGRAPHY_FIELDS.map(field => (
            <Field key={field.key} field={field} value={element.styles[field.key] ?? ''} onChange={v => handleStyleChange(field.key, v)} onScrubStart={handleScrubStart} onScrubMove={handleScrubMove} />
          ))}
          {LIST_TAGS.has(tag) && (
            <Field field={{ key: 'listStyleType', label: 'Marcador', type: 'select', options: ['disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman', 'none'] }} value={element.styles.listStyleType ?? ''} onChange={v => handleStyleChange('listStyleType', v)} />
          )}
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

function Field({
  field,
  value,
  onChange,
  onScrubStart,
  onScrubMove,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  onScrubStart?: () => void
  onScrubMove?: (key: string, value: string) => void
}) {
  const listId = useId()
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

  // ── Number field com scrubbing ──
  if (field.type === 'number') {
    return (
      <NumberField
        field={field}
        value={value}
        onChange={onChange}
        onScrubStart={onScrubStart}
        onScrubMove={onScrubMove}
      />
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

// ─── Helpers de parsing numérico ─────────────────────────
function parseNumericValue(raw: string, defaultUnit: string): { num: number; unit: string } {
  if (!raw) return { num: 0, unit: defaultUnit }
  const match = raw.match(/^(-?[\d.]+)\s*(.*)$/)
  if (!match) return { num: 0, unit: defaultUnit }
  return { num: parseFloat(match[1]) || 0, unit: match[2] || defaultUnit }
}

function formatNumericValue(num: number, unit: string, step: number): string {
  // Para steps fracionários, arredondar para evitar floating-point noise
  const decimals = step < 1 ? Math.max(1, -Math.floor(Math.log10(step))) : 0
  const formatted = decimals > 0 ? num.toFixed(decimals) : String(Math.round(num))
  return unit ? `${formatted}${unit}` : formatted
}

// ─── Campo numérico com scrubbing no label ───────────────
function NumberField({
  field,
  value,
  onChange,
  onScrubStart,
  onScrubMove,
}: {
  field: FieldDef
  value: string
  onChange: (v: string) => void
  onScrubStart?: () => void
  onScrubMove?: (key: string, value: string) => void
}) {
  const labelClass = field.compact ? 'w-10' : 'w-20'
  const unit = field.unit ?? ''
  const step = field.step ?? 1
  const scrubRef = useRef<{ startX: number; startVal: number } | null>(null)

  function handleLabelMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const { num } = parseNumericValue(value, unit)
    scrubRef.current = { startX: e.clientX, startVal: num }

    // pushHistory uma única vez antes de iniciar o scrub
    onScrubStart?.()

    function onMove(ev: MouseEvent) {
      if (!scrubRef.current) return
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      let newVal = scrubRef.current.startVal + dx * step * multiplier
      if (field.min !== undefined) newVal = Math.max(field.min, newVal)
      const formatted = formatNumericValue(newVal, unit, step)
      // Silent update durante o scrub
      if (onScrubMove) {
        onScrubMove(field.key, formatted)
      } else {
        onChange(formatted)
      }
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      if (!scrubRef.current) return
      // Commit final com o valor que já foi aplicado via silent
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      let newVal = scrubRef.current.startVal + dx * step * multiplier
      if (field.min !== undefined) newVal = Math.max(field.min, newVal)
      scrubRef.current = null
      // Se não houve movimento, não fazer nada (click no label)
      if (Math.abs(dx) < 2) return
      onChange(formatNumericValue(newVal, unit, step))
    }

    document.body.style.cursor = 'ew-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex items-center gap-2">
      <label
        className={`text-[10px] text-editor-text-dim ${labelClass} shrink-0 cursor-ew-resize select-none`}
        onMouseDown={handleLabelMouseDown}
      >
        {field.label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none transition-colors truncate"
        placeholder={unit ? `0${unit}` : '0'}
      />
    </div>
  )
}

// ─── Campo inline compacto com scrubbing (X, Y, W, H) ───
function InlineScrubField({ label, value, unit, min, onChange, styleKey, onScrubStart, onScrubMove }: {
  label: string; value: string; unit: string; min?: number
  onChange: (v: string) => void; styleKey: string
  onScrubStart?: () => void; onScrubMove?: (key: string, value: string) => void
}) {
  const scrubRef = useRef<{ startX: number; startVal: number } | null>(null)

  function handleLabelMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const { num } = parseNumericValue(value, unit)
    scrubRef.current = { startX: e.clientX, startVal: num }
    onScrubStart?.()

    function onMove(ev: MouseEvent) {
      if (!scrubRef.current) return
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      let newVal = scrubRef.current.startVal + dx * multiplier
      if (min !== undefined) newVal = Math.max(min, newVal)
      const formatted = `${Math.round(newVal)}${unit}`
      if (onScrubMove) {
        onScrubMove(styleKey, formatted)
      } else {
        onChange(formatted)
      }
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      if (!scrubRef.current) return
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      let newVal = scrubRef.current.startVal + dx * multiplier
      if (min !== undefined) newVal = Math.max(min, newVal)
      scrubRef.current = null
      if (Math.abs(dx) < 2) return
      onChange(`${Math.round(newVal)}${unit}`)
    }

    document.body.style.cursor = 'ew-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex items-center gap-1.5">
      <label className="text-[10px] text-editor-text-dim w-4 shrink-0 cursor-ew-resize select-none" onMouseDown={handleLabelMouseDown}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 min-w-0 bg-editor-bg text-editor-text text-[11px] px-2 py-1 rounded-md border border-editor-border focus:border-editor-accent focus:outline-none" placeholder="auto" />
    </div>
  )
}

function SpacingInput({ label, value, onChange, onScrubStart, onScrubMove, styleKey }: {
  label: string; value: string; onChange: (v: string) => void
  onScrubStart?: () => void; onScrubMove?: (key: string, value: string) => void; styleKey?: string
}) {
  const scrubRef = useRef<{ startX: number; startVal: number } | null>(null)

  function handleLabelMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    const { num } = parseNumericValue(value, 'px')
    scrubRef.current = { startX: e.clientX, startVal: num }
    onScrubStart?.()

    function onMove(ev: MouseEvent) {
      if (!scrubRef.current) return
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      const newVal = Math.max(0, scrubRef.current.startVal + dx * multiplier)
      const formatted = `${Math.round(newVal)}px`
      if (onScrubMove && styleKey) {
        onScrubMove(styleKey, formatted)
      } else {
        onChange(formatted)
      }
    }

    function onUp(ev: MouseEvent) {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      if (!scrubRef.current) return
      const dx = ev.clientX - scrubRef.current.startX
      const multiplier = ev.shiftKey ? 10 : 1
      const newVal = Math.max(0, scrubRef.current.startVal + dx * multiplier)
      scrubRef.current = null
      if (Math.abs(dx) < 2) return
      onChange(`${Math.round(newVal)}px`)
    }

    document.body.style.cursor = 'ew-resize'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[9px] text-editor-text-dim mb-0.5 cursor-ew-resize select-none"
        onMouseDown={handleLabelMouseDown}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-editor-bg text-editor-text text-[10px] px-1 py-0.5 rounded border border-editor-border focus:border-editor-accent focus:outline-none text-center"
        placeholder="0"
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
