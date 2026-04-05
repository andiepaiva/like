# ERRORS_LOG.md — Memória de Cura

> **Regra:** Antes de resolver um bug, verificar se já foi resolvido aqui.

---

| ID | Descrição | Causa raiz | Solução | Regra de prevenção |
|---|---|---|---|---|
| ERR-001 | Pasta `guidelines/` deletada durante scaffold | `Copy-Item -Recurse -Force` do temp-scaffold pode ter interferido com diretórios existentes na raiz | Recriar todos os 10 arquivos de guidelines a partir do conteúdo em memória | Nunca usar `Copy-Item -Recurse -Force` sobre um diretório que contém dados importantes. Preferir copiar arquivo por arquivo. |
