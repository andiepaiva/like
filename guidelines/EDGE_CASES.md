# EDGE_CASES.md — Situações-Limite

Lista de casos que o Copilot jamais vai prever sozinho.
Cada item aqui representa um bug real que vai acontecer se não for tratado antecipadamente.
Consultar este doc ao implementar cada feature.

---

## Canvas e elementos

### EC-01 — Deletar elemento com filhos
**Situação:** Usuário deleta um `section` que contém 10 elementos filhos.
**Problema:** Os filhos podem ficar órfãos na árvore ou o undo pode restaurar apenas o pai.
**Tratamento:**
- Ao deletar, remover o nó e toda sua subárvore
- O undo deve restaurar o nó e toda a subárvore exatamente como estava
- Exibir confirmação: "Este elemento contém X filhos. Deletar tudo?"

### EC-02 — Elemento sem pai (órfão)
**Situação:** Bug de tree manipulation cria um ElementNode que não está conectado ao root.
**Problema:** Elemento não aparece no canvas nem no LayersPanel, mas existe no store.
**Tratamento:**
- Função `validateTree(root)` deve ser chamada após qualquer operação na árvore em desenvolvimento
- Em produção, se encontrar órfão: logar erro e ignorar o elemento na renderização
- Nunca deixar a UI travar por causa de um órfão

### EC-03 — Deletar Root
**Situação:** Código tenta deletar o elemento raiz.
**Problema:** App fica sem root e quebra completamente.
**Tratamento:**
- `deleteElement` deve verificar se `id === project.root.id` e lançar erro imediamente
- O botão de deletar na UI deve estar desabilitado quando Root estiver selecionado

### EC-04 — Mover elemento para dentro de si mesmo
**Situação:** Drag no LayersPanel move um `section` para dentro de um de seus filhos.
**Problema:** Cria referência circular na árvore — loop infinito de renderização.
**Tratamento:**
- Antes de mover, verificar se o destino está na subárvore do elemento sendo movido
- Usar `getPathToElement(root, destinationId)` e checar se o id do elemento aparece no caminho
- Se circular: cancelar o drag silenciosamente

### EC-05 — Elemento selecionado deletado
**Situação:** `selectedElementId` aponta para um elemento que foi deletado.
**Problema:** PropertiesPanel tenta renderizar um elemento nulo e quebra.
**Tratamento:**
- Após qualquer deleção, verificar se `selectedElementId` ainda existe na árvore
- Se não existir: `setSelectedElementId(null)`
- `useSelectedElement` deve retornar `null` graciosamente se o id não for encontrado

### EC-06 — Resize abaixo do tamanho mínimo
**Situação:** Usuário redimensiona elemento até dimensão negativa ou zero.
**Problema:** CSS com width/height negativos quebra o layout.
**Tratamento:**
- Dimensão mínima: 16px em qualquer direção
- Clamp obrigatório: `Math.max(16, newWidth)`

### EC-07 — Elemento fora dos limites do canvas
**Situação:** Usuário move elemento para além das bordas do canvas.
**Problema:** Elemento some visualmente mas ainda existe no projeto.
**Tratamento:**
- Ao soltar o drag, verificar se o elemento está dentro dos limites
- Se fora: snap de volta para a borda mais próxima
- Alternativa: permitir, mas exibir indicador visual que o elemento está fora da área visível

---

## Sincronização

### EC-08 — Loop infinito de sync
**Situação:** Canvas atualiza store → store atualiza Monaco → Monaco dispara onChange → store atualiza → loop.
**Problema:** Performance destruída, possível travamento do browser.
**Tratamento:**
- Usar a flag `isExternalUpdate` descrita no SYNC_SPEC.md — obrigatória
- Nunca disparar onChange do Monaco quando a atualização vier do store

### EC-09 — HTML inválido no Monaco
**Situação:** Usuário digita HTML malformado (tag sem fechar, atributo errado).
**Problema:** `parseHTML` lança exceção e quebra a sync.
**Tratamento:**
- Sempre envolver `parseHTML` em try/catch
- Em caso de erro: `setSyncStatus('error')`, exibir mensagem, não atualizar store
- Quando o usuário corrigir: tentar de novo no próximo debounce

### EC-10 — HTML válido mas estrutura incompatível
**Situação:** Usuário cola HTML de outro lugar com tags não suportadas (`<svg>`, `<video>`, `<table>`).
**Problema:** Tags não estão no tipo `HtmlTag`, schema quebra.
**Tratamento:**
- Tags desconhecidas devem ser renderizadas como `div` no canvas com label "Tag desconhecida: svg"
- Preservar a tag original no `ElementNode.tag` como string
- Exibir aviso: "Algumas tags não são editáveis visualmente mas serão exportadas corretamente"

### EC-11 — Sync durante undo/redo
**Situação:** Usuário pressiona Ctrl+Z enquanto debounce de sync código→canvas está pendente.
**Problema:** Undo restaura estado X, debounce aplica código do estado Y, resultado inconsistente.
**Tratamento:**
- Ao disparar undo/redo, cancelar qualquer debounce pendente de sync
- Undo/redo sempre tem prioridade sobre sync pendente

### EC-12 — data-editor-id ausente no código
**Situação:** Usuário remove o atributo `data-editor-id` de um elemento no Monaco.
**Problema:** Seleção cruzada não funciona para aquele elemento.
**Tratamento:**
- `parseHTML` deve re-gerar o `data-editor-id` para elementos sem ele (usando `generateId()`)
- Nunca travar a sync por falta de data-editor-id

---

## Persistência

### EC-13 — IndexedDB indisponível
**Situação:** Browser não suporta IndexedDB ou está em modo privado com restrições.
**Problema:** Salvar falha silenciosamente.
**Tratamento:**
- Detectar suporte a IndexedDB na inicialização
- Se indisponível: exibir banner "Salvamento automático indisponível neste modo"
- Fallback: oferecer download do projeto como arquivo JSON

### EC-14 — Projeto corrompido no IndexedDB
**Situação:** Dado salvo está malformado (crash durante save, migração futura).
**Problema:** `JSON.parse` falha ou schema inválido quebra a inicialização.
**Tratamento:**
- Envolver load em try/catch
- Se corrupção detectada: exibir "Projeto anterior não pôde ser carregado" e iniciar projeto vazio
- Nunca travar a inicialização por causa de dado corrompido

### EC-15 — Save durante operação em andamento
**Situação:** Usuário pressiona Ctrl+S enquanto está no meio de um drag.
**Problema:** Estado salvo captura um momento intermediário (elemento em posição errada).
**Tratamento:**
- O save deve aguardar o fim de qualquer drag ativo

---

## Histórico (Undo/Redo)

### EC-16 — Undo quando não há histórico
**Situação:** Usuário pressiona Ctrl+Z sem ter feito nenhuma ação.
**Problema:** `historyIndex` pode ir para -1.
**Tratamento:**
- `undo` deve verificar `historyIndex > 0` antes de executar
- Clamp: `Math.max(0, historyIndex - 1)`

### EC-17 — Histórico cresce indefinidamente
**Situação:** Usuário faz centenas de operações.
**Problema:** Array de histórico ocupa memória excessiva.
**Tratamento:**
- Máximo de 50 estados no histórico
- Ao ultrapassar: remover o estado mais antigo (`history.shift()`)

### EC-18 — Redo após nova ação
**Situação:** Usuário faz undo 3 vezes, depois faz uma nova ação.
**Problema:** Os estados "futuros" (que seriam redos) devem ser descartados.
**Tratamento:**
- Ao fazer qualquer `pushHistory` com `historyIndex < history.length - 1`:
  descartar todos os estados após `historyIndex` antes de adicionar o novo

---

## UI e Layout

### EC-19 — PropertiesPanel com múltiplos elementos selecionados
**Situação:** No futuro, seleção múltipla pode ser implementada.
**Problema:** PropertiesPanel não sabe qual elemento exibir.
**Tratamento:**
- No MVP: apenas seleção simples é suportada
- Se por algum bug `selectedElementId` apontar para múltiplos: usar o primeiro e logar aviso

### EC-20 — Monaco Editor não carregou
**Situação:** Monaco falha ao carregar (CDN lento, erro de módulo).
**Problema:** Tela do editor fica quebrada.
**Tratamento:**
- Envolver Monaco em Suspense com fallback de textarea simples
- O app deve funcionar sem Monaco — sync desativada, textarea como fallback

### EC-21 — Janela redimensionada abaixo de 1280px
**Situação:** Usuário redimensiona a janela para largura pequena.
**Problema:** Layout do editor quebra — painéis se sobrepõem.
**Tratamento:**
- Abaixo de 1280px: exibir overlay "Este editor requer largura mínima de 1280px"
- Não tentar adaptar o layout — o editor é desktop-first por definição

---

## Exportação

### EC-22 — Exportar projeto vazio
**Situação:** Usuário clica em Exportar sem ter criado nenhum elemento.
**Problema:** HTML exportado é apenas o Root wrapper vazio.
**Tratamento:**
- Verificar se `project.root.children.length === 0`
- Se vazio: exibir alerta "Adicione elementos antes de exportar"

### EC-23 — Elemento com estilo referenciando token deletado
**Situação:** Elemento usa `var(--color-primary)` mas o token foi deletado.
**Problema:** CSS exportado referencia variável que não existe.
**Tratamento:**
- Ao deletar um token, verificar se algum elemento o usa
- Se sim: exibir aviso com lista de elementos afetados
- Não bloquear a deleção — apenas avisar
- Na exportação: a variável ficará indefinida no CSS (comportamento nativo do browser)
