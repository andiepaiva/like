Guarda esse prompt — é a primeira coisa que você manda ao Copilot em qualquer projeto novo:

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


Use esse prompt logo após criar o projeto (depois do scaffold/npm init). Descreva o projeto em seguida e os docs serão preenchidos com base na sua descrição.
