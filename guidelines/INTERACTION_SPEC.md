# Interaction Spec — Comportamentos do Editor

Este documento descreve como cada interação do usuário deve se comportar.
O Copilot deve consultar este doc antes de implementar qualquer lógica de UI ou evento.

---

## Canvas

### Inserir elemento
- Clicar em um botão da Toolbar insere o elemento **dentro do elemento selecionado**
- Se nenhum elemento estiver selecionado, insere no Root
- O novo elemento é inserido como último filho
- Após inserção, o novo elemento torna-se o `selectedElement`
- O elemento recebe posição e dimensões padrão por tag:
  - `div`, `section`, `article`: `width: 200px`, `height: 100px`, `display: flex`
  - `p`, `span`, `label`: sem dimensão fixa, `content: "Texto"`
  - `h1`–`h6`: sem dimensão fixa, `content: "Título"`
  - `button`: `content: "Botão"`, padding padrão
  - `img`: `width: 200px`, `height: 150px`, `background: #e5e7eb` (placeholder)

### Selecionar elemento
- Clique simples no canvas: seleciona o elemento clicado
- Clique no fundo do canvas (sem elemento): deseleciona tudo
- Clique no LayersPanel: seleciona o elemento correspondente no canvas
- Elemento selecionado recebe outline azul `2px solid #3b82f6` e handles de resize

### Mover elemento
- Drag no elemento selecionado move o elemento (altera `styles.top` / `styles.left` para elementos com `position: absolute` ou `relative`)
- Para elementos no fluxo normal (static), drag reordena o elemento entre seus irmãos
- Snap para grid ativo por padrão (toggle na toolbar)
- Soltar o elemento fora dos limites do canvas: não permitido (snap de volta)

### Redimensionar elemento
- Handles nos 4 cantos e nas 4 bordas do elemento selecionado
- Drag em handle de canto: redimensiona proporcionalmente se Shift pressionado
- Drag em handle de borda: redimensiona apenas na direção da borda
- Dimensão mínima: 16x16px

### Deletar elemento
- Tecla `Delete` ou `Backspace` com elemento selecionado
- Root nunca pode ser deletado
- Ao deletar um pai, todos os filhos são deletados junto
- Exibe confirmação apenas se o elemento tiver filhos

### Duplicar elemento
- `Ctrl+D` duplica o elemento selecionado e todos os seus filhos
- A cópia é inserida como irmão imediatamente após o original
- A cópia recebe novo `id` (e todos os filhos também)
- A cópia torna-se o `selectedElement`

### Editar texto inline
- Duplo clique em elemento de texto (`p`, `h1`–`h6`, `span`, `button`, `label`) ativa edição inline
- O canvas entra em modo texto: apenas o texto é editável, canvas não responde a outros eventos
- `Enter` ou clique fora do elemento confirma a edição
- `Escape` cancela e reverte

### Undo / Redo
- `Ctrl+Z`: desfaz a última ação
- `Ctrl+Shift+Z` ou `Ctrl+Y`: refaz
- Histórico máximo: 50 estados
- Ações que entram no histórico: insert, delete, move, resize, style change, rename, reorder
- Ações que NÃO entram: pan do canvas, zoom, hover

---

## Layers Panel

### Árvore de elementos
- Exibe a hierarquia completa do projeto
- Elemento selecionado fica destacado com fundo azul claro
- Seta ▶ / ▼ colapsa / expande os filhos
- Root sempre expandido, não pode ser colapsado

### Reordenar
- Drag and drop dentro do painel reordena elementos
- Arrastar um elemento para cima/dentro de outro o aninha (torna filho)
- Não é permitido aninhar um elemento dentro de seus próprios filhos

### Renomear
- Duplo clique no label do elemento no painel: input inline para renomear
- `Enter` confirma, `Escape` cancela

### Ocultar / Exibir
- Ícone de olho ao hover: toggle de visibilidade no canvas
- Não afeta exportação

### Bloquear / Desbloquear
- Ícone de cadeado ao hover: toggle de lock
- Elemento bloqueado não pode ser selecionado nem movido no canvas
- Ainda aparece no LayersPanel com ícone de cadeado visível

---

## Properties Panel

### Comportamento geral
- Exibe propriedades do `selectedElement`
- Se nenhum elemento selecionado: exibe estado vazio com instrução
- Cada campo é um input controlado que aplica a mudança em tempo real
- Mudança de propriedade entra no histórico de undo

### Campos especiais
- **Cor**: abre color picker nativo do browser (`<input type="color">`)
- **Font family**: dropdown com fontes do sistema + Google Fonts futuramente
- **Display**: dropdown (`flex`, `grid`, `block`, `inline`, `none`)
- **Position**: dropdown (`static`, `relative`, `absolute`, `fixed`)
- **Border radius**: slider de 0 a 50% + input numérico

### Tokens
- Ao editar um campo de cor ou tamanho, exibir tokens disponíveis como sugestão
- Selecionar um token aplica `var(--nome-do-token)` como valor

### GlobalStyles
- Campo "Classe CSS" no topo do painel: dropdown dos GlobalStyles do projeto
- Aplicar um GlobalStyle adiciona a classe ao elemento (não sobrescreve styles inline)

---

## Code Editor

### Sincronização canvas → código
- Qualquer mudança no canvas (insert, move, resize, style) atualiza o código em tempo real
- O cursor no código vai para a linha do elemento que acabou de ser editado
- O elemento correspondente no código fica destacado por 1 segundo

### Sincronização código → canvas
- O usuário edita o código livremente
- A sincronização acontece após 500ms de inatividade (debounce)
- Se o HTML resultante for inválido, exibe mensagem de erro não-obstrutiva (não reverte o código)
- Se válido, o canvas e o LayersPanel refletem o novo estado

### Seleção cruzada
- Clicar em um elemento no canvas: cursor do Monaco vai para a tag de abertura desse elemento
- Clicar em uma linha do Monaco que corresponde a um elemento: seleciona o elemento no canvas

---

## Atalhos de teclado

| Atalho | Ação |
|---|---|
| `Ctrl+S` | Salvar projeto |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicar elemento selecionado |
| `Delete` / `Backspace` | Deletar elemento selecionado |
| `Escape` | Deselecionar / cancelar edição |
| `Espaço + Drag` | Pan do canvas |
| `Ctrl + Scroll` | Zoom in/out |
| `Ctrl+0` | Reset zoom para 100% |
| `Ctrl+Shift+E` | Exportar |
| `F2` | Renomear elemento selecionado |

---

## Exportação

### O que é exportado
- Um arquivo `index.html` com HTML semântico
- Um arquivo `styles.css` com: `:root` (tokens), classes globais, e estilos inline convertidos para classes por elemento
- Metadados do editor (`meta`, `label`, `visible`, `locked`) são removidos
- Atributo `data-editor-id` removido

### O que não é exportado
- Estado do canvas (zoom, pan, grid)
- Labels dos elementos
- Notas
