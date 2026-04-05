import type { ElementNode, HtmlTag, CSSProperties } from '@/types'
import { generateId } from './id'

// ─── CSS camelCase ↔ kebab-case ──────────────────────────────────

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)
}

function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

// ─── Tags HTML válidas no editor ─────────────────────────────────

const VALID_TAGS = new Set<string>([
  'div', 'section', 'article', 'nav', 'header', 'footer', 'main', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'label', 'strong', 'em',
  'button', 'a', 'input', 'textarea', 'select',
  'img', 'figure', 'figcaption',
  'ul', 'ol', 'li',
])

const VOID_TAGS = new Set(['img', 'input'])

const TEXT_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'span', 'label', 'strong', 'em', 'button', 'a',
])

// ─── Serializar: ElementNode → HTML string ───────────────────────

export function serializeHTML(node: ElementNode, indent = 0): string {
  const pad = '  '.repeat(indent)
  const tag = node.tag

  // Atributos
  const attrs: string[] = []
  attrs.push(`data-editor-id="${node.id}"`)

  if (node.className && node.className.length > 0) {
    attrs.push(`class="${node.className.join(' ')}"`)
  }

  const styleStr = serializeStyles(node.styles)
  if (styleStr) {
    attrs.push(`style="${styleStr}"`)
  }

  for (const [key, value] of Object.entries(node.attributes)) {
    attrs.push(`${key}="${value}"`)
  }

  const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : ''

  // Void elements (img, input)
  if (VOID_TAGS.has(tag)) {
    return `${pad}<${tag}${attrStr} />`
  }

  // Elementos com texto sem filhos
  if (node.content !== undefined && node.children.length === 0) {
    return `${pad}<${tag}${attrStr}>${node.content}</${tag}>`
  }

  // Elementos com filhos
  if (node.children.length === 0) {
    return `${pad}<${tag}${attrStr}></${tag}>`
  }

  const childrenStr = node.children
    .map(child => serializeHTML(child, indent + 1))
    .join('\n')

  return `${pad}<${tag}${attrStr}>\n${childrenStr}\n${pad}</${tag}>`
}

function serializeStyles(styles: CSSProperties): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ')
}

// ─── Parse: HTML string → ElementNode ────────────────────────────

export function parseHTML(html: string): ElementNode | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  if (!body || body.children.length === 0) return null

  // O root é o primeiro elemento filho do body
  const rootEl = body.children[0]
  if (!rootEl) return null

  return domToElementNode(rootEl as HTMLElement)
}

function domToElementNode(el: HTMLElement): ElementNode | null {
  const tag = el.tagName.toLowerCase()
  if (!VALID_TAGS.has(tag)) return null

  const id = el.getAttribute('data-editor-id') || generateId()
  const label = tag

  // Parse styles do atributo style
  const styles = parseInlineStyles(el.style)

  // Parse className
  const classNames = el.className
    ? el.className.split(/\s+/).filter(Boolean)
    : undefined

  // Parse atributos (excluir os que gerenciamos separadamente)
  const skipAttrs = new Set(['data-editor-id', 'class', 'style'])
  const attributes: Record<string, string> = {}
  for (const attr of Array.from(el.attributes)) {
    if (!skipAttrs.has(attr.name)) {
      attributes[attr.name] = attr.value
    }
  }

  // Parse filhos
  const children: ElementNode[] = []
  for (const child of Array.from(el.children)) {
    const childNode = domToElementNode(child as HTMLElement)
    if (childNode) children.push(childNode)
  }

  // Conteúdo de texto (somente se é tag de texto e não tem filhos-elemento)
  let content: string | undefined
  if (TEXT_TAGS.has(tag) && children.length === 0) {
    const text = el.textContent?.trim()
    if (text) content = text
  }

  const now = new Date().toISOString()

  return {
    id,
    tag: tag as HtmlTag,
    label,
    styles,
    className: classNames && classNames.length > 0 ? classNames : undefined,
    attributes,
    content,
    children,
    visible: true,
    locked: false,
    meta: { createdAt: now, updatedAt: now },
  }
}

function parseInlineStyles(style: CSSStyleDeclaration): CSSProperties {
  const result: CSSProperties = {}
  for (let i = 0; i < style.length; i++) {
    const prop = style[i]
    if (!prop) continue
    const value = style.getPropertyValue(prop)
    if (value) {
      result[kebabToCamel(prop)] = value
    }
  }
  return result
}
