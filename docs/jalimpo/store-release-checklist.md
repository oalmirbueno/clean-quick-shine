# Já Limpo — Checklist de publicação nas lojas

Criado em 2026-07-06. O PWA em https://jalimpo.com continua no ar durante todo o
processo (rollback vivo). Publicação é aditiva.

## Identidade do app

- **Nome:** Já Limpo
- **Package/Bundle ID:** `br.com.jalimpo.app`
- **Categoria:** Estilo de vida (alt.: Casa e decoração / Serviços)
- **Descrição curta (Play, ≤80 chars):**
  "Diaristas de confiança em Brusque e região. Agende, pague e avalie no app."
- **Descrição longa (rascunho):** O Já Limpo conecta você a diaristas verificadas
  na sua região. Escolha o serviço, agende o melhor horário, pague com segurança
  pelo app (PIX/cartão) e acompanhe tudo em tempo real. Para diaristas: receba
  pedidos perto de você, gerencie sua agenda, acompanhe seus ganhos e receba via
  PIX. Operação com verificação de documentos, termos claros e suporte próximo.

## URLs públicas (após deploy deste release)

| Requisito | URL |
|---|---|
| Site | https://jalimpo.com |
| Política de privacidade | https://jalimpo.com/privacy |
| Termos de uso | https://jalimpo.com/terms |
| Suporte | https://jalimpo.com/support |
| Exclusão de conta (Play Data safety / App Store) | https://jalimpo.com/account-deletion |

## Google Play (Android)

- [ ] Conta Google Play Console no **CNPJ da Já Limpo** (taxa única US$ 25)
- [ ] Keystore de release gerado e guardado em cofre (perder = nunca mais atualizar o app) — recomendado: Play App Signing
- [ ] Build AAB de release (`cd android && gradlew bundleRelease`) — requer JDK 21 + Android SDK
- [ ] Data safety preenchido: coleta nome/e-mail/telefone/endereço/localização/fotos de documentos; pagamento via Asaas; exclusão self-service
- [ ] Declaração de permissões: localização (mapa/atendimento), câmera (verificação de documentos)
- [ ] Screenshots (mín. 2, tel. 16:9 ou 9:16), ícone 512×512, feature graphic 1024×500
- [ ] Classificação de conteúdo (livre)
- [ ] Faixa de **teste interno** primeiro (até 100 testadores, sem review completa) → depois produção
- [ ] App Links: publicar `https://jalimpo.com/.well-known/assetlinks.json` com o SHA-256 do certificado de release

## App Store (iOS)

- [ ] Apple Developer Program no CNPJ (US$ 99/ano) — pessoa jurídica exige D-U-N-S
- [ ] Mac com Xcode **ou** build em nuvem (Codemagic / Ionic Appflow) — não há Mac neste ambiente
- [ ] Certificados + provisioning profiles (via Xcode ou serviço de build)
- [ ] App Store Connect: ficha do app, privacy labels (mesmo escopo do Data safety), screenshots (6.7" e 5.5")
- [ ] Universal Links: publicar `https://jalimpo.com/.well-known/apple-app-site-association`
- [ ] Revisão da Apple costuma exigir conta de teste — preparar credenciais de demonstração (cliente e diarista)
- [ ] TestFlight para beta antes da produção

## Pendências de produto antes do release

- [ ] Ícone/splash nativos finais (gerar com `npx @capacitor/assets generate` a partir de logo 1024×1024)
- [ ] Deploy do frontend com as rotas `/support` e `/account-deletion` no ar
- [ ] Push nativo (FCM/APNs) — fase futura; beta usa notificação in-app/e-mail
- [ ] Teste em aparelho Android real (login com usuário existente, pedido, mapa, upload de documento)
- [ ] Congelamento: nenhuma mudança de schema/auth na semana da publicação
