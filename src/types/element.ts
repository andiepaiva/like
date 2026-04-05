// ─── Tags HTML suportadas pelo editor ────────────────────────────
export type HtmlTag =
  | 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'main' | 'aside'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'label' | 'strong' | 'em'
  | 'button' | 'a' | 'input' | 'textarea' | 'select'
  | 'img' | 'figure' | 'figcaption'
  | 'ul' | 'ol' | 'li'

// ─── Propriedades CSS inline ─────────────────────────────────────
export interface CSSProperties {
  // Layout
  display?: string
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  alignSelf?: string
  gap?: string
  gridTemplateColumns?: string
  gridTemplateRows?: string

  // Posicionamento
  position?: string
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: string

  // Dimensões
  width?: string
  height?: string
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string

  // Espaçamento
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  margin?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string

  // Aparência
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  opacity?: string
  border?: string
  borderWidth?: string
  borderStyle?: string
  borderColor?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  borderRadius?: string
  boxShadow?: string
  overflow?: string

  // Tipografia
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
  lineHeight?: string
  letterSpacing?: string
  textAlign?: string
  textDecoration?: string
  color?: string

  // Outros
  cursor?: string
  transition?: string
  transform?: string
  [key: string]: string | undefined
}

// ─── Metadados do editor (não exportados no HTML) ────────────────
export interface ElementMeta {
  notes?: string
  createdAt: string
  updatedAt: string
}

// ─── Nó da árvore de elementos ───────────────────────────────────
export interface ElementNode {
  id: string
  tag: HtmlTag
  label: string
  styles: CSSProperties
  className?: string[]
  attributes: Record<string, string>
  content?: string
  children: ElementNode[]
  visible: boolean
  locked: boolean
  meta: ElementMeta
}
