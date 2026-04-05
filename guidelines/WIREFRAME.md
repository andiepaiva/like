# Wireframe — Layout do Editor

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOOLBAR (topo)                                                      │
│  [Logo] [Select] [Div] [Section] [Text] [Img] [Button]  [Export] [Save] │
├───────────────┬─────────────────────────────────┬───────────────────┤
│  LAYERS       │                                 │  PROPERTIES       │
│  (esquerda)   │         CANVAS                  │  (direita)        │
│               │         (centro)                │                   │
│  ▼ section    │                                 │  Tag: div         │
│    ▼ div      │   ┌─────────────────────┐       │  ─────────────    │
│      p        │   │                     │       │  Layout           │
│      h1       │   │   elemento          │       │  display: flex    │
│      button   │   │   selecionado       │       │  flex-direction   │
│               │   │   [handles]         │       │  gap: 16px        │
│               │   └─────────────────────┘       │  ─────────────    │
│               │                                 │  Espaçamento      │
│               │                                 │  padding: 16px    │
│               │                                 │  margin: 0        │
│               │                                 │  ─────────────    │
│               │                                 │  Aparência        │
│               │                                 │  background       │
│               │                                 │  border           │
│               │                                 │  border-radius    │
│               │                                 │  box-shadow       │
│               │                                 │  ─────────────    │
│               │                                 │  Tipografia       │
│               │                                 │  font-family      │
│               │                                 │  font-size        │
│               │                                 │  font-weight      │
│               │                                 │  color            │
│               │                                 │  line-height      │
├───────────────┴─────────────────────────────────┴───────────────────┤
│  CODE EDITOR (Monaco) — painel inferior, colapsável                  │
│                                                                      │
│  <section>                                                           │
│    <div style="display:flex; gap:16px; padding:16px;">               │
│      <h1>Título</h1>                                                 │
│      <button>Click</button>                                          │
│    </div>                                                            │
│  </section>                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Painéis

### Toolbar (topo)
- Logo / nome do projeto (clicável para renomear)
- Ferramentas de inserção: cada botão insere um elemento no canvas
- Zoom in / out / fit
- Botão Exportar (gera HTML+CSS)
- Botão Salvar (persiste no IndexedDB)
- Indicador de estado: "Salvo" / "Modificado"

### Layers (esquerda, ~240px)
- Árvore hierárquica do DOM do projeto
- Cada nó mostra: ícone do tipo de tag + nome/label do elemento
- Ações por nó: renomear, duplicar, deletar, ocultar
- Drag and drop para reorganizar hierarquia
- Elemento selecionado no canvas fica destacado aqui, e vice-versa

### Canvas (centro, flex-grow)
- Fundo com grid pontilhado (como Figma)
- Zoom e pan com scroll e espaço+drag
- Elementos com handles de resize nos cantos e bordas
- Seleção por clique e por área (drag to select)
- Guias de alinhamento ao arrastar (snap)
- Elemento selecionado tem outline azul

### Properties (direita, ~280px)
- Exibe propriedades CSS do elemento selecionado
- Organizado em seções colapsáveis: Layout, Espaçamento, Aparência, Tipografia, Posição
- Cada campo é um input que edita diretamente o CSS do elemento
- Alteração reflete imediamente no canvas e no code editor

### Code Editor (inferior, altura ajustável, colapsável)
- Monaco Editor com syntax highlight HTML/CSS
- Exibe o HTML+CSS do projeto inteiro
- Edição em tempo real reflete no canvas
- Ao selecionar um elemento no canvas, o cursor vai para a linha correspondente no código

---

## Estados da UI

| Estado | Comportamento |
|---|---|
| Nenhum elemento selecionado | Properties panel vazio, nenhum highlight no canvas |
| Elemento selecionado | Highlight no canvas + layers + cursor no código |
| Editando texto inline | Duplo clique no elemento de texto ativa edição inline |
| Code editor em foco | Canvas não responde a clicks, sync é unidirecional (código → canvas) |
| Projeto não salvo | Indicador "Modificado" na toolbar |

---

## Responsividade do próprio app

O editor em si não precisa ser responsivo para mobile.
Ele é uma ferramenta desktop-first, mínimo 1280px de largura.
Painéis laterais podem ser redimensionados pelo usuário (drag na borda).
