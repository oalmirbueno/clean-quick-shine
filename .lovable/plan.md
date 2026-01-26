
# Plano de Correção: Login e Entrada ao App

## Problema Principal Identificado

Ao analisar os logs e o banco de dados, descobri que:

1. **A tabela `user_roles` está VAZIA** - o usuário "Almir" foi registrado, mas sua role nunca foi salva
2. Isso aconteceu porque houve um erro de RLS no momento do cadastro (a policy de INSERT foi adicionada depois)
3. Quando o usuário tenta fazer login, o sistema busca roles, não encontra nenhuma, e redireciona de volta para `/login`

## Solução em 3 Partes

---

### Parte 1: Corrigir Usuários Existentes (Migration SQL)

Criar uma migration para adicionar a role manualmente ao usuário existente que não tem role:

```sql
-- Adicionar role 'client' para o usuário Almir que está sem role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'client'::app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
```

---

### Parte 2: Melhorar o Fluxo de Login (Login.tsx)

Atualizar a lógica de navegação para lidar com usuários sem role de forma mais robusta:

**Mudanças:**
- Se o login for bem-sucedido mas não houver roles, navegar baseado na seleção do tipo de usuário
- Adicionar a role automaticamente se estiver faltando (fallback de segurança)
- Mostrar mensagem de erro mais clara se algo der errado

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const { error, roles } = await signIn(email, password);
  
  if (error) {
    toast.error(error.message === "Invalid login credentials" 
      ? "Email ou senha incorretos" 
      : error.message);
    setLoading(false);
    return;
  }

  toast.success("Login realizado com sucesso!");
  
  // Se não tem role, adicionar baseado na seleção
  if (!roles || roles.length === 0) {
    const selectedRole = userType as "client" | "pro";
    // Inserir role que está faltando
    await supabase.from("user_roles").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      role: selectedRole
    });
  }
  
  // Navegar baseado na role real ou seleção
  if (roles?.includes("admin")) {
    navigate("/admin/dashboard");
  } else if (roles?.includes("client")) {
    navigate("/client/home");
  } else if (roles?.includes("pro")) {
    navigate("/pro/home");
  } else {
    // Fallback para seleção do usuário
    navigate(userType === "client" ? "/client/home" : "/pro/home");
  }
  
  setLoading(false);
};
```

---

### Parte 3: Melhorar o AuthContext (AuthContext.tsx)

Adicionar tratamento de erro na inserção de role e atualizar roles após inserção tardia:

**Mudanças:**
1. Adicionar tratamento de erro mais robusto no `signUp`
2. Adicionar função para inserir role manualmente caso esteja faltando
3. Atualizar `rolesLoaded` mesmo quando a lista está vazia para evitar loading infinito

```typescript
// Nova função para inserir role caso esteja faltando
const ensureUserRole = useCallback(async (userId: string, role: AppRole) => {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
  
  if (!error) {
    setRoles([role]);
    setRolesLoaded(true);
  }
  return error;
}, []);
```

---

### Parte 4: Atualizar ProtectedRoute (ProtectedRoute.tsx)

Melhorar a lógica de redirecionamento quando não há roles:

**Mudanças:**
- Não bloquear indefinidamente se não houver roles
- Redirecionar para login se rolesLoaded for true mas não houver roles compatíveis

```typescript
// Se roles carregadas mas vazias, redirecionar para login
if (rolesLoaded && roles.length === 0 && requiredRole) {
  return <Navigate to="/login" replace />;
}
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/` | Criar migration para adicionar roles faltantes |
| `src/pages/Login.tsx` | Adicionar fallback de inserção de role |
| `src/contexts/AuthContext.tsx` | Adicionar função `ensureUserRole` e melhorar tratamento |
| `src/components/ProtectedRoute.tsx` | Melhorar lógica de redirecionamento |

---

## Detalhes Técnicos

### Por que o bug aconteceu?

1. Usuário se cadastrou ANTES da policy de INSERT ser criada
2. A inserção na tabela `user_roles` falhou silenciosamente com erro RLS
3. O login funciona (autenticação OK) mas não encontra roles
4. `ProtectedRoute` vê que não tem a role necessária e redireciona para login
5. Loop infinito de login -> protected route -> login

### Por que demora para carregar?

1. `AuthContext` faz `getSession()` + `fetchRoles()` sequencialmente
2. `ProtectedRoute` espera `rolesLoaded` ser true
3. Se roles não existem, há delay enquanto busca e processa

### Solução de performance:

- Definir `rolesLoaded = true` mesmo quando array está vazio
- Isso já está implementado, mas o fluxo atual causa re-renders desnecessários
