
# Remover rota publica /admin/login

## Objetivo
Eliminar a pagina dedicada de login admin (`/admin/login`), forçando admins a usarem a pagina principal `/login` que ja redireciona corretamente para `/admin/dashboard` quando detecta role `admin`.

## O que ja funciona
A pagina `/login` (linha 41-42 de `Login.tsx`) ja verifica roles apos autenticacao e redireciona admins automaticamente para `/admin/dashboard`.

## Mudancas

### 1. Remover a rota `/admin/login` do App.tsx
- Remover o import de `AdminLogin`
- Remover a linha `<Route path="/admin/login" element={<AdminLogin />} />`

### 2. Redirecionar `/admin/login` para `/login`
- Adicionar um redirect: `<Route path="/admin/login" element={<Navigate to="/login" replace />} />`
- Isso garante que links antigos ou bookmarks continuem funcionando

### 3. Atualizar referencia no AdminLogin (opcional)
- O arquivo `src/pages/admin/AdminLogin.tsx` pode ser mantido no projeto sem uso, ou deletado para limpeza

## Secao tecnica

Arquivo: `src/App.tsx`
- Adicionar import: `import { Navigate } from "react-router-dom"` (ja importado via `Routes, Route`)
- Substituir rota `AdminLogin` por redirect
- Remover import do componente `AdminLogin`

Nenhuma outra mudanca necessaria. O fluxo de login principal ja suporta admins nativamente.
