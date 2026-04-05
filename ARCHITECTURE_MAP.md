# ARCHITECTURE_MAP.md — Inventário Vivo do Ecossistema

> **Regra:** Antes de criar algo novo, consultar este doc. Ao finalizar, atualizar.
> Se algo novo quebrar uma conexão existente, parar e avisar.

---

## Membros (UI Components)

| Componente | O que faz | Onde aparece |
|---|---|---|
| `App` | Shell placeholder | `src/App.tsx` |

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
| `useSelectedElement` | Deriva ElementNode do ID selecionado | `project`, `selectedElementId` |

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
  ├── Canvas (DOM-based) ──── lê project.root, selectedElementId, canvasSettings
  ├── LayersPanel ─────────── lê project.root, selectedElementId
  ├── PropertiesPanel ─────── lê selectedElementId → deriva elemento de project.root
  ├── CodeEditor (Monaco) ─── lê project.root, tokens, styles, selectedElementId
  ├── Toolbar ─────────────── lê isSaved, syncStatus, canvasSettings.zoom
  └── Services
       ├── IndexedDB ──────── lê/escreve project completo
       └── Export ──────────── lê project → gera HTML+CSS
```

---

## Changelog de Integridade

| Data | Alteração |
|---|---|
| 2026-04-05 | Documento criado com estrutura inicial (pré-implementação) |
| 2026-04-05 | Fase A concluída: types/, utils/, store/, hooks/ implementados |
