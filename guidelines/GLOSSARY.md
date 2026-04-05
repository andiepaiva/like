# Glossário — Termos do Projeto

Este documento define o vocabulário oficial do projeto.
Todos os nomes de componentes, variáveis, funções, comentários e docs devem usar estes termos.
Nunca usar sinônimos — consistência é obrigatória.

---

## Entidades principais

| Termo | Definição | Nunca usar |
|---|---|---|
| **Project** | O arquivo completo do usuário, contendo canvas, elementos e tokens | "file", "document", "design" |
| **Element** | Um nó da árvore — corresponde a uma tag HTML real no DOM | "shape", "object", "layer", "node" (exceto em contexto técnico de árvore) |
| **Root** | O elemento raiz do projeto — pai de todos os outros | "body", "wrapper", "container" (como nome especial) |
| **Canvas** | A área central de edição visual — renderiza elementos HTML reais do DOM (não bitmap). Zoom/pan via CSS transform. | "board", "stage", "artboard" |
| **Tag** | A tag HTML do elemento (`div`, `section`, `p`…) | "type", "kind", "element type" |
| **Label** | O nome amigável do elemento exibido no painel Layers | "name", "title", "alias" |
| **Styles** | O objeto de propriedades CSS de um elemento | "properties", "attrs", "design props" |
| **Token** | Uma CSS Custom Property reutilizável (`--color-primary`) | "variable", "var", "theme value" |
| **GlobalStyle** | Uma classe CSS reutilizável aplicável a elementos | "style preset", "class", "component style" |
| **Children** | Os elementos filhos de um elemento | "nodes", "nested", "inner elements" |

---

## Painéis da UI

| Termo | O que é | Nunca usar |
|---|---|---|
| **Toolbar** | Barra de ferramentas no topo | "topbar", "menubar", "header" |
| **LayersPanel** | Painel esquerdo com a árvore de elementos | "outline", "tree", "elements panel" |
| **PropertiesPanel** | Painel direito com as propriedades CSS do elemento selecionado | "inspector", "sidebar", "style panel" |
| **CodeEditor** | Painel inferior com o Monaco Editor | "code panel", "editor", "code view" |

---

## Ações do usuário

| Termo | Definição |
|---|---|
| **select** | Clicar em um elemento para torná-lo o elemento ativo |
| **deselect** | Remover a seleção ativa |
| **insert** | Adicionar um novo elemento ao canvas |
| **delete** | Remover um elemento do projeto |
| **duplicate** | Criar uma cópia de um elemento |
| **nest** | Mover um elemento para dentro de outro (torná-lo filho) |
| **reorder** | Mudar a posição de um elemento dentro de seus irmãos |
| **rename** | Alterar o `label` de um elemento |
| **lock** / **unlock** | Impedir / permitir edição de um elemento no canvas |
| **hide** / **show** | Ocultar / exibir um elemento no canvas (sem afetar exportação) |
| **export** | Gerar o HTML+CSS final do projeto |
| **save** | Persistir o projeto no IndexedDB |
| **load** | Recuperar um projeto do IndexedDB |

---

## Sincronização

| Termo | Definição |
|---|---|
| **sync** | O processo de manter canvas e código sempre consistentes |
| **canvas → code** | Direção: edição visual gera atualização no código |
| **code → canvas** | Direção: edição no código gera atualização no canvas |
| **selectedElement** | O elemento atualmente selecionado (único estado global central) |
| **parseHTML** | Função que converte string HTML em árvore de `ElementNode` |
| **serializeHTML** | Função que converte árvore de `ElementNode` em string HTML |

---

## Convenções de código

- Componentes React: **PascalCase** — `LayersPanel`, `PropertiesPanel`, `CanvasElement`
- Hooks: **camelCase com prefixo use** — `useProject`, `useSelectedElement`, `useHistory`
- Funções utilitárias: **camelCase** — `parseHTML`, `serializeHTML`, `generateId`
- Tipos e interfaces TypeScript: **PascalCase** — `ElementNode`, `Project`, `CSSProperties`
- Constantes globais: **UPPER_SNAKE_CASE** — `DEFAULT_CANVAS_WIDTH`, `GRID_SIZE`
- Arquivos de componente: **PascalCase** — `LayersPanel.tsx`
- Arquivos de hook: **camelCase** — `useProject.ts`
- Arquivos de utilitário: **camelCase** — `parseHTML.ts`
- IDs de elementos no runtime: prefixo `el_` — `el_abc123`
- IDs de tokens: prefixo `tok_` — `tok_abc123`
- IDs de estilos globais: prefixo `sty_` — `sty_abc123`
- IDs de projetos: prefixo `proj_` — `proj_abc123`

---

## Idioma do código

- Todo o código, comentários, nomes de variáveis e funções: **inglês**
- Toda a UI exibida ao usuário: **português**
- Toda a documentação de governança (este arquivo e os outros 5 docs): **português**
