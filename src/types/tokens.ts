export interface Token {
  id: string
  name: string
  value: string
  description?: string
}

export interface DesignTokens {
  colors: Token[]
  typography: Token[]
  spacing: Token[]
  other: Token[]
}

export interface GlobalStyle {
  id: string
  name: string
  styles: import('./element').CSSProperties
  description?: string
}
