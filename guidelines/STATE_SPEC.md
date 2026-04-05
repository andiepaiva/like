# STATE_SPEC.md — Estado Global e Gerenciamento de Estado

Este documento define a fonte única da verdade do app,
o que pode mutar o estado, em que ordem, e o que nunca pode acontecer.
Consultar antes de criar qualquer hook, store ou componente com estado.

---

## Princípio fundamental

**Um único store Zustand. Zero estado local que represente dados do projeto.**

Estado local (`useState`) é permitido apenas para:
- Estado de UI puro (ex: painel colapsado ou não, hover, tooltip aberto)
- Valores temporários de input antes de confirmar (ex: digitar no campo de cor antes de aplicar)

Nunca usar `useState` para dados que precisam ser lidos por mais de um componente.

---

## Estrutura do Store

```ts
interface AppStore {
  // ─── Projeto ───────────────────────────────────────────────
  project: Project | null
  setProject: (project: Project) => void
  updateElement: (id: string, changes: Partial<ElementNode>) => void
  updateElementStyles: (id: string, styles: Partial<CSSProperties>) => void
  updateElementStylesSilent: (id: string, styles: Partial<CSSProperties>) => void
  insertElement: (parentId: string, element: ElementNode) => void
  deleteElement: (id: string) => void
  duplicateElement: (id: string) => void
  moveElement: (id: string, newParentId: string, index: number) => void
  renameElement: (id: string, label: string) => void

  // ─── Seleção ───────────────────────────────────────────────
  selectedElementIds: string[]
  setSelectedElementIds: (ids: string[]) => void
  toggleSelectedElement: (id: string) => void
  addSelectedElement: (id: string) => void

  // ─── Tokens e Estilos Globais ──────────────────────────────
  addToken: (category: 'colors' | 'typography' | 'spacing' | 'other', token: Token) => void
  updateToken: (id: string, changes: Partial<Token>) => void
  deleteToken: (id: string) => void
  addGlobalStyle: (style: GlobalStyle) => void
  updateGlobalStyle: (id: string, changes: Partial<GlobalStyle>) => void
  deleteGlobalStyle: (id: string) => void

  // ─── Histórico (Undo/Redo) ─────────────────────────────────
  history: Project[]   // snapshots do passado
  future: Project[]    // snapshots para redo
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // ─── Canvas ────────────────────────────────────────────────
  canvasSettings: CanvasSettings
  updateCanvasSettings: (changes: Partial<CanvasSettings>) => void

  // ─── Sync ──────────────────────────────────────────────────
  syncStatus: SyncStatus
  setSyncStatus: (status: SyncStatus) => void

  // ─── Persistência ──────────────────────────────────────────
  isSaved: boolean
  lastSavedAt: string | null
  markSaved: () => void
  markUnsaved: () => void
}
```

---

## Regras de mutação

### Imutabilidade obrigatória
Toda mutação do store deve produzir **novos objetos** — nunca mutar diretamente.

```ts
// ❌ ERRADO
updateElementStyles: (id, styles) => {
  const el = findElement(state.project.root, id)
  el.styles = { ...el.styles, ...styles }  // mutação direta
}

// ✅ CORRETO
updateElementStyles: (id, styles) => set(state => ({
  project: {
    ...state.project,
    root: updateNodeInTree(state.project.root, id, node => ({
      ...node,
      styles: { ...node.styles, ...styles }
    }))
  }
}))
```

### Histórico de undo
`pushHistory` deve ser chamado **antes** de toda mutação destrutiva.
Mutações destrutivas: insert, delete, move, updateStyles, rename, reorder.
Mutações não-destrutivas (sem push): updateCanvasSettings (zoom, pan), setSyncStatus, setSelectedElementIds, updateElementStylesSilent.

```ts
// Sequência obrigatória para toda action destrutiva:
// 1. pushHistory()
// 2. mutação do estado
```

### `isSaved`
Toda action destrutiva deve chamar `markUnsaved()` após a mutação.
`markSaved()` é chamado apenas pelo service de persistência após salvar com sucesso.

---

## Seletores — o que cada componente deve observar

Componentes devem observar **apenas o que precisam**, usando seletores granulares.
Nunca subscrever o store inteiro — causa re-renders desnecessários.

```ts
// ❌ ERRADO
const store = useAppStore()

// ✅ CORRETO
const selectedElementId = useAppStore(s => s.selectedElementId)
const project = useAppStore(s => s.project)
```

### Mapa de seletores por componente

| Componente | O que observa |
|---|---|
| `Canvas` | `project.root`, `selectedElementIds`, `setSelectedElementIds`, `toggleSelectedElement`, `canvasSettings`, `updateCanvasSettings` |
| `LayersPanel` | `project.root`, `selectedElementIds`, `setSelectedElementIds`, `toggleSelectedElement`, `addSelectedElement` |
| `PropertiesPanel` | `selectedElementIds` + elemento derivado de `project.root`, `updateElementStyles`, `renameElement`, `updateElement` |
| `Toolbar` | `isSaved`, `canvasSettings`, `updateCanvasSettings`, `undo`, `redo`, `insertElement`, `deleteElement`, `duplicateElement` |
| `MenuBar` | `canvasSettings`, `undo`, `redo`, `setProject` |
| `VariablesPanel` | `project.tokens`, `addToken`, `updateToken`, `deleteToken` |
| `SelectionOverlay` | `pushHistory`, `updateElementStylesSilent`, nó derivado de `project.root` |

---

## Elemento selecionado — como derivar

`selectedElementId` é apenas um ID. O elemento em si é derivado sob demanda.
Nunca armazenar o `ElementNode` selecionado diretamente no store — ele ficaria desatualizado após mutações.

```ts
// Hook utilitário para obter o elemento selecionado atualizado
function useSelectedElement(): ElementNode | null {
  const project = useAppStore(s => s.project)
  const selectedElementIds = useAppStore(s => s.selectedElementIds)
  if (!project || selectedElementIds.length === 0) return null
  return findElementById(project.root, selectedElementIds[0])
}
```

---

## Busca na árvore — funções obrigatórias

Estas funções devem existir em `src/utils/tree.ts` e ser usadas em todo o app.
Nunca reimplementar busca em árvore fora deste arquivo.

```ts
// Encontrar elemento por ID
findElementById(root: ElementNode, id: string): ElementNode | null

// Encontrar o pai de um elemento
findParentOf(root: ElementNode, id: string): ElementNode | null

// Atualizar um nó na árvore (imutável)
updateNodeInTree(root: ElementNode, id: string, updater: (node: ElementNode) => ElementNode): ElementNode

// Remover um nó da árvore (imutável)
removeNodeFromTree(root: ElementNode, id: string): ElementNode

// Inserir um nó como filho de outro (imutável)
insertNodeInTree(root: ElementNode, parentId: string, node: ElementNode, index?: number): ElementNode

// Obter caminho do root até o elemento (breadcrumb)
getPathToElement(root: ElementNode, id: string): ElementNode[]
```

---

## Inicialização do store

Ao abrir o app:
1. Tentar carregar o projeto mais recente do IndexedDB
2. Se existir: `setProject(loaded)`, `markSaved()`
3. Se não existir: `setProject(createEmptyProject())`, `markSaved()`
4. Nunca iniciar com `project: null` visível ao usuário — mostrar loading enquanto carrega

---

## Regras de ouro do estado

- **Nunca** duas fontes de verdade para o mesmo dado
- **Nunca** `useState` para dados do projeto
- **Nunca** mutar objetos do store diretamente
- **Nunca** subscrever o store inteiro num componente
- **Sempre** `pushHistory()` antes de mutação destrutiva
- **Sempre** `markUnsaved()` após mutação destrutiva
- **Sempre** derivar o elemento selecionado via `findElementById`, nunca armazenar o nó
- **Sempre** usar as funções de `src/utils/tree.ts` para operar na árvore
