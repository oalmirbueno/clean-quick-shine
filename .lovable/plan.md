
# Plano de Correção e Otimização - Já Limpo

## Resumo

Foram identificadas falhas de segurança, funcionalidade e performance em diversas áreas do aplicativo. Este plano aborda cada uma delas de forma organizada.

---

## 1. Correção de Segurança Critica (Nivel Error)

### 1.1 Notificações - Politica INSERT muito permissiva
A tabela `notifications` possui a politica `WITH CHECK (true)` no INSERT, permitindo que qualquer usuario autenticado crie notificacoes para qualquer outro usuario. Isso permite ataques de spam e phishing.

**Correcao:** Substituir a politica por uma que permita apenas admins ou o proprio usuario inserir notificacoes. As funcoes SECURITY DEFINER (como `create_order_notification`) ja ignoram RLS, entao nao serao afetadas.

```sql
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid()) OR auth.uid() = user_id
  );
```

### 1.2 Validacao de input no handle_new_user()
O trigger `handle_new_user()` aceita `full_name` sem validacao, permitindo strings enormes ou caracteres maliciosos.

**Correcao:** Atualizar a funcao para limitar a 100 caracteres e remover caracteres nao imprimiveis.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE safe_name TEXT;
BEGIN
  safe_name := TRIM(SUBSTRING(
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 1, 100
  ));
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NULLIF(safe_name, ''));
  RETURN NEW;
END;
$$;
```

---

## 2. Correcoes de Funcionalidade

### 2.1 Index.tsx - Navegacao condicional
Atualmente a splash sempre redireciona para `/onboarding`. Deveria verificar se o usuario ja esta logado e redirecionar para o dashboard correto.

**Correcao:** Verificar sessao ativa antes de navegar. Se logado, redirecionar para a home do papel correspondente.

### 2.2 Decline Order nao funciona
O `useDeclineOrder` nao faz nada no servidor - apenas invalida queries locais. O pedido continua aparecendo.

**Correcao:** Criar tabela `pro_declined_orders` para registrar recusas e filtrar no hook `useAvailableOrdersForPro`.

### 2.3 Registro - validacao de senha fraca
Nao ha validacao de tamanho minimo de senha no frontend (o placeholder diz "Minimo 8 caracteres" mas nao valida).

**Correcao:** Adicionar validacao de `password.length < 8` antes de submeter.

### 2.4 Register - Pro signup nao valida step 2
No registro como diarista, os campos de dias e periodos nao sao obrigatorios. O usuario pode prosseguir sem selecionar nenhum.

**Correcao:** Validar que pelo menos 1 dia e 1 periodo foram selecionados antes de submeter.

---

## 3. Correcoes de Performance

### 3.1 useProData - Multiplas queries sequenciais
O hook `useCurrentProData` faz 5 queries sequenciais ao banco. Devem ser paralelizadas com `Promise.all`.

**Correcao:** Agrupar as queries independentes (profile, proProfile, metrics, subscription) em `Promise.all`.

### 3.2 useOrders - N+1 queries
Os hooks de orders fazem queries separadas para services, addresses e profiles. Ja estao parcialmente otimizados com batch, mas podem usar joins do Supabase.

**Correcao:** Usar `.select("*, service:services(*), address:addresses(*)")` quando possivel para reduzir chamadas.

### 3.3 Distancia mock nos pedidos disponiveis
A distancia nos pedidos para profissionais e calculada com `Math.random()`, gerando valores diferentes a cada re-render.

**Correcao:** Usar calculo baseado em hash do ID do pedido para manter consistencia, ou calcular com coordenadas reais quando disponiveis.

---

## 4. Correcoes de UX/UI

### 4.1 WelcomeTutorial - useEffect dependency
O `useEffect` que chama `handleComplete` quando PWA esta instalada tem `handleComplete` como dependencia faltante, o que pode causar comportamento inconsistente.

**Correcao:** Usar `useCallback` para `handleComplete` e incluir na lista de dependencias.

### 4.2 Login safe-top inconsistente
A tela de selecao de tipo (primeiro render do Login) tem `safe-top`, mas o formulario de login (segundo render) nao tem.

**Correcao:** Adicionar `safe-top` ao container do formulario de login.

---

## Secao Tecnica - Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `migration SQL` | Corrigir politica notifications INSERT + handle_new_user validation |
| `src/pages/Index.tsx` | Adicionar verificacao de sessao ativa |
| `src/pages/Register.tsx` | Validacao de senha e campos obrigatorios step 2 |
| `src/pages/Login.tsx` | Adicionar safe-top no form view |
| `src/hooks/useProData.ts` | Paralelizar queries com Promise.all |
| `src/hooks/useProData.ts` | Corrigir calculo de distancia consistente |
| `src/components/ui/WelcomeTutorial.tsx` | Corrigir dependencia do useEffect |
| `migration SQL` | Criar tabela pro_declined_orders |
| `src/hooks/useProData.ts` | Implementar logica de decline real |

---

## Ordem de Execucao

1. Migracoes SQL (seguranca + nova tabela)
2. Correcoes de seguranca no codigo
3. Correcoes de funcionalidade
4. Otimizacoes de performance
5. Ajustes de UX/UI
