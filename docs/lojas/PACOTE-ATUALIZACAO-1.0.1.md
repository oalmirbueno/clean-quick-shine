# Pacote de atualização 1.0.1 (lançamento em Brusque)

Tudo abaixo está pronto nos arquivos e ainda **não subiu**. Rodar na ordem, no dia em que o Google aprovar a versão 1.0.0. Comandos na pasta `app-src`.

## O que entra

| Mudança | Onde vale |
|---|---|
| Brusque cadastrada, sem taxa, com diaristas e endereços vinculados | Banco |
| Saldo libera com a avaliação ou 48 h após concluir | Banco e telas |
| Cupom pago pela Já Limpo: diarista sempre com 80% do preço cheio | Banco e telas |
| Registro de quando o cliente não acha diarista | Banco e app |
| "Como conheceu?" no cadastro | Banco e app |
| Cartão desligado (`CARTAO_ATIVO`), servidor recusa | Função e app |
| Indique e ganhe escondido (`INDICACAO_ATIVA`) | App |
| Site com Brusque, Pix ou boleto, botão Google Play | Site |
| Ícone V3 no Android e versão 1.0.1 | App |

## Falta decidir ou informar

- Número de WhatsApp do suporte: preencher `whatsappSuporte` em `src/lib/empresa.ts`.
- Saque em 48 h, cupom pago pela empresa e cartão desligado seguem a recomendação do plano. Se o Almir mudar, ajustar antes de subir.

## Ordem no dia

1. **Brusque** (pode rodar antes, não depende do Google):
   `npx supabase db query --linked -f supabase/migrations/20261109120000_brusque_primeira_praca.sql`
2. **Asaas** (valores em `Documents/JaLimpo-Lojas/chaves/ASAAS-WEBHOOK.txt` e no painel do Asaas; nunca colar em arquivo):
   - `npx supabase secrets set --project-ref grqwwpxpmcwailkxbbbj ASAAS_API_KEY=... ASAAS_ENVIRONMENT=production`
   - No Asaas, apontar o webhook para a URL do arquivo acima.
3. **Banco:** `npx supabase db query --linked -f supabase/migrations/20261109130000_lancamento_saldo_cupom_registros.sql`
4. **Funções:** `npx supabase functions deploy create-payment refund-payment --use-api`
5. **Juntar a branch `lancamento-brusque-1-0-1` na `main`** e enviar ao GitHub, depois **site e app web:** `npm run publicar`
6. **Android:** Codemagic, workflow `android-aab`. Baixar o `.aab`, enviar em Produção no Play Console e mandar para análise.
7. **Ficha da loja, depois de aprovar a 1.0.0:** ícone V3 de 512 px, descrição dizendo que o atendimento começa por Brusque e sem citar cartão.

## Conferir depois de subir

- Cobrança real por Pix, pedido do início ao saque.
- Endereço em Brusque cai na zona Brusque, sem taxa.
- Diarista recebe R$ 144 em pedido de R$ 180 com cupom de R$ 20.
- Saldo aparece 48 h após concluir, sem avaliação.

## Atenção

Antes do passo 5, o app da loja continua sendo a 1.0.0: mostra opção de cartão, que passa a dar aviso de indisponível depois do passo 4. O site usa os mesmos textos do plano; a imagem da tela de pagamento na página ainda mostra a opção de cartão.
