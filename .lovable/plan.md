# Bloco C — Redesenho moderno do fluxo do cliente

Escopo confirmado: **14 telas do cliente**, redesenho moderno (padrão Uber/Rappi/Rappi-like), aplicando a identidade V3 já instalada. Somente **UI/presentation** — hooks, mutations, RLS, rotas e edge functions permanecem intocados.

## Princípios visuais (locked pela V3)

- **Paleta**: Verde `#19CC97` (primary CTA), Azul profundo `#102A43` (superfícies dark, headers), branco puro, cinzas neutros. Sem gradientes agressivos, sem cor extra.
- **Tipografia**: hierarquia atual (Inter/system) com pesos SemiBold em títulos, tracking justo em números financeiros. Wordmark "jálimpo" sempre em minúsculas.
- **Forma**: `rounded-2xl` padrão, `rounded-3xl` em superfícies elevadas (hero, sheets), `border-border/60`, `shadow-sm`. Sem card duplo, sem sombra pesada.
- **Espaçamento**: respiro amplo (`p-5`/`p-6` mínimo em sheets), listas com `gap-3`, seções separadas por `space-y-6`.
- **Motion**: framer-motion sutil (`layout`, `whileTap 0.98`, entrada `fade + slide 8px`, 200–300ms). Sem parallax, sem confetti.
- **Dark mode**: só nas telas que já suportam hoje; não vou forçar dark novo.

## Padrões de redesenho aplicados a todas as telas

1. **Header consistente**: barra fina com back button `size-10 rounded-full`, título centralizado ou à esquerda, ação à direita. Sem card dentro do header.
2. **Hero contextual**: no topo, um bloco com o dado mais importante da tela (saldo, próximo pedido, status do serviço), em superfície `bg-secondary/40` com respiro.
3. **CTAs primários fixos**: sticky bottom com sombra sutil, `PrimaryButton` full-width, verde V3.
4. **Cards resumidos, não empilhados**: um card = uma decisão. Metadados em linha única com ícone Lucide 16px.
5. **Estados vazios humanos**: ilustração via ícone Lucide grande + copy curta + CTA único.
6. **Skeletons**: já existem — reutilizar e adicionar onde faltar.

## Telas e mudanças específicas

### Grupo 1 — Núcleo diário (3)
- **ClientHome**: hero "Olá, {nome}" com próximo agendamento em destaque; grid 2×2 de serviços vira **bento assimétrico** (Residencial ocupa 2 colunas, demais 1); chips de sugestão em scroll horizontal com fade nas bordas.
- **ClientOrders**: tabs viram segmented control pill; cards com timeline mini (dot + linha) indicando etapa; empty state redesenhado.
- **ClientProfile**: header com avatar grande e nome; menu agrupado em seções ("Conta", "Preferências", "Ajuda"); logout no rodapé, versão discreta.

### Grupo 2 — Booking (6)
- **ClientService**: seleção como cards grandes com ícone + descrição curta + faixa de preço.
- **ClientSchedule**: date picker inline (não modal) + grid de horários com estados (disponível/ocupado); resumo sticky no rodapé.
- **ClientLocation**: mapa Leaflet ocupa 60% da tela, sheet inferior com endereço editável e CTA.
- **ClientMatching**: full-screen com animação de busca (pulse concêntrico verde), copy dinâmica, botão "cancelar busca" discreto.
- **ClientOffer**: card único centralizado com avatar da pro, rating, preço destacado, CTAs "aceitar" (verde) e "próxima" (ghost).
- **ClientCheckout**: resumo em cima, MoneyBreakdown claro, seleção de pagamento em radio cards, CTA sticky com valor.

### Grupo 3 — Pós-pedido (4)
- **ClientOrderTracking**: mapa em cima, sheet inferior arrastável com status atual, ETA, dados da pro, botões chat/ligar.
- **ClientOrderDetail**: timeline vertical + MoneyBreakdown + ações contextuais por status.
- **ClientRating**: 5 estrelas grandes tap target 48px + chips de feedback ("pontual", "atenciosa"...) + textarea opcional.
- **ClientCancel**: já está bem; refino de warning card (verde/âmbar) + policy em accordion.

### Grupo 4 — Auxiliares (3)
- **ClientSupport**: lista de tickets em cards com badge de status; FAB para novo ticket; modal de criação simplificado.
- **ClientSubscription**: PlanCards lado a lado com destaque no plano atual; tabela de benefícios enxuta.
- **ClientReferral**: hero com código grande copiável + share; contador de convites; regras em accordion.

## Fora do escopo (não vou tocar)

- Hooks, mutations, tipos, RLS, edge functions, roteamento, autenticação.
- Fluxo Pro, Admin, B2B.
- Regras de negócio (preços, cancelamento, matching, splits).

## Entrega em passes

Para não fazer um turno gigante e frágil, vou dividir em **4 passes** (um por grupo), cada um em um turno:
1. Passe 1 — Grupo 1 (Home/Orders/Profile)
2. Passe 2 — Grupo 2 (Booking)
3. Passe 3 — Grupo 3 (Pós-pedido)
4. Passe 4 — Grupo 4 (Auxiliares)

Cada passe termina com: arquivos alterados, screenshots (Playwright) das telas redesenhadas em light+dark quando aplicável, e checklist do que ficou.

## Riscos

- Muitos hooks retornam shapes específicos — vou ler o hook antes de mexer no JSX de cada tela para não quebrar tipagem.
- Leaflet + sheet arrastável no Tracking exige cuidado com z-index e safe areas.
- Alguns componentes (`OrderCard`, `ServiceCard`, `PlanCard`) são compartilhados — vou versionar via variant, não substituir, para não afetar Pro/Admin.

Aprovando este plano, começo pelo **Passe 1 — Grupo 1** no próximo turno.