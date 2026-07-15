# Bloco D — Redesenho Dashboard Pro (Diarista)

Aplicar a **mesma linguagem visual V3** já entregue no fluxo do cliente (Blocos A–C) às 12 telas do diarista, sem tocar em lógica de negócio, RLS, edge functions ou hooks.

## Princípios visuais (idênticos ao cliente)

- Verde primário `#19CC97`, azul profundo `#102A43`
- `rounded-2xl` / `rounded-3xl`, `border-border/60`, `shadow-sm`
- Header unificado: `bg-background/80 backdrop-blur-md`, botão back `size-10 rounded-full`, título + subtítulo
- Cards com ícones em `size-9/10 rounded-full` sobre `bg-primary/10` ou `bg-secondary`
- Bottom CTA `bg-card/95 backdrop-blur-md`, safe-bottom
- Motion: `framer-motion` com stagger sutil (delay 0.04–0.06) em listas
- Empty states humanos com ícone Lucide + copy curta
- Dark mode: só onde já existe (respeitando tokens)

## Escopo — 12 telas em 4 passes

### Passe 1 — Núcleo diário (3 telas)
- **ProHome** — hero de status (online/offline), stats do dia (ganhos, jobs, rating), lista de novos pedidos com stagger, CTA para agenda
- **ProAgenda** — segmented control (Hoje / Semana / Concluídos), timeline com marcadores, cards de job com hora + endereço
- **ProOrderDetail** — hero cliente/serviço, cards de rota, endereço, pagamento, botões de ação principal (aceitar/iniciar/finalizar)

### Passe 2 — Ganhos e crescimento (3 telas)
- **ProEarnings** — hero card com saldo grande, breakdown de comissão, gráfico/lista de últimos serviços, CTA sacar
- **ProWithdraw** — form limpo com valor destacado, dados bancários em card, resumo antes de confirmar
- **ProRanking** — pódio visual, posição do pro, lista de tops, badge de nível

### Passe 3 — Perfil e qualidade (3 telas)
- **ProProfile** — hero avatar + rating + jobs done, seções agrupadas (dados, docs, banking, preferências), menu list refinado
- **ProAvailability** — grade de dias/horários com toggles suaves, chips de zona
- **ProQuality** — score cards, checklist de boas práticas, badges conquistados

### Passe 4 — Suporte e onboarding (3 telas)
- **ProPlan** — hero do plano atual (Free/Pro/Elite), cards de upgrade com destaque no recomendado
- **ProSupport** — mesmo padrão do cliente (grid quick actions + lista + sheet novo ticket)
- **ProVerification** — stepper vertical de docs, cards de upload com status (pendente/aprovado/reprovado), copy explicativa por passo

## Fora de escopo
- Hooks de dados, mutations, RPCs, edge functions
- Fluxo B2B, admin, auth
- Componentes compartilhados (`OrderCard`, `PlanCard`, `SubscriptionCard`) — mantidos como estão; se precisarem de variant, versionamos sem quebrar cliente
- Dark mode novo (aplicar só onde já existe)

## Riscos e mitigação
- **ProProfile (588 linhas)** e **ProHome (476 linhas)**: telas densas — antes de editar, ler as áreas com hooks pesados; JSX de renderização é o único alvo
- **ProVerification (441 linhas)**: fluxo de upload frágil — preservar estados, refs de input, callbacks; só refinar wrapper visual
- **ProAgenda / ProWithdraw**: 345 linhas cada — cuidar da lógica de filtro e cálculo, editar só JSX

## Entregáveis por passe
1. Files changed (lista completa)
2. Screenshot mobile (390×844) via Playwright autenticado
3. Checklist visual: header ✓ · cards `rounded-2xl` ✓ · motion stagger ✓ · empty state ✓ · CTA fixo ✓
4. Confirmação de que hooks/tipos passam sem erro

## Ordem de execução
Passes sequenciais, um por turno. Após cada passe, aguardo confirmação para seguir.

**Próximo passo**: se aprovar, começo pelo **Passe 1 — ProHome, ProAgenda, ProOrderDetail**.
