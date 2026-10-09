# Guia de publicação do Já Limpo nas lojas

Ordem pensada para não travar: cada etapa libera a seguinte. O código do app já
está pronto para as duas lojas. O que falta aqui são contas, chaves e cliques
que só o dono da empresa pode fazer.

Empresa: **JA LIMPO LTDA** · CNPJ **69.485.100/0001-51** · Brusque/SC
App: **Já Limpo** · identificador `br.com.jalimpo.app` (Android e iPhone)

Textos das lojas, respostas de privacidade e notas para o revisor estão em
[LISTAGEM-LOJAS.md](LISTAGEM-LOJAS.md). As artes estão em
`Videos/jalimpo-prelancamento/lojas/`.

---

## 0. Antes de tudo (destrava o resto)

### 0.1 Caixa de e-mail suporte@jalimpo.com
O domínio jalimpo.com hoje **não recebe e-mail** (não tem registro MX). As duas
lojas exigem e-mail de contato que funcione, e a Apple manda a verificação para
ele.

1. Hostinger → E-mails → criar a caixa `suporte@jalimpo.com` (ou usar Google
   Workspace / Zoho).
2. Aplicar os registros MX/SPF que o painel mostrar no DNS do jalimpo.com.
3. Testar: mandar um e-mail do Gmail para suporte@jalimpo.com e ver se chega.

### 0.2 Corrigir o contato do CNPJ
No cartão do CNPJ, o e-mail e o telefone são do contador
(GUILHERMESONZA@OUTLOOK.COM, (47) 9951-6699). A D-U-N-S e a Apple usam esses
dados para confirmar a empresa por telefone ou e-mail.

- Peça ao contador para atualizar o e-mail e o telefone da empresa na Receita
  para os seus (REDESIM), **ou**
- avise que a Apple/D&B podem ligar para ele e que ele precisa repassar.

### 0.3 Número D-U-N-S (grátis, as duas lojas pedem)
1. Acesse https://developer.apple.com/enroll/duns-lookup/ e procure por
   "JA LIMPO LTDA", Brusque/SC.
2. Se não existir (empresa aberta em 05/10/2026, então provavelmente não
   existe), clique em **Submit your information** e preencha **igual ao
   cartão do CNPJ**: razão social, endereço (R Florentino Gilli 1000, Bloco 4
   Apt 32, Limeira Baixa, Brusque/SC, 88356-100) e telefone.
3. Prazo: até 5 dias úteis para a D&B criar o número, e mais até 2 dias para a
   Apple enxergar.

### 0.4 Administração conjunta
O Contrato Social diz que a administração é **conjunta** (Almir e Marli). Na
inscrição da Apple, quem assina declara ter "autoridade legal para vincular a
empresa". Para evitar recusa:

- peça à Marli uma autorização simples por escrito (assinada, pode ser
  digital pelo gov.br) dizendo que o Almir pode criar e administrar as contas
  de desenvolvedor da Apple e do Google em nome da JA LIMPO LTDA;
- guarde em PDF. A Apple às vezes pede por e-mail.

---

## 1. Google Play (US$ 25, pagamento único)

Conta de **organização** (não pessoal). Conta de organização **não** precisa do
teste fechado com 12 testadores por 14 dias que as contas pessoais novas exigem.

1. https://play.google.com/console/signup → **Uma organização**.
2. Use a D-U-N-S, a razão social **JA LIMPO LTDA**, o site https://jalimpo.com
   e o e-mail suporte@jalimpo.com. Pague os US$ 25 com cartão.
3. Verificação de identidade do Google (documento + às vezes vídeo): de 1 a 7
   dias.
4. **Criar app** → nome "Já Limpo", idioma Português (Brasil), App, Gratuito.

### 1.1 Primeiro envio (manual, uma vez só)
O Google só libera envio automático depois que o app tem a primeira versão.

1. Rode o workflow **android-release** no Codemagic (seção 4). Ele vai falhar
   na publicação, porque o app ainda não tem versão, mas o arquivo `.aab` sai nos
   artefatos. Baixe o arquivo.
2. Play Console → Testar e lançar → **Teste interno** → Criar versão → enviar o
   `.aab`.
3. Na mesma tela, aceite a **Assinatura de apps do Google Play** (Play App
   Signing). Com ela, se a chave de upload se perder, dá para trocar.
4. Daqui em diante o Codemagic envia sozinho como **rascunho** no teste interno.

### 1.2 Página da loja e formulários
Copie tudo de [LISTAGEM-LOJAS.md](LISTAGEM-LOJAS.md):

- **Página principal da loja:** nome, descrição curta, descrição completa,
  ícone `lojas/arte/icone-playstore-512.png`, gráfico de recursos
  `lojas/arte/destaque-play-1024x500.png`, capturas
  `lojas/capturas/play-celular/01..08.png`.
- **Conteúdo do app:** Política de privacidade (`https://jalimpo.com/privacy`),
  Acesso ao app (conta de teste, ver `Documents/JaLimpo-Lojas/ACESSOS-REVISAO.txt`),
  Anúncios = não, Classificação de conteúdo (questionário IARC), Público-alvo =
  18+, **Segurança dos dados** (respostas prontas na listagem), App de
  governo = não, Recursos financeiros = não (o app não é banco nem carteira).
- **Exclusão de conta:** URL `https://jalimpo.com/account-deletion`.
- **Permissão de localização em segundo plano:** o app **não** pede. Se o
  formulário perguntar, responda que não usa.

### 1.3 Ligar o envio automático (Codemagic → Play)
1. Google Cloud Console → crie um projeto "jalimpo-play" → IAM → Contas de
   serviço → criar `codemagic-play` → Chaves → Adicionar chave JSON (baixa um
   arquivo).
2. Ative a **Google Play Android Developer API** nesse projeto.
3. Play Console → Usuários e permissões → Convidar novo usuário → e-mail da
   conta de serviço → permissões do app Já Limpo: *Lançar no teste*, *Gerenciar
   versões de teste*, *Ver informações do app*.
4. Codemagic → Team settings → Global variables → grupo **jalimpo_play** →
   variável `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` com o conteúdo do JSON (marcar
   como *Secure*).

### 1.4 Do teste interno para a produção
Teste interno (até 100 pessoas, sem revisão demorada) → quando estiver bom,
**Promover versão → Produção**. A primeira revisão de produção leva de 1 a 7
dias.

Para os 650 beta testers: use **Teste aberto** (sem limite, qualquer um entra
pelo link) ou **Teste fechado** com uma lista de e-mails / Grupo do Google.

---

## 2. Apple (US$ 99 por ano)

### 2.1 Inscrição como organização
1. No iPhone, app **Apple Developer** → Inscrever-se → **Organização** (a
   inscrição pelo app é mais rápida que pelo site).
2. Apple ID: use um seu com autenticação de dois fatores ligada.
3. Dados: razão social **JA LIMPO LTDA** (exatamente igual à D-U-N-S), D-U-N-S,
   site https://jalimpo.com, e-mail de trabalho **suporte@jalimpo.com** (a
   Apple recusa Gmail nesse campo).
4. A Apple pode ligar para confirmar. Atenda número desconhecido nesses dias.
5. Pague os US$ 99. Aprovação: 2 a 14 dias.

### 2.2 Identificador do app e recursos
developer.apple.com → Certificates, IDs & Profiles → Identifiers → **+** →
App IDs → App:

- Description: Já Limpo · Bundle ID explícito: `br.com.jalimpo.app`
- Capabilities: marcar **Push Notifications** e **Associated Domains**.

Anote o **Team ID** (canto superior direito, 10 caracteres). Ele vai para a
seção 5 (links universais) e para o segredo `APNS_TEAM_ID`.

### 2.3 Chave de push (APNs)
Keys → **+** → nome "Já Limpo push" → marcar **Apple Push Notifications
service (APNs)** → Continue → Download. O arquivo `.p8` **só baixa uma vez**.
Guarde em `Documents/JaLimpo-Lojas/chaves/`. Anote o **Key ID**.

### 2.4 Criar o app no App Store Connect
https://appstoreconnect.apple.com → Apps → **+** → Novo app:

- Plataforma iOS · Nome **Já Limpo** · Idioma principal Português (Brasil)
- Bundle ID `br.com.jalimpo.app` · SKU `jalimpo-ios-001` · Acesso total

### 2.5 Chave de API para o Codemagic
App Store Connect → Usuários e acesso → Integrações → App Store Connect API →
Chaves da equipe → **+** → nome "Codemagic", acesso **App Manager** → baixe o
`.p8` e anote o **Issuer ID** e o **Key ID**.

Codemagic → Team settings → Integrations → **Developer Portal** → Connect →
nome **jalimpo_asc** → Issuer ID, Key ID e o arquivo `.p8`.

### 2.6 Certificado de distribuição (sem Mac)
Codemagic → Team settings → codemagic.yaml settings → Code signing identities →
**iOS certificates** → Generate certificate → tipo *Apple Distribution*, usando
a integração jalimpo_asc. Depois, em **iOS provisioning profiles** → Fetch
profiles. O codemagic.yaml já pede o perfil App Store de `br.com.jalimpo.app`.

### 2.7 Página da loja e privacidade
Tudo em [LISTAGEM-LOJAS.md](LISTAGEM-LOJAS.md):

- Capturas 6,9" `lojas/capturas/iphone-6.9/01..08.png` (1290×2796). A Apple
  reduz sozinha para os tamanhos menores.
- **Novo:** imagem de cabeçalho da página do produto
  `lojas/arte/cabecalho-appstore-3840x1646.png` e
  `lojas/arte/cabecalho-appstore-5244x2950.png`. É a novidade do App Store
  Connect do post do X que você mandou. Se o campo ainda não aparecer na sua
  conta, pule esta parte, porque ela não bloqueia a publicação.
- Privacidade do app (as respostas "Dados vinculados a você"), classificação
  etária, categoria, URL de suporte `https://jalimpo.com/support`, URL de
  privacidade `https://jalimpo.com/privacy`.
- Informações para a revisão: conta de teste + notas (texto pronto).

### 2.8 TestFlight e envio
O workflow **ios-release** manda cada build para o TestFlight. Com o build lá:

- **Testes internos:** até 100 pessoas da equipe, na hora.
- **Testes externos:** até 10.000 pessoas por link público (os 650 beta
  testers). O primeiro build externo passa por uma revisão rápida (em geral
  menos de 1 dia).
- Para publicar: na versão 1.0.0, escolha o build → **Enviar para revisão**.

---

## 3. Push nativo (Firebase + Apple)

Sem esta etapa o app funciona normalmente, só não toca notificação com o app
fechado.

### 3.1 Banco: já pronto
A migração `supabase/migrations/20261007120000_push_nativo.sql` já foi aplicada
no banco próprio (Supabase `jalimpo`, ref `grqwwpxpmcwailkxbbbj`) em 09/10/2026:
tabela dos aparelhos, gatilho e pg_net ligados. Nada a fazer aqui.

Conferir depois:
```sql
select count(*) from public.device_tokens;   -- 0 (tabela existe)
select tgname from pg_trigger where tgname = 'trg_disparar_push';
```

### 3.2 Firebase (Android)
1. https://console.firebase.google.com → Adicionar projeto "Ja Limpo" (pode
   desligar o Analytics).
2. Adicionar app → Android → pacote `br.com.jalimpo.app` → baixar
   **google-services.json**.
3. No PowerShell, gere o base64 do arquivo:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\Downloads\google-services.json")) | Set-Clipboard
   ```
   Codemagic → grupo **jalimpo_firebase** → variável `GOOGLE_SERVICES_JSON`
   (Secure) → colar.
4. Firebase → Configurações do projeto → **Contas de serviço** → Gerar nova
   chave privada → baixa um JSON.

### 3.3 Segredos da função push-dispatch
Pelo terminal, na pasta do projeto (um por vez):
`npx supabase secrets set --project-ref grqwwpxpmcwailkxbbbj NOME=valor`
ou no painel: supabase.com/dashboard → projeto **jalimpo** → Edge Functions →
**Secrets**.

| Nome | Valor |
|---|---|
| `FCM_SERVICE_ACCOUNT` | conteúdo inteiro do JSON da conta de serviço do Firebase |
| `APNS_KEY` | conteúdo inteiro do arquivo `.p8` da seção 2.3 (com as linhas BEGIN/END) |
| `APNS_KEY_ID` | Key ID da chave de push (10 caracteres) |
| `APNS_TEAM_ID` | Team ID da conta Apple |

A função `push-dispatch` já está publicada no projeto jalimpo.

### 3.4 Testar
1. Instale o build do teste interno/TestFlight, entre com a conta de diarista,
   aceite as notificações.
2. `select platform, created_at from device_tokens;` deve ter 1 linha.
3. Crie um pedido com a conta de cliente. A diarista recebe o push com o app
   fechado.
4. Se não chegar: `select status, error, payload from notification_dispatch_logs where type = 'push_nativo' order by created_at desc limit 5;`
   - `{"sem_config":1}` → faltou segredo
   - `{"token_invalido":1}` → app reinstalado, abra de novo para renovar
   - `erro_403` no iPhone → Team ID ou Key ID trocados

---

## 4. Codemagic (build na nuvem, inclusive iPhone sem Mac)

1. https://codemagic.io → entrar com o GitHub → adicionar o repositório
   `oalmirbueno/clean-quick-shine` → escolher **codemagic.yaml**.
2. Plano gratuito da conta pessoal: 500 minutos por mês na máquina macOS M2
   (os dois workflows usam ela), o que dá cerca de 20 a 30 builds por mês. Na
   conta pessoal, os menus abaixo ficam em **User settings** em vez de *Team
   settings*. Os nomes (jalimpo_upload, jalimpo_play, jalimpo_firebase,
   jalimpo_asc) continuam os mesmos.
3. **Chave Android:** Team settings → Code signing identities → Android
   keystores → Upload:
   - arquivo `Documents/JaLimpo-Lojas/chaves/jalimpo-upload.keystore`
   - **Reference name:** `jalimpo_upload`
   - senha do keystore, alias `jalimpo-upload` e senha da chave: as duas
     senhas estão no `SENHA-CHAVE-UPLOAD.txt`.
4. Grupos de variáveis: **jalimpo_play** (seção 1.3) e **jalimpo_firebase**
   (seção 3.2).
5. Integração Apple **jalimpo_asc** (seção 2.5).
6. Rodar: Start new build → workflow **android-release** ou **ios-release**,
   branch `main`.

O número da versão sobe sozinho a cada build. Para lançar a versão 1.1.0,
troque `versionName` em `android/app/build.gradle` e `MARKETING_VERSION` no
projeto iOS.

---

## 5. Links universais (abrir jalimpo.com direto no app)

Opcional para o lançamento. Sem isso, os links abrem no navegador como hoje.
O app já está preparado (`AndroidManifest.xml` e `App.entitlements`). Faltam os
dois arquivos no site.

Os modelos estão em [../jalimpo/deep-links-templates.md](../jalimpo/deep-links-templates.md).
Preencha com:

- **Android:** o SHA-256 da *chave de assinatura do app* (Play Console →
  Integridade do app → Assinatura de apps). Coloque também o da chave de
  upload, que está no `SENHA-CHAVE-UPLOAD.txt`.
- **iOS:** o Team ID.

Publique em `public/.well-known/` e confira se
`https://jalimpo.com/.well-known/assetlinks.json` abre como JSON.

---

## 6. Checklist final antes de "Enviar para revisão"

- [ ] suporte@jalimpo.com recebe e-mail
- [ ] conta de cliente de teste entra; conta de diarista de teste aprovada
- [ ] há diarista aprovada atendendo Brusque/SC (o revisor precisa ver alguém)
- [ ] https://jalimpo.com/privacy, /terms, /support e /account-deletion abrem
- [ ] build testado num Android real e num iPhone real (teste interno/TestFlight)
- [ ] permissão de localização: aparece **uma** vez, com o texto em português
- [ ] botão voltar do Android: volta de tela e, na tela inicial, minimiza
- [ ] links de termos/privacidade abrem dentro do app (navegador interno)
- [ ] notificação com o app fechado chega (se a seção 3 foi feita)
- [ ] número de WhatsApp de suporte preenchido em `src/lib/empresa.ts`
      (vazio = botão escondido; a loja não reclama, mas ajuda o cliente)

## Motivos comuns de recusa e o que já foi tratado

| Regra | Situação |
|---|---|
| Apple 4.2: app que é só um site | Tem push nativo, GPS nativo, navegador interno, voltar nativo e splash. Nas notas, explicar que é marketplace com dois lados (cliente e diarista) e rastreamento em tempo real. |
| Apple 5.1.1(v): exclusão de conta | Existe em Perfil → Excluir conta e em /account-deletion |
| Apple 1.2: conteúdo entre usuários | Chat com **Denunciar** (vira chamado prioritário no suporte) e contato publicado |
| Apple 3.1.1: pagamento | Serviço físico (limpeza), então pagar fora da Apple é permitido (3.1.3(e)) |
| Apple 2.1: conta de teste não funciona | Conferir as contas no dia do envio |
| Google: Segurança dos dados incompleta | Respostas prontas na listagem |
| Google: permissão de localização | Só "durante o uso" e com explicação na tela |
