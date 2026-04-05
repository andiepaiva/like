# Prompt de Inicialização — Projeto Design-to-Code Editor

Antes de escrever qualquer linha de código, crie na raiz do projeto os 5 documentos de governança abaixo.
Preencha cada um com base no que eu descrever sobre o projeto. Se eu não tiver descrito algo ainda,
deixe a seção com placeholder "A definir" — nunca invente conteúdo.

1. **PROJECT_RULES.md** — Regras invioláveis do projeto:
   - Stack e versões exatas permitidas
   - Estrutura de pastas obrigatória
   - Convenções de código (idioma, naming, patterns)
   - Regras de UI/UX (paleta, bordas, espaçamento, responsividade)
   - Proibições explícitas (o que NUNCA fazer)

2. **ARCHITECTURE_MAP.md** — Inventário vivo do ecossistema, dividido em famílias:
   - Membros (UI Components): nome, o que faz, onde aparece
   - Neurônios (Helpers): nome, cálculo/tratamento, quem usa
   - Reflexos (Hooks): nome, estado que gerencia, store que consome
   - DNA (Data Schemas): estrutura de cada entidade persistida, campos obrigatórios
   - Caminhos (Routing): rota, componente, URL
   - Órgãos (Services): conexões externas (APIs, browser APIs)
   - Mapa de conexões visual (ASCII ou lista)
   - Changelog de integridade (toda alteração registrada com data)
   REGRAS: antes de criar algo novo, consulte este doc. Ao finalizar, atualize.
   Se algo novo quebrar uma conexão existente, pare e me avise.

3. **DECISIONS_LOG.md** — Registro de decisões arquiteturais:
   - Cada decisão com: data, o que foi decidido, por quê, consequências, quando revisar
   - Antes de refatorar qualquer padrão, ler este doc primeiro

4. **ERRORS_LOG.md** — Memória de cura:
   - Cada erro com: ID sequencial, descrição, causa raiz, solução aplicada, regra de prevenção
   - Antes de resolver um bug, verificar se já foi resolvido aqui

5. **ROADMAP.md** — Foco e controle de escopo:
   - Seção "Concluído" (checklist do que está pronto)
   - Seção "Backlog" (ordenada por prioridade, com instrução: NÃO implementar sem meu pedido)
   - Seção "Bugs Conhecidos"

Depois de criar os 5 docs, atualize o `.github/copilot-instructions.md` (ou crie se não existir)
com uma Seção 0 chamada "Documentos Obrigatórios" que lista os 5 docs acima com instrução de
quando consultar cada um. Esse é o único arquivo que o Copilot lê automaticamente —
ele precisa saber que os outros existem.

A partir daqui, toda tarefa que você fizer deve terminar com atualização do ARCHITECTURE_MAP.md.
Todo erro encontrado deve ser registrado no ERRORS_LOG.md.
Toda decisão não-óbvia deve ser registrada no DECISIONS_LOG.md.

---

## Descrição do Projeto

### O que é

Um editor visual onde tudo que o usuário cria no canvas é, de verdade, HTML e CSS.
Não há linguagem intermediária — o painel de propriedades exibe CSS real, a hierarquia de elementos
reflete o DOM real, e o código e o visual ficam sincronizados em tempo real.
Editar o código move o canvas. Mover um elemento atualiza o código.

O objetivo é eliminar a camada de tradução entre design e desenvolvimento:
um designer trabalha visualmente mas aprende CSS sem perceber,
e um dev lê o projeto como se fosse código — porque é.

### Usuário-alvo

Designers e desenvolvedores, com perfil técnico-visual. O próprio criador é o beta tester inicial.

---

## Stack

| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | React + Vite + TypeScript | Padrão, rápido, tipagem obrigatória |
| Canvas | DOM-based (HTML/CSS reais) | O canvas renderiza elementos HTML reais — o browser faz o layout CSS nativamente. Interatividade (drag, resize, seleção) via handlers JS sobre os próprios elementos DOM. Zoom/pan via CSS `transform`. Sem bibliotecas de canvas bitmap. |
| Editor de código | Monaco Editor | VS Code no browser |
| Persistência local | IndexedDB via `idb` | Robusto para projetos complexos |
| Offline | Vite PWA Plugin | Service worker simples de configurar |
| Estilização | Tailwind CSS | Utility-first para o app em si (não para o output do usuário) |

---

## Estrutura de Pastas

```
src/
  canvas/          # Área de edição visual (DOM-based: renderiza HTML real, zoom/pan, seleção, drag, resize)
  code-editor/     # Monaco Editor + sync bidirecional
  panels/
    layers/        # Painel de hierarquia de elementos
    properties/    # Painel de propriedades CSS do elemento selecionado
  tokens/          # Variáveis CSS, estilos globais, tokens de design
  components/      # Componentes reutilizáveis do próprio app
  hooks/           # Hooks globais (useProject, useHistory, useSync)
  store/           # Estado global (Zustand)
  services/        # Persistência local (IndexedDB), exportação
  types/           # Tipos TypeScript globais
  utils/           # Funções utilitárias (tree, parseHTML, serializeHTML, generateId)
```

---

## Roadmap

### Fase 1 — MVP
- [ ] Canvas DOM-based com elementos HTML reais arrastáveis: `div`, `section`, `article`, `nav`, `p`, `h1`–`h6`, `span`, `button`, `img`
- [ ] Painel lateral com propriedades CSS reais (flexbox, padding, margin, cor, tipografia, border, border-radius, sombra)
- [ ] Hierarquia de elementos (painel de layers) refletindo o DOM
- [ ] Editor de código (Monaco) sincronizado bidirecionalmente com o canvas em tempo real
- [ ] Salvar e carregar projeto localmente (arquivo JSON)
- [ ] Exportar projeto como HTML + CSS
- [ ] Funcionar offline (PWA)
- [ ] Undo / Redo (histórico de ações)

### Fase 2 — Design System
- [ ] Variáveis CSS (CSS Custom Properties) criadas e gerenciadas no painel
- [ ] Estilos globais reutilizáveis (classes CSS nomeadas, aplicáveis a múltiplos elementos)
- [ ] Tokens de design (cores, tipografia, espaçamento)

### Fase 3 — Componentes
- [ ] Componentes reutilizáveis com variantes
- [ ] Biblioteca de componentes do projeto

### Fase 4 — Output avançado
- [ ] Exportação como componentes React
- [ ] Exportação como componentes Vue
- [ ] Importação de código HTML/CSS existente

### Fase 5 — Integrações
- [ ] Plugin para Elementor (WordPress)
- [ ] Outros construtores de site

---

## Regras invioláveis

- **Nunca inventar conteúdo** nos docs de governança — usar "A definir" se não souber
- **Nunca implementar features do Backlog** sem pedido explícito
- **Nunca usar `any`** no TypeScript — tipagem estrita obrigatória
- **Sempre atualizar** o ARCHITECTURE_MAP.md ao fim de cada tarefa
- **Sempre registrar** erros no ERRORS_LOG.md antes de corrigi-los
- **Sempre registrar** decisões não-óbvias no DECISIONS_LOG.md
- O Monaco e o canvas são a espinha dorsal do app — qualquer mudança neles exige registro em DECISIONS_LOG.md
- A sincronização bidirecional código ↔ canvas é a feature mais crítica — nunca sacrificá-la por performance sem discussão

---

## Contexto adicional

- Projeto pessoal, sem prazo, sem time — desenvolvido pelo criador + IA (Copilot/Claude)
- O criador é o único beta tester na fase inicial
- Não há auth, cloud ou colaboração no MVP — tudo é local
- A visão de longo prazo é que o editor se torne um plugin para construtores de site populares,
  onde o designer cria no editor e o output é código limpo e utilizável diretamente no construtor
