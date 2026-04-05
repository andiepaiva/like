# Copilot Instructions — Design-to-Code Editor

## Seção 0 — Documentos Obrigatórios

Antes de implementar qualquer feature, consultar os documentos relevantes:

### Guidelines (referência de especificação)
- `guidelines/PROJECT_BRIEF.md` — Visão geral, stack, roadmap, regras invioláveis
- `guidelines/DATA_SCHEMA.md` — Tipos: Project, ElementNode, CSSProperties, DesignTokens, GlobalStyle
- `guidelines/STATE_SPEC.md` — Store Zustand, seletores, regras de mutação, undo/redo
- `guidelines/SYNC_SPEC.md` — Sincronização bidirecional canvas ↔ código, flag isExternalUpdate
- `guidelines/INTERACTION_SPEC.md` — Comportamentos de UI, atalhos, eventos
- `guidelines/ANTI_PATTERNS.md` — 14 proibições (AP-01 a AP-14). Consultar ANTES de implementar.
- `guidelines/EDGE_CASES.md` — 23 casos-limite (EC-01 a EC-23). Consultar ao implementar cada feature.
- `guidelines/GLOSSARY.md` — Vocabulário oficial, naming conventions, idioma
- `guidelines/WIREFRAME.md` — Layout visual do editor
- `guidelines/SETUP_GUIDE.md` — Ordem de setup e implementação (Fases A-F)

### Governança (documentos vivos — atualizar durante o trabalho)
- `ARCHITECTURE_MAP.md` — Atualizar ao fim de cada fase concluída
- `DECISIONS_LOG.md` — Registrar toda decisão não-óbvia ANTES de implementar
- `ERRORS_LOG.md` — Registrar todo erro encontrado ANTES de corrigi-lo

### Regras de idioma
- Código (variáveis, funções, componentes, comentários): **inglês**
- UI exibida ao usuário: **português**
- Documentação de governança e guidelines: **português**
