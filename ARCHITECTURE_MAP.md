# ARCHITECTURE_MAP.md — Inventário Vivo do Ecossistema

> **Regra:** Antes de criar algo novo, consultar este doc. Ao finalizar, atualizar.
> Se algo novo quebrar uma conexão existente, parar e avisar.

---

## Membros (UI Components)

| Componente | O que faz | Onde aparece |
|---|---|---|
| `App` | Shell principal — MenuBar + Toolbar + (Layers \| Canvas \| Properties), atalhos globais (Delete/Backspace), inicialização do projeto | `src/App.tsx` |
| `Canvas` | Canvas DOM-based com zoom/pan (Space+drag, Ctrl+scroll), seleção multi-element | `src/canvas/Canvas.tsx` |
| `RenderNode` | Renderiza ElementNode como HTML real. Sem subscribe no store — recebe callbacks via props | `src/canvas/Canvas.tsx` (interno) |
| `SelectionOverlay` | Overlay fora do artboard: handles de resize (8 direções, preserva origem), drag-to-move, ResizeObserver+MutationObserver | `src/canvas/Canvas.tsx` (interno) |
| `LayersPanel` | Árvore de camadas com multi-seleção, visibilidade, lock, duplicate, delete | `src/panels/layers/LayersPanel.tsx` |
| `PropertiesPanel` | Editor CSS contextual: nome/classe, posição X/Y, W/H, rotation, spacing, border, alignment (margin auto), width presets | `src/panels/properties/PropertiesPanel.tsx` |
| `VariablesPanel` | CRUD de design tokens (cores/tipografia/spacing/other), modal overlay | `src/panels/variables/VariablesPanel.tsx` |
| `Toolbar` | Inserção de elementos, undo/redo, zoom controls, zoom-to-fit, ações de elemento | `src/components/Toolbar.tsx` |
| `MenuBar` | Menus File/Edit/View — tema claro/escuro, grid toggle, zoom-to-fit, acesso ao painel de variáveis | `src/components/MenuBar.tsx` |

---

## Neurônios (Helpers / Utils)

| Função | O que faz | Quem usa |
|---|---|---|
| `findElementById` | Busca nó por ID na árvore | Store, hooks |
| `findParentOf` | Encontra pai de um nó | Store (duplicate, move) |
| `updateNodeInTree` | Atualiza nó imutavelmente | Store (update*) |
| `removeNodeFromTree` | Remove nó imutavelmente | Store (delete, move) |
| `insertNodeInTree` | Insere nó como filho | Store (insert, move, duplicate) |
| `getPathToElement` | Caminho root→nó (breadcrumb) | Futuro: LayersPanel |
| `cloneSubtree` | Clona subárvore com novos IDs | Store (duplicate) |
| `generateId` | Gera UUID v4 | Store, defaults, html parse |
| `serializeHTML` | ElementNode → HTML string | Futuro: CodeEditor, Export |
| `parseHTML` | HTML string → ElementNode | Futuro: CodeEditor sync |

---

## Reflexos (Hooks)

| Hook | Estado que gerencia | Store que consome |
|---|---|---|
| `useSelectedElement` | Deriva ElementNode do primeiro ID selecionado | `project`, `selectedElementIds` |

---

## DNA (Data Schemas)

> Definidos em `guidelines/DATA_SCHEMA.md`. Resumo:

| Entidade | Campos obrigatórios |
|---|---|
| `Project` | id, name, createdAt, updatedAt, version, canvas, tokens, styles, root |
| `ElementNode` | id, tag, label, styles, attributes, children, visible, locked, meta |
| `CanvasSettings` | zoom, offsetX, offsetY, width, height, showGrid, snapToGrid, gridSize |
| `DesignTokens` | colors, typography, spacing, other |
| `GlobalStyle` | id, name, styles |

---

## Caminhos (Routing)

Aplicação SPA — sem rotas no MVP.

---

## Órgãos (Services)

| Serviço | Conexão | Status |
|---|---|---|
| IndexedDB (via `idb`) | Browser API — persistência local | A implementar |
| Exportação HTML+CSS | Geração de arquivos | A implementar |

---

## Mapa de Conexões

```
Store (Zustand)
  ├── Canvas
  │    ├── lê: project.root, selectedElementIds, canvasSettings
  │    ├── escreve: setSelectedElementIds, toggleSelectedElement, updateCanvasSettings
  │    └── contém: RenderNode (props-only, zero subscriptions)
  │               SelectionOverlay (pushHistory 1x, updateElementStylesSilent N×)
  ├── LayersPanel ──── lê project.root, selectedElementIds │ escreve setSelectedElementIds
  ├── PropertiesPanel ── lê selectedElementIds → deriva de project.root │ escreve updateElementStyles, renameElement
  ├── Toolbar ────── lê canvasSettings, isSaved │ escreve undo, redo, insertElement, deleteElement
  ├── MenuBar ────── lê canvasSettings │ escreve undo, redo, updateCanvasSettings, setProject
  ├── VariablesPanel ── lê project.tokens │ escreve addToken, updateToken, deleteToken
  └── Services (futuros)
       ├── IndexedDB ──────── lê/escreve project completo
       └── Export ──────────── lê project → gera HTML+CSS
```

---

## Changelog de Integridade

| Data | Alteração |
|---|---|
| 2026-04-05 | Documento criado com estrutura inicial (pré-implementação) |
| 2026-04-05 | Fase A concluída: types/, utils/, store/, hooks/ implementados |
| 2026-04-05 | Fase B-C concluída: Canvas DOM-based, LayersPanel, PropertiesPanel, Toolbar |
| 2026-04-05 | Features: MenuBar, VariablesPanel, tema claro/escuro, renomeação de elementos, alignment section |
| 2026-04-05 | Audit de arquitetura: drag-to-move, history flooding fix (updateElementStylesSilent), resize com preservação de origem, RenderNode sem store subscriptions, RAF→Observer, deselect onClick, interactionRef expandido |
| 2026-04-05 | Docs atualizados: STATE_SPEC (selectedElementIds, future[], updateElementStylesSilent), ARCHITECTURE_MAP (componentes reais, mapa de conexões) |
