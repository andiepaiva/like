# DECISIONS_LOG.md — Registro de Decisões Arquiteturais

> **Regra:** Antes de refatorar qualquer padrão, ler este doc primeiro.

---

## DEC-001 — Canvas DOM-based em vez de Konva.js

- **Data:** 2026-04-05
- **Decisão:** Usar elementos HTML reais no canvas em vez de Konva.js (canvas bitmap)
- **Por quê:** Konva renderiza num `<canvas>` bitmap — teria que reimplementar manualmente todo o layout CSS (flex, grid, gap). Contradiz a premissa do projeto ("tudo é HTML/CSS real"). Com DOM-based, o browser faz o layout nativamente.
- **Consequências:** Zoom/pan via CSS `transform: scale()`. Drag/resize via handlers JS sobre elementos DOM. Sem dependência de biblioteca de canvas.
- **Revisar quando:** Se performance degradar com centenas de elementos no DOM

---

## DEC-002 — Posição dos elementos via CSS, não via metadata

- **Data:** 2026-04-05
- **Decisão:** Remover `meta.x` / `meta.y` do ElementMeta. Posição vem exclusivamente de `styles` (CSS `top`, `left`, `position`)
- **Por quê:** Duas fontes de verdade para posição gera inconsistência inevitável. CSS é a fonte de verdade.
- **Consequências:** Elementos no fluxo normal usam layout CSS (flex, grid). Drag em elementos `static` reordena entre irmãos.
- **Revisar quando:** Nunca — é princípio fundamental

---

## DEC-003 — className como array em vez de string

- **Data:** 2026-04-05
- **Decisão:** `className?: string[]` em vez de `className?: string`
- **Por quê:** Suportar múltiplas GlobalStyles no mesmo elemento sem parsing de strings
- **Consequências:** Serialização precisa fazer `.join(' ')` ao gerar HTML
- **Revisar quando:** Se o schema precisar ser simplificado

---

## DEC-004 — Tailwind CSS para o app, não para output do usuário

- **Data:** 2026-04-05
- **Decisão:** Usar Tailwind para estilizar a UI do editor. O output do usuário é CSS inline/classes puras — sem Tailwind.
- **Por quê:** Tailwind acelera o desenvolvimento do app sem poluir o código que o usuário exporta
- **Consequências:** Duas camadas de CSS: Tailwind (app) e CSS puro (output do usuário)
- **Revisar quando:** Se houver conflito entre classes Tailwind e estilos do canvas

---

## DEC-005 — 3 docs de governança em vez de 5

- **Data:** 2026-04-05
- **Decisão:** Manter ARCHITECTURE_MAP, DECISIONS_LOG, ERRORS_LOG. Não criar PROJECT_RULES (redundante com guidelines) nem ROADMAP separado (já está no PROJECT_BRIEF).
- **Por quê:** Evitar duas fontes de verdade. Os guidelines já cobrem rules e roadmap com mais detalhe.
- **Consequências:** Menos docs para manter sincronizados
- **Revisar quando:** Se os guidelines ficarem desatualizados e um doc centralizado for necessário

---

## DEC-006 — PWA adiada (vite-plugin-pwa incompatível com Vite 8)

- **Data:** 2026-04-05
- **Decisão:** Não instalar vite-plugin-pwa agora. Será adicionado na Fase F quando houver compatibilidade.
- **Por quê:** vite-plugin-pwa@1.2.0 suporta até Vite 7. Projeto usa Vite 8.
- **Consequências:** App não funciona offline no MVP — aceitável pois é ferramenta desktop local
- **Revisar quando:** vite-plugin-pwa lançar versão compatível com Vite 8

---

## DEC-007 — Drag força `position: absolute` silenciosamente

- **Data:** 2026-04-05
- **Decisão:** Quando usuário inicia drag num elemento com `position: static` ou `relative`, o código muda para `position: absolute` sem adicionar entrada no histórico
- **Por quê:** Undo/redo ocorre como bloco único (pushHistory no mousedown). A mudança de position é consequência necessária do drag, não uma ação independente.
- **Consequências:** Elemento muda para absolute e recebe `left: 0px, top: 0px` (preserva visibilidade durante drag inicial). Undo restaura posição pré-drag E o position original.
- **Revisar quando:** Se o UX indicar que usuários esperam poder reverter "position: absolute" separadamente do undo

---

## DEC-008 — Grid desligado por padrão

- **Data:** 2026-04-05
- **Decisão:** `showGrid: false` em DEFAULT_CANVAS
- **Por quê:** UX limpo — grid visual pode distrair. Usuário liga via Menu > Exibir > Mostrar grid quando precisa alinhar
- **Consequências:** Canvas começa vazio de padrão, sem padrão visual
- **Revisar quando:** Se feedback indicar que iniciantes esperam grid sempre visível
