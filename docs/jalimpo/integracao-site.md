# Site (landing) ↔ app: ponto único de integração

O site mora em `landing/public` (outra frente de trabalho). O app React, o painel e o banco ficam aqui.
Tudo o que o site precisa do app está nesta página. Se mudar algo, mude aqui também.

## Grupos de WhatsApp

Os links dos grupos são cadastrados em **Admin → Grupos WhatsApp** (`/admin/groups`), um "atual" para clientes e um para diaristas.
O site **não guarda link de convite**. Ele aponta para rotas fixas do app, que sempre levam ao grupo atual e contam o clique:

| Para quem | Link fixo | O que faz |
|---|---|---|
| Clientes | `https://jalimpo.com/grupo/clientes` | registra o clique (origem "site") e abre o grupo atual de clientes |
| Diaristas | `https://jalimpo.com/grupo/diaristas` | registra o clique (origem "site") e abre o grupo atual de diaristas |
| Quem já tem conta | `https://jalimpo.com/grupo` | tela "Entre no grupo" do tipo da pessoa (pede login) |

No site, o lugar de preencher é `landing/public/site/assets/config.js`:

```js
window.JALIMPO_CONFIG = {
  grupoClientes: "/grupo/clientes",
  grupoDiaristas: "/grupo/diaristas"
};
```

Enquanto não houver grupo atual cadastrado, a rota mostra "O grupo ainda não está disponível" com botão para abrir o app. Por isso, só preencha o `config.js` depois de cadastrar os grupos no admin.

Para ler o link sem passar pela rota (uso técnico): função pública do banco `grupo_registrar('clique', 'client' | 'pro')`, que devolve o link do grupo atual ou vazio. Cada chamada conta um clique.

O WhatsApp não informa quem entrou de verdade no grupo. O painel mostra quem tocou no convite e quem confirmou "Já entrei".

## App web para iPhone

| Uso | Link |
|---|---|
| Abrir o app no navegador (login, cadastro, pedido) | `https://jalimpo.com/app` |
| Passo a passo de instalar na Tela de Início (iPhone e Android) | `https://jalimpo.com/install` |
| Entrar | `https://jalimpo.com/login` |
| Criar conta | `https://jalimpo.com/register` |

É o mesmo app, o mesmo login e os mesmos dados do aplicativo Android.

## Publicação

`npm run publicar` (dentro de `app-src`) sobe **app e site juntos**. Antes de rodar:
confira que `landing/public` não está no meio de uma edição e que o trabalho do app está inteiro (commit feito).
