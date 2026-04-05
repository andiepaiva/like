# ANTI_PATTERNS.md — O Que Nunca Fazer

Proibições explícitas com explicação do porquê.
O Copilot deve consultar este doc antes de implementar qualquer feature.
Se uma solução proposta viola qualquer item abaixo, ela está errada — não importa o motivo.

---

## Estado

### ❌ AP-01 — Nunca armazenar ElementNode no estado de seleção

```ts
// ❌ ERRADO
selectedElement: ElementNode | null  // referência ao nó fica stale após mutações

// ✅ CORRETO
selectedElementId: string | null     // derivar o nó sob demanda com findElementById
```

**Por quê:** Após qualquer mutação na árvore, a referência ao nó antigo aponta para um objeto desatualizado. O PropertiesPanel exibiria valores incorretos.

---

### ❌ AP-02 — Nunca mutar objetos do store diretamente

```ts
// ❌ ERRADO
const element = findElementById(state.project.root, id)
element.styles.color = 'red'  // mutação direta

// ✅ CORRETO
updateNodeInTree(state.project.root, id, node => ({
  ...node,
  styles: { ...node.styles, color: 'red' }
}))
```

**Por quê:** Zustand não detecta mutações diretas em objetos aninhados. A UI não re-renderiza. O histórico de undo captura referências ao mesmo objeto mutado.

---

### ❌ AP-03 — Nunca usar useState para dados do projeto

```ts
// ❌ ERRADO — em qualquer componente
const [elements, setElements] = useState<ElementNode[]>([])

// ✅ CORRETO
const root = useAppStore(s => s.project?.root)
```

**Por quê:** Estado local não é compartilhado entre Canvas, LayersPanel e CodeEditor. Qualquer mudança ficaria isolada no componente que a fez.

---

### ❌ AP-04 — Nunca subscrever o store inteiro

```ts
// ❌ ERRADO — re-renderiza o componente em qualquer mudança no store
const store = useAppStore()

// ✅ CORRETO — re-renderiza apenas quando selectedElementId muda
const selectedElementId = useAppStore(s => s.selectedElementId)
```

**Por quê:** Com o store inteiro subscrito, qualquer mudança de zoom, sync status ou qualquer outra propriedade re-renderiza o componente, mesmo que ele não use aquele dado.

---

## Sincronização

### ❌ AP-05 — Nunca sincronizar Canvas ↔ Monaco diretamente

```ts
// ❌ ERRADO — Canvas notifica Monaco diretamente
canvas.on('change', () => monaco.setValue(serialize(elements)))

// ✅ CORRETO — Canvas → Store → Monaco (via selector)
canvas.on('change', () => store.updateElement(id, changes))
// Monaco observa o store e atualiza quando store muda
```

**Por quê:** Comunicação direta cria acoplamento forte e torna impossível rastrear a origem de uma mudança, resultando em loops de sync.

---

### ❌ AP-06 — Nunca sincronizar a cada keystroke no Monaco

```ts
// ❌ ERRADO
monaco.onDidChangeModelContent(() => {
  store.setRoot(parseHTML(monaco.getValue()))
})

// ✅ CORRETO
const debouncedSync = useMemo(
  () => debounce((value: string) => {
    try {
      const root = parseHTML(value)
      store.setRoot(root)
    } catch {
      store.setSyncStatus('error')
    }
  }, 500),
  []
)
monaco.onDidChangeModelContent(() => debouncedSync(monaco.getValue()))
```

**Por quê:** Parsear e re-renderizar o canvas a cada caractere digitado trava o editor com projetos de tamanho médio.

---

### ❌ AP-07 — Nunca travar a UI por HTML inválido

```ts
// ❌ ERRADO
const root = parseHTML(code)  // lança exceção → UI trava
store.setRoot(root)

// ✅ CORRETO
try {
  const root = parseHTML(code)
  store.setRoot(root)
  store.setSyncStatus('idle')
} catch {
  store.setSyncStatus('error')
  // Monaco continua editável, canvas continua no estado anterior
}
```

**Por quê:** O usuário está no meio de uma edição. Reverter ou travar o editor durante a digitação é uma experiência inaceitável.

---

## Árvore de elementos

### ❌ AP-08 — Nunca reimplementar busca em árvore fora de src/utils/tree.ts

```ts
// ❌ ERRADO — busca inline em componente
const el = root.children.find(c => c.id === id)  // não recursivo, só funciona no primeiro nível

// ✅ CORRETO
import { findElementById } from '@/utils/tree'
const el = findElementById(root, id)
```

**Por quê:** A árvore é profunda e recursiva. Busca não-recursiva só funciona no primeiro nível e cria bugs silenciosos que são difíceis de detectar.

---

### ❌ AP-09 — Nunca usar index do array como chave de elemento

```ts
// ❌ ERRADO
{elements.map((el, index) => <CanvasElement key={index} element={el} />)}

// ✅ CORRETO
{elements.map(el => <CanvasElement key={el.id} element={el} />)}
```

**Por quê:** Ao reordenar elementos, React reutiliza os componentes errados causando estado visual incorreto.

---

## Exportação e serialização

### ❌ AP-10 — Nunca exportar metadados do editor no HTML final

```ts
// ❌ ERRADO — exporta data-editor-id e outros atributos internos
<div data-editor-id="el_abc" data-label="Card" style="...">

// ✅ CORRETO — exporta apenas HTML limpo
<div style="...">
```

**Por quê:** `data-editor-id` e `label` são metadados internos do editor. Poluem o HTML exportado e expõem estrutura interna desnecessariamente.

---

### ❌ AP-11 — Nunca usar innerHTML para parsear HTML do Monaco

```ts
// ❌ ERRADO — executa scripts, inseguro, comportamento imprevisível
const div = document.createElement('div')
div.innerHTML = userCode
const tree = buildTreeFromDOM(div)

// ✅ CORRETO — parser seguro e controlado
import { parseHTML } from '@/utils/parseHTML'
const tree = parseHTML(userCode)  // usa DOMParser com sanitização
```

**Por quê:** `innerHTML` executa scripts embutidos e tem comportamento diferente entre browsers para HTML malformado.

---

## Performance

### ❌ AP-12 — Nunca re-serializar o projeto inteiro a cada mudança de seleção

```ts
// ❌ ERRADO — serialize roda quando só a seleção mudou
useEffect(() => {
  setCode(serializeHTML(project))
}, [project, selectedElementId])  // selectedElementId não afeta o código

// ✅ CORRETO
useEffect(() => {
  setCode(serializeHTML(project))
}, [project])  // apenas quando o projeto muda
```

**Por quê:** Serializar o projeto inteiro para HTML é uma operação cara. Rodá-la desnecessariamente degrada a performance do editor.

---

### ❌ AP-13 — Nunca criar funções dentro do render de listas grandes

```ts
// ❌ ERRADO — nova função criada a cada render para cada elemento
{elements.map(el => (
  <LayerItem
    key={el.id}
    onClick={() => store.setSelectedElementId(el.id)}  // nova função a cada render
  />
))}

// ✅ CORRETO — callback estável com useCallback ou handler que recebe o id
const handleSelect = useCallback((id: string) => {
  store.setSelectedElementId(id)
}, [])

{elements.map(el => (
  <LayerItem key={el.id} id={el.id} onSelect={handleSelect} />
))}
```

**Por quê:** O LayersPanel pode ter centenas de itens. Recriar funções a cada render causa re-renders em cascata.

---

## Geral

### ❌ AP-14 — Nunca usar `any` no TypeScript

```ts
// ❌ ERRADO
function updateStyles(id: string, styles: any) { ... }

// ✅ CORRETO
function updateStyles(id: string, styles: Partial<CSSProperties>) { ... }
```

**Por quê:** `any` desativa a verificação de tipos e elimina o principal benefício do TypeScript. Bugs de tipo só aparecem em runtime.
