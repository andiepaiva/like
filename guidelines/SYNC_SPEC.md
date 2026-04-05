# SYNC_SPEC.md — Sincronização Bidirecional Canvas ↔ Código

A sincronização é a feature mais crítica do app.
Qualquer implementação que não siga este doc está errada.

---

## Princípio fundamental

**Existe uma única fonte de verdade: o `project` no store global (Zustand).**

Nem o canvas nem o código são a fonte da verdade.
Ambos são *representações* do estado — leitores e escritores do store.
Nunca sincronizar canvas ↔ código diretamente. Sempre passar pelo store.

```
Canvas → store → Código
Código → store → Canvas
```

---

## Fluxo: Canvas → Store → Código

### Quando acontece
Qualquer ação no canvas que modifique um elemento:
- Inserir elemento
- Mover elemento
- Redimensionar elemento
- Alterar propriedade no PropertiesPanel
- Editar texto inline
- Deletar elemento
- Reordenar no LayersPanel

### Sequência obrigatória

```
1. Usuário age no canvas
2. Handler chama action do store (ex: updateElementStyles)
3. Store atualiza o ProjectNode imutavelmente
4. Store empurra novo estado para histórico de undo
5. CodeEditor observa store via selector
6. CodeEditor chama serializeHTML(project.root)
7. Monaco recebe o novo HTML como valor controlado
8. Monaco NÃO dispara onChange (valor veio de fora, não do usuário)
```

### Regra crítica
O Monaco Editor deve ser **controlado** (`value` prop), nunca não-controlado (`defaultValue`).
Quando o valor é atualizado programaticamente, o evento `onChange` do Monaco não deve ser disparado.
Usar uma flag `isExternalUpdate` para suprimir o onChange quando a mudança vier do store.

```ts
const isExternalUpdate = useRef(false)

// Quando store muda:
isExternalUpdate.current = true
setCode(serializeHTML(project.root))
// Monaco atualiza — onChange não processa porque a flag está ativa
isExternalUpdate.current = false

// No onChange do Monaco:
function handleCodeChange(value: string) {
  if (isExternalUpdate.current) return  // ignorar
  debouncedSyncToStore(value)
}
```

---

## Fluxo: Código → Store → Canvas

### Quando acontece
Usuário edita o código no Monaco Editor.

### Sequência obrigatória

```
1. Usuário digita no Monaco
2. onChange do Monaco dispara
3. Debounce de 500ms é iniciado (resetado a cada keystroke)
4. Após 500ms sem digitação:
   a. Tentar parseHTML(newCode)
   b. Se inválido: exibir erro não-obstrutivo, NÃO atualizar store
   c. Se válido: chamar store.setRoot(parsedRoot)
5. Store atualiza o root
6. Canvas observa store via selector
7. Canvas re-renderiza com nova árvore
8. LayersPanel re-renderiza com nova árvore
```

### Regra crítica
O debounce é obrigatório. Nunca sincronizar a cada keystroke.
500ms é o valor padrão. Não reduzir abaixo de 300ms.

### O que fazer se o HTML for inválido
- Exibir mensagem não-obstrutiva abaixo do Monaco: "HTML inválido — corrija para sincronizar"
- Não reverter o texto do Monaco
- Não atualizar o store
- Não travar o editor
- Quando o usuário corrigir e o debounce disparar novamente com HTML válido, sincronizar normalmente

---

## Seleção cruzada

### Canvas seleciona → Monaco destaca

```
1. Usuário clica em elemento no canvas
2. Store atualiza selectedElementId
3. CodeEditor observa selectedElementId
4. CodeEditor encontra a linha do elemento no código via data-editor-id
5. Monaco.revealLineInCenter(linha)
6. Monaco.setSelection(range da tag de abertura)
```

### Monaco clica → Canvas seleciona

```
1. Usuário clica em linha do Monaco
2. Monaco onCursorPositionChange dispara
3. Identificar o data-editor-id do elemento mais próximo na posição do cursor
4. Store atualiza selectedElementId
5. Canvas destaca o elemento correspondente
6. LayersPanel destaca o nó correspondente
```

### Identificação de elementos no código
Cada elemento é serializado com um atributo `data-editor-id`:

```html
<div data-editor-id="el_abc123" style="...">
```

Este atributo é removido na exportação final.
É a ponte entre o código e a árvore de ElementNode.

---

## Casos onde a sync deve ser suspensa

| Situação | Comportamento |
|---|---|
| Usuário está editando texto inline no canvas | Sync código→canvas suspensa até confirmar edição |
| Monaco está em foco e usuário está digitando | Sync canvas→código está ativa, mas Monaco não perde o foco |
| Undo/Redo em execução | Sync normal — undo atualiza store, store notifica ambos |
| Projeto sendo carregado do IndexedDB | Ambas as syncs suspensas até load completo, depois inicializar estado |

---

## Estados de sincronização

O store deve expor um campo `syncStatus`:

```ts
type SyncStatus =
  | 'idle'          // Nenhuma sync em andamento
  | 'canvas-to-code' // Canvas acabou de mudar, código será atualizado
  | 'code-to-canvas' // Código mudou, aguardando debounce
  | 'error'         // HTML inválido no código
```

A Toolbar exibe um indicador visual discreto baseado em `syncStatus`.

---

## Testes manuais obrigatórios antes de considerar sync pronta

- [ ] Inserir elemento no canvas → código atualiza corretamente
- [ ] Mover elemento → código atualiza coordenadas/styles
- [ ] Editar estilo no PropertiesPanel → código atualiza
- [ ] Digitar HTML válido no Monaco → canvas atualiza após debounce
- [ ] Digitar HTML inválido → erro exibido, canvas não quebra
- [ ] Clicar elemento no canvas → cursor Monaco vai para a linha certa
- [ ] Clicar linha no Monaco → elemento correspondente selecionado no canvas
- [ ] Undo após edição no canvas → código e canvas voltam ao estado anterior
- [ ] Undo após edição no código → canvas e código voltam ao estado anterior
- [ ] Nenhum loop infinito de sync em nenhum dos cenários acima
