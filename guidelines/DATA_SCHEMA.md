# Data Schema

## Visão Geral

Toda a estrutura de um projeto é representada como uma árvore de nós (`ElementNode`).
Cada nó corresponde a um elemento HTML real, com suas propriedades CSS inline e metadados do editor.
O projeto inteiro é serializado em JSON para persistência no IndexedDB e para exportação.

---

## Tipos principais

### Project
```ts
interface Project {
  id: string                // UUID gerado na criação
  name: string              // Nome exibido na toolbar
  createdAt: string         // ISO 8601
  updatedAt: string         // ISO 8601
  version: number           // Incrementado a cada save (para controle de conflito futuro)
  canvas: CanvasSettings
  tokens: DesignTokens
  styles: GlobalStyle[]
  root: ElementNode         // Elemento raiz — sempre uma <div> ou <body> wrapper
}
```

### CanvasSettings
```ts
interface CanvasSettings {
  zoom: number              // Ex: 1, 1.5, 0.75
  offsetX: number           // Pan horizontal
  offsetY: number           // Pan vertical
  width: number             // Largura do canvas em px
  height: number            // Altura do canvas em px
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number          // Em px, padrão 8
}
```

### ElementNode
```ts
interface ElementNode {
  id: string                // UUID — chave primária do elemento
  tag: HtmlTag              // Tag HTML real: 'div', 'section', 'p', 'h1', etc.
  label: string             // Nome amigável exibido no painel de layers (ex: "Card principal")
  styles: CSSProperties     // Objeto com propriedades CSS inline
  className?: string[]      // Classes CSS globais aplicadas (vinculadas a GlobalStyle). Ex: ['card', 'btn-primary']
  attributes: Record<string, string>  // Atributos HTML: src, alt, href, type, etc.
  content?: string          // Conteúdo de texto (para tags de texto: p, h1, span, button)
  children: ElementNode[]   // Filhos — mesma estrutura, recursiva
  visible: boolean          // Visível no canvas (não afeta exportação)
  locked: boolean           // Impede seleção e edição no canvas
  meta: ElementMeta
}
```

### HtmlTag
```ts
type HtmlTag =
  | 'div' | 'section' | 'article' | 'nav' | 'header' | 'footer' | 'main' | 'aside'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'label' | 'strong' | 'em'
  | 'button' | 'a' | 'input' | 'textarea' | 'select'
  | 'img' | 'figure' | 'figcaption'
  | 'ul' | 'ol' | 'li'
```

### CSSProperties
```ts
// Subconjunto das propriedades CSS relevantes para o editor
// Valores sempre como string (igual à representação CSS)
interface CSSProperties {
  // Layout
  display?: string           // 'flex' | 'grid' | 'block' | 'inline' | 'none'
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  alignSelf?: string
  gap?: string
  gridTemplateColumns?: string
  gridTemplateRows?: string

  // Posicionamento
  position?: string          // 'static' | 'relative' | 'absolute' | 'fixed'
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
  textTransform?: string      // uppercase, lowercase, capitalize, none
  whiteSpace?: string         // normal, nowrap, pre, pre-wrap, pre-line
  textOverflow?: string       // clip, ellipsis
  listStyleType?: string      // disc, decimal, none, etc.
  verticalAlign?: string      // baseline, top, middle, bottom
  color?: string

  // Outros
  cursor?: string
  transition?: string
  transform?: string
  [key: string]: string | undefined   // Permite propriedades não mapeadas
}
```

### ElementMeta
```ts
// Metadados usados apenas pelo editor — não exportados no HTML final
interface ElementMeta {
  notes?: string            // Anotações do designer (não exportadas)
  createdAt: string
  updatedAt: string
}
```

### DesignTokens
```ts
// CSS Custom Properties do projeto
interface DesignTokens {
  colors: Token[]
  typography: Token[]
  spacing: Token[]
  other: Token[]
}

interface Token {
  id: string
  name: string              // Nome da variável: 'color-primary', 'spacing-md'
  value: string             // Valor CSS: '#6366f1', '16px', 'Inter, sans-serif'
  description?: string
}
// Exportado como: :root { --color-primary: #6366f1; --spacing-md: 16px; }
```

### GlobalStyle
```ts
// Classes CSS reutilizáveis — aplicáveis a múltiplos elementos
interface GlobalStyle {
  id: string
  name: string              // Nome da classe: 'card', 'btn-primary', 'container'
  styles: CSSProperties
  description?: string
}
// Exportado como: .card { padding: 24px; border-radius: 8px; }
```

---

## Exemplo de projeto serializado

```json
{
  "id": "proj_abc123",
  "name": "Meu Projeto",
  "createdAt": "2026-04-05T10:00:00Z",
  "updatedAt": "2026-04-05T10:30:00Z",
  "version": 3,
  "canvas": {
    "zoom": 1,
    "offsetX": 0,
    "offsetY": 0,
    "width": 1440,
    "height": 900,
    "showGrid": true,
    "snapToGrid": true,
    "gridSize": 8
  },
  "tokens": {
    "colors": [
      { "id": "tok_1", "name": "color-primary", "value": "#6366f1" },
      { "id": "tok_2", "name": "color-text", "value": "#111827" }
    ],
    "typography": [
      { "id": "tok_3", "name": "font-body", "value": "Inter, sans-serif" }
    ],
    "spacing": [
      { "id": "tok_4", "name": "spacing-md", "value": "16px" }
    ],
    "other": []
  },
  "styles": [
    {
      "id": "sty_1",
      "name": "card",
      "styles": {
        "padding": "24px",
        "borderRadius": "8px",
        "backgroundColor": "#ffffff",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.08)"
      }
    }
  ],
  "root": {
    "id": "el_root",
    "tag": "div",
    "label": "Root",
    "styles": { "width": "100%", "minHeight": "100vh" },
    "attributes": {},
    "children": [
      {
        "id": "el_section1",
        "tag": "section",
        "label": "Hero",
        "styles": {
          "display": "flex",
          "flexDirection": "column",
          "alignItems": "center",
          "padding": "64px 32px",
          "backgroundColor": "var(--color-primary)"
        },
        "attributes": {},
        "children": [
          {
            "id": "el_h1",
            "tag": "h1",
            "label": "Título principal",
            "styles": {
              "fontSize": "48px",
              "fontWeight": "700",
              "color": "#ffffff"
            },
            "attributes": {},
            "content": "Bem-vindo",
            "children": [],
            "visible": true,
            "locked": false,
            "meta": {
              "createdAt": "2026-04-05T10:00:00Z",
              "updatedAt": "2026-04-05T10:00:00Z"
            }
          }
        ],
        "visible": true,
        "locked": false,
        "meta": {
          "createdAt": "2026-04-05T10:00:00Z",
          "updatedAt": "2026-04-05T10:00:00Z"
        }
      }
    ],
    "visible": true,
    "locked": false,
    "meta": {
      "createdAt": "2026-04-05T10:00:00Z",
      "updatedAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

## Regras do schema

- `id` é sempre gerado com `crypto.randomUUID()` — nunca incrementado manualmente
- `styles` nunca usa shorthand ambíguo quando o valor é parcial (ex: usar `paddingTop` em vez de `padding` se só o topo for definido)
- `content` só existe em tags de texto — nunca em containers
- `children` é sempre um array, mesmo vazio
- `meta` nunca é exportado no HTML final
- Tokens são referenciados por valor CSS: `"var(--color-primary)"` — nunca pelo id do token
- **Posição dos elementos** é controlada exclusivamente por `styles` (`position`, `top`, `left`, etc.) — nunca por campos separados. O CSS é a única fonte de verdade para posição e layout.
- `className` é um array de strings. Cada string corresponde ao `name` de um `GlobalStyle` do projeto.
