# Setup Guide — Primeiros Passos

Este documento descreve como inicializar o projeto do zero.
Seguir esta ordem exatamente — não pular etapas.

---

## 1. Pré-requisitos

- Node.js 20+ instalado
- VS Code com extensão GitHub Copilot ativa
- Git instalado

---

## 2. Criar o projeto

```bash
npm create vite@latest . -- --template react-ts
```

Responder:
- Framework: **React**
- Variant: **TypeScript**

---

## 3. Instalar dependências

```bash
# Dependências principais
npm install @monaco-editor/react
npm install idb
npm install zustand
npm install uuid
npm install @types/uuid -D

# Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# PWA (offline)
npm install vite-plugin-pwa -D
```

---

## 4. Configurar Vite com PWA

Em `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Design-to-Code Editor',
        short_name: 'DTCEditor',
        theme_color: '#ffffff',
        icons: []
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

---

## 5. Estrutura de pastas a criar

```
src/
  canvas/
  code-editor/
  panels/
    layers/
    properties/
  tokens/
  components/
  hooks/
  store/
  services/
  types/
  utils/
```

```bash
mkdir -p src/canvas src/code-editor src/panels/layers src/panels/properties
mkdir -p src/tokens src/components src/hooks src/store src/services src/types src/utils
```

---

## 6. Criar os documentos de governança

Rodar o prompt de inicialização no Copilot Chat (arquivo `PROJECT_BRIEF.md`)
com a descrição do projeto. Os 5 docs serão criados na raiz:

```
PROJECT_RULES.md
ARCHITECTURE_MAP.md
DECISIONS_LOG.md
ERRORS_LOG.md
ROADMAP.md
```

E o arquivo de instruções do Copilot:

```
.github/copilot-instructions.md
```

---

## 7. Copiar os documentos de referência para a raiz

```
WIREFRAME.md          → layout visual do editor
DATA_SCHEMA.md        → estrutura de dados do projeto
GLOSSARY.md           → vocabulário oficial
INTERACTION_SPEC.md   → comportamentos e atalhos
```

---

## 8. Ordem de implementação recomendada

Implementar nesta ordem — nunca pular para a próxima fase sem a anterior estar funcionando:

### Fase A — Fundação
1. Tipos TypeScript (`src/types/`) — `ElementNode`, `Project`, `Token`, `GlobalStyle`
2. Store global (`src/store/`) — `selectedElement`, `project`, `history`
3. Funções de serialização (`src/utils/`) — `parseHTML`, `serializeHTML`, `generateId`

### Fase B — Canvas
4. Canvas DOM-based — renderizar a árvore de elementos como HTML real com zoom/pan via CSS transform
5. Seleção de elemento com clique
6. Inserção de elemento via Toolbar
7. Mover e redimensionar com handles JS sobre elementos DOM

### Fase C — Painéis
8. LayersPanel — árvore sincronizada com o canvas
9. PropertiesPanel — campos CSS do elemento selecionado

### Fase D — Código
10. CodeEditor com Monaco
11. Sincronização canvas → código
12. Sincronização código → canvas (com debounce)

### Fase E — Persistência
13. Salvar projeto no IndexedDB
14. Carregar projeto
15. Exportar HTML + CSS

### Fase F — Qualidade
16. Undo / Redo
17. Atalhos de teclado
18. PWA / offline

---

## Regra de ouro

**Nunca implementar a fase seguinte sem a atual estar funcionando e testada manualmente.**
A cada fase concluída, atualizar o `ROADMAP.md` e o `ARCHITECTURE_MAP.md`.
