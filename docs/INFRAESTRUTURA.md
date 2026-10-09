# Infraestrutura do Já Limpo

Atualizado em 09/10/2026, quando o projeto saiu do Lovable e passou a rodar em
contas próprias da empresa (JA LIMPO LTDA).

## Visão geral

| Peça | Onde roda | Plano |
|---|---|---|
| Site e app web (React + Vite, PWA) | Cloudflare Workers, Worker `jalimpo` | Grátis |
| Domínio jalimpo.com (DNS) | Cloudflare, nameservers nitin/rafe | Grátis (registro continua na Hostinger) |
| E-mail suporte@ e contato@ | Cloudflare Email Routing → Gmail do dono | Grátis |
| Banco, login, arquivos, tempo real | Supabase, projeto `jalimpo` (ref `grqwwpxpmcwailkxbbbj`), São Paulo | Grátis (organização "Já Limpo") |
| Funções de servidor (pagamento, saque, push...) | Supabase Edge Functions do mesmo projeto | Grátis |
| Pagamentos | Asaas (produção) | por transação |
| Apps Android e iPhone | Capacitor 8, build no Codemagic | Grátis (500 min/mês) |
| Código | GitHub `oalmirbueno/clean-quick-shine`, branch `main` | Grátis |

## Publicar o site

```bash
npm run publicar
```

Faz `vite build` e `wrangler deploy`. A configuração está em `wrangler.jsonc`
(arquivos de `dist/`, fallback de SPA, jalimpo.com e www como domínios do Worker).
Os cabeçalhos de cache estão em `public/_headers`. O wrangler desta máquina já
está logado na conta Cloudflare do dono.

Endereço de teste, que serve a mesma versão: https://jalimpo.almirbarrosbueno.workers.dev

## Banco de dados

- Painel: supabase.com/dashboard → organização **Já Limpo** → projeto **jalimpo**
- Senha do Postgres: `Documents/JaLimpo-Lojas/chaves/SUPABASE-BANCO.txt` (fora do Git)
- A estrutura vem inteira de `supabase/migrations/` (61 arquivos). Mudança nova
  de banco = arquivo novo nessa pasta + `npx supabase db push`.
- Chave pública (anon) e URL ficam no `.env`. Essa chave é pública por desenho;
  a segurança está nas regras RLS das tabelas.
- O plano grátis pausa o projeto após 7 dias sem uso. O GitHub Action
  `.github/workflows/manter-banco-acordado.yml` faz uma consulta por dia para
  isso não acontecer.

### Funções (Edge Functions)

Publicar uma função:

```bash
npx supabase functions deploy NOME --project-ref grqwwpxpmcwailkxbbbj --use-api
```

O `verify_jwt` de cada uma está em `supabase/config.toml`.

Segredos usados pelas funções (Edge Functions → Secrets):

| Segredo | Situação |
|---|---|
| `ASAAS_API_KEY` | **falta**: gerar no Asaas e cadastrar |
| `ASAAS_ENVIRONMENT` | `production` |
| `ASAAS_WEBHOOK_TOKEN` | cadastrado; o mesmo valor vai no Asaas (`Documents/JaLimpo-Lojas/chaves/ASAAS-WEBHOOK.txt`) |
| `FCM_SERVICE_ACCOUNT`, `APNS_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID` | push nativo, ver `docs/lojas/GUIA-PUBLICACAO.md` seção 3 |

### Login

Configurado em `supabase/config.toml` (`[auth]`) e enviado com `npx supabase config push`:
site `https://jalimpo.com`, URLs de retorno do site, do app nativo e do endereço
de teste, e entrada sem confirmação de e-mail (como era antes).

**Pendente:** e-mail de "esqueci minha senha". O servidor de e-mail padrão do
Supabase grátis só entrega para membros da equipe. Para os clientes receberem,
configure um SMTP próprio (Resend grátis com o domínio jalimpo.com) em
Authentication → Emails → SMTP Settings.

## Backup e troca de servidor

O banco é PostgreSQL comum. Ele não depende do Supabase nem do Lovable.

Backup completo (estrutura + dados), com a senha do arquivo `SUPABASE-BANCO.txt`:

```bash
npx supabase db dump --linked -f backup-estrutura.sql
npx supabase db dump --linked --data-only -f backup-dados.sql
```

Levar para outro Supabase:
1. Criar o projeto novo.
2. `npx supabase link --project-ref NOVO` e depois `npx supabase db push`, que recria toda a estrutura.
3. Restaurar os dados com `psql` ou com o SQL Editor.
4. Publicar as funções e cadastrar os segredos (tabela acima).
5. Trocar URL e chave em `.env` e rodar `npm run publicar`.

Senhas de usuário, a chave de criptografia das chaves Pix (`app_config`) e os
arquivos do storage precisam vir juntos. Sem a chave, as chaves Pix salvas não
abrem.

## Histórico da migração (09/10/2026)

- Origem: Lovable Cloud (Supabase `mdgiviynypoyixpskmpu`), que ficou sem créditos.
- Estrutura recriada pelas migrações e comparada objeto a objeto: colunas,
  funções, regras RLS, gatilhos, índices, permissões e publicações de tempo real.
- Dados copiados direto de banco para banco: 47 tabelas, 41 usuários com as
  mesmas senhas, chave de criptografia idêntica. Conferido por impressão digital.
- Documentos das diaristas (bucket `pro-documents`, 51 arquivos): cópia em
  andamento. As pastas baixadas ficam em `Documents/JaLimpo-Lojas/migracao/documentos/`.
- O projeto no Lovable fica só como histórico. Não publicar mais por lá.
