
# Plano de Correção: Login Travado no Carregamento

## Problema Identificado

Analisando o código e os logs, identifiquei uma **condição de corrida (race condition)** no fluxo de autenticação:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  FLUXO ATUAL (PROBLEMÁTICO)                                         │
├─────────────────────────────────────────────────────────────────────┤
│  1. handleLogin() → signIn()                                        │
│  2. signInWithPassword() ✓ (sucesso)                                │
│  3. fetchRoles() no signIn() → retorna ['client']                   │
│  4. setRoles(['client']) ✓                                          │
│  5. DISPARA onAuthStateChange() → await fetchRoles() (DUPLICADO!)   │
│  6. navigate('/client/home')                                        │
│  7. ProtectedRoute verifica loading/rolesLoaded                     │
│  8. onAuthStateChange ainda está processando... TRAVA!              │
└─────────────────────────────────────────────────────────────────────┘
```

O `onAuthStateChange` é disparado automaticamente pelo Supabase quando o login acontece, e ele também busca roles. Isso causa:
- Busca de roles **duplicada**
- Estados intermediários inconsistentes
- O loading fica true enquanto a segunda busca acontece

## Solução em 3 Partes

---

### Parte 1: Otimizar AuthContext.tsx

**Mudanças principais:**
1. Usar `setTimeout` com 0ms no `onAuthStateChange` para evitar blocking
2. Não refazer fetch de roles se já foram carregadas recentemente
3. Adicionar flag para indicar que o signIn está em progresso

```typescript
// AuthContext.tsx - Evitar race condition
const [signingIn, setSigningIn] = useState(false);

// No onAuthStateChange, não buscar roles se signIn está em progresso
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user && !signingIn) {
      // Usar setTimeout para não bloquear
      setTimeout(async () => {
        const fetchedRoles = await fetchRoles(session.user.id);
        setRoles(fetchedRoles);
        setRolesLoaded(true);
      }, 0);
    } else if (!session) {
      setRoles([]);
      setRolesLoaded(false);
    }
    
    setLoading(false);
  }
);

// No signIn, marcar que está em progresso
const signIn = async (...) => {
  setSigningIn(true);
  const { data, error } = await supabase.auth.signInWithPassword(...);
  
  if (!error && data.user) {
    const fetchedRoles = await fetchRoles(data.user.id);
    setRoles(fetchedRoles);
    setRolesLoaded(true);
    setLoading(false); // IMPORTANTE: garantir loading = false
  }
  
  setSigningIn(false);
  return { error: null, roles: fetchedRoles };
};
```

---

### Parte 2: Simplificar Login.tsx

**Mudanças:**
1. Remover lógica redundante de inserção de role (já existe no banco)
2. Garantir que `setLoading(false)` é chamado em TODOS os casos
3. Usar try-catch para evitar erros silenciosos

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const { error, roles } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message === "Invalid login credentials" 
        ? "Email ou senha incorretos" 
        : error.message);
      return;
    }

    toast.success("Login realizado com sucesso!");
    
    // Navegar imediatamente baseado nas roles retornadas
    const userRoles = roles || [];
    
    if (userRoles.includes("admin")) {
      navigate("/admin/dashboard");
    } else if (userRoles.includes("client")) {
      navigate("/client/home");
    } else if (userRoles.includes("pro")) {
      navigate("/pro/home");
    } else if (userType) {
      // Fallback: inserir role e navegar
      navigate(userType === "client" ? "/client/home" : "/pro/home");
    }
  } catch (err) {
    console.error("Login error:", err);
    toast.error("Erro ao fazer login. Tente novamente.");
  } finally {
    setLoading(false);
  }
};
```

---

### Parte 3: Melhorar ProtectedRoute.tsx

**Mudanças:**
1. Adicionar timeout para evitar loading infinito
2. Verificar se já está na rota correta para evitar re-renders

```typescript
// ProtectedRoute.tsx - Com timeout de segurança
const [timedOut, setTimedOut] = useState(false);

useEffect(() => {
  // Timeout de 5 segundos para evitar loading infinito
  const timeout = setTimeout(() => {
    if (loading || (user && !rolesLoaded)) {
      setTimedOut(true);
    }
  }, 5000);
  
  return () => clearTimeout(timeout);
}, [loading, user, rolesLoaded]);

if (timedOut) {
  return <Navigate to="/login" replace />;
}
```

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/contexts/AuthContext.tsx` | Adicionar flag `signingIn`, evitar fetch duplicado, garantir loading=false |
| `src/pages/Login.tsx` | Simplificar, adicionar try-catch, usar finally |
| `src/components/ProtectedRoute.tsx` | Adicionar timeout de segurança |

---

## Detalhes Técnicos

### Por que trava no carregamento?

O problema acontece porque:

1. `signIn()` faz login + busca roles
2. `onAuthStateChange` também busca roles (duplicado)
3. Durante a segunda busca, o estado fica inconsistente
4. `ProtectedRoute` vê `loading=true` e mostra spinner
5. A segunda busca termina, mas o componente já foi desmontado/remontado

### Por que a solução funciona?

1. Flag `signingIn` previne busca duplicada no `onAuthStateChange`
2. `setTimeout(0)` move a busca para fora do fluxo síncrono
3. `finally` garante que `setLoading(false)` sempre executa
4. Timeout de 5s no ProtectedRoute previne loading infinito

### Fluxo corrigido:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  FLUXO CORRIGIDO                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  1. handleLogin() → signIn()                                        │
│  2. setSigningIn(true)                                              │
│  3. signInWithPassword() ✓                                          │
│  4. fetchRoles() → ['client']                                       │
│  5. setRoles(['client']), setRolesLoaded(true), setLoading(false)  │
│  6. setSigningIn(false)                                             │
│  7. onAuthStateChange dispara → vê signingIn=false, mas rolesLoaded │
│  8. navigate('/client/home')                                        │
│  9. ProtectedRoute: loading=false, rolesLoaded=true → SUCESSO! ✓   │
└─────────────────────────────────────────────────────────────────────┘
```
