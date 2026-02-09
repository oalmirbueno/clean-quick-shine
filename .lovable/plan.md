

# Pagina de Acesso Negado (403)

## Objetivo

Criar uma pagina dedicada de acesso negado que sera exibida quando um usuario autenticado tenta acessar uma rota para a qual nao possui permissao, em vez de redirecionar silenciosamente.

## Mudancas

### 1. Criar pagina `src/pages/AccessDenied.tsx`

Pagina simples e clean seguindo o padrao visual do projeto (similar ao `NotFound.tsx`):
- Icone de cadeado (lucide-react `ShieldX` ou `Lock`)
- Titulo "Acesso Negado"
- Mensagem explicativa curta
- Botao para voltar a area correta do usuario (baseado na role)
- Botao secundario para sair da conta

### 2. Atualizar `src/App.tsx`

- Importar a nova pagina
- Adicionar rota `/access-denied`

### 3. Atualizar `src/components/ProtectedRoute.tsx`

Quando o usuario esta autenticado mas nao tem a role necessaria, em vez de redirecionar silenciosamente para a home da role correta, redirecionar para `/access-denied` passando informacoes via state:
- A role que o usuario tentou acessar
- As roles que o usuario possui

Isso substitui o bloco atual que faz `Navigate` silencioso para `/admin/dashboard`, `/client/home` ou `/pro/home`.

## Detalhes Tecnicos

### AccessDenied.tsx (estrutura)

```text
+----------------------------------+
|                                  |
|          [ShieldX icon]          |
|                                  |
|        Acesso Negado             |
|                                  |
|  Voce nao tem permissao para     |
|  acessar esta area.              |
|                                  |
|  [Ir para minha area]  (primary) |
|  [Sair da conta]     (secondary) |
|                                  |
+----------------------------------+
```

### ProtectedRoute.tsx (mudanca no fluxo)

Antes:
- Usuario sem role correta -> redirect silencioso para home da role

Depois:
- Usuario sem role correta -> redirect para `/access-denied` com state contendo as roles do usuario
- A pagina AccessDenied usa as roles do state para criar o botao "Ir para minha area" apontando para o destino correto

### Caso especial: roles vazias

Quando `rolesLoaded && roles.length === 0`, manter o redirect para `/login` (usuario sem nenhuma role configurada).

