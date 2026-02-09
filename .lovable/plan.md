

# Correção do Fluxo de Proteção de Rotas Admin

## Problema Identificado

O teste revelou que o `ProtectedRoute` fica preso na tela "Verificando acesso..." por até 5 segundos antes de redirecionar. Isso acontece quando:
- Um usuario esta autenticado mas nao tem roles no banco de dados
- O timeout de seguranca de 5 segundos e excessivamente longo para a experiencia do usuario

## Situacao Atual

A protecao de rotas **funciona corretamente**:
- Rotas `/admin/*` exigem role `admin`
- Usuarios sem role `admin` sao redirecionados
- Usuarios nao autenticados sao enviados para `/login`

Porem a experiencia pode ser melhorada.

## Mudancas Propostas

### 1. Reduzir Timeout de Seguranca (ProtectedRoute.tsx)

Reduzir o timeout de 5000ms para 3000ms para uma experiencia mais rapida quando ocorrem problemas de carregamento.

### 2. Adicionar Logs de Debug Temporarios

Adicionar `console.log` para facilitar a depuracao do fluxo de autenticacao durante o desenvolvimento:
- Estado de loading
- Roles carregadas
- Decisao de redirecionamento

### 3. Tratar Caso de Roles Vazias Mais Rapido

Quando `rolesLoaded = true` e `roles = []`, redirecionar imediatamente sem esperar o timeout.

## Detalhes Tecnicos

Arquivo: `src/components/ProtectedRoute.tsx`
- Alterar timeout de `5000` para `3000`
- O fluxo `rolesLoaded && roles.length === 0` ja existe e funciona, mas pode ser otimizado para nao depender do timeout

Arquivo: `src/contexts/AuthContext.tsx`
- Sem alteracoes necessarias, o fluxo de roles ja esta correto

## Observacao Importante

No ambiente de preview do Lovable, o token de autenticacao automatico (`__lovable_token`) cria uma sessao que nao possui roles no banco, causando o comportamento de timeout. No ambiente publicado (`clean-quick-shine.lovable.app`), usuarios sem sessao sao redirecionados imediatamente para `/login`.

