
# Plano Completo: Transformação PWA

## Visão Geral

O projeto já possui uma base sólida de PWA com `vite-plugin-pwa`, `manifest.json`, ícones básicos, meta tags iOS e componentes `InstallPrompt` e `Install`. Este plano irá **expandir e aprimorar** o que já existe para entregar um PWA completo, instalável e com experiência real de aplicativo.

---

## Fase 1: Manifest e Ícones Completos

### 1.1 Atualizar manifest.json
- Alterar `name` e `short_name` para "Já Limpo" (consistente com index.html)
- Adicionar ícones em todos os tamanhos: 72, 96, 128, 144, 152, 192, 384, 512
- Adicionar `shortcuts` para acesso rápido (Início, Pedidos, Suporte)
- Adicionar `id` para identificação única do app
- Configurar `scope` corretamente

### 1.2 Gerar Ícones Faltantes
Criar ícones nos tamanhos: 72x72, 96x96, 128x128, 144x144, 152x152, 384x384 (normal e maskable)

### 1.3 Apple Splash Screens
Gerar splash screens para diferentes dispositivos iOS

---

## Fase 2: Service Worker Robusto

### 2.1 Configurar Workbox no Vite
Expandir configuração do `vite-plugin-pwa` com:
- **Precache**: Todos os assets estáticos (JS, CSS, HTML, ícones, fontes)
- **Runtime Caching**:
  - Cache-First para imagens e assets
  - Stale-While-Revalidate para páginas HTML
  - Network-First para requisições API (Supabase)
- Fallback offline para navegação

### 2.2 Página Offline
Criar página de fallback bonita quando não há conexão (já existe estrutura, apenas melhorar)

### 2.3 Sistema de Atualização
Criar componente `UpdatePrompt` que:
- Detecta novas versões do Service Worker
- Mostra notificação discreta "Atualização disponível"
- Botão para atualizar imediatamente
- Evita o problema clássico de PWA travado em versão antiga

---

## Fase 3: App Shell e Navegação

### 3.1 Estrutura Atual
O projeto já possui:
- `BottomNav` com 3-4 itens para Client e Pro
- Headers fixos leves
- Transições com Framer Motion

### 3.2 Melhorias no BottomNav
- Adicionar aba de "Suporte" (opcional, baseado no checklist)
- Garantir `safe-area-inset-bottom` (já implementado via classe `safe-bottom`)
- Animação de feedback tátil ao tocar

### 3.3 Transições de Tela
Adicionar transições suaves entre rotas usando `AnimatePresence` do Framer Motion

---

## Fase 4: Ajustes iOS (Safe Area + Splash)

### 4.1 Meta Tags (Já Implementadas)
Verificar e confirmar:
- `apple-mobile-web-app-capable`: yes
- `apple-mobile-web-app-status-bar-style`: black-translucent
- `viewport`: viewport-fit=cover

### 4.2 Safe Area CSS
Expandir utilitários CSS para:
- `safe-top`: padding-top com safe-area-inset-top
- `safe-bottom`: já existe
- `safe-left`, `safe-right`: para dispositivos com notch lateral

### 4.3 Remover Scroll Bounce
Adicionar CSS para desabilitar overscroll em dispositivos iOS

---

## Fase 5: Performance

### 5.1 Lazy Loading de Imagens
- Adicionar `loading="lazy"` em todas as imagens
- Implementar component wrapper para imagens com loading state

### 5.2 Code Splitting
- Já implementado via React Router (cada página é lazy loaded pelo Vite)
- Verificar se rotas admin podem ser separadas em chunk diferente

### 5.3 Prefetch de Rotas Críticas
Adicionar prefetch para rotas principais baseado no role do usuário

---

## Fase 6: UX Mobile-First

### 6.1 Estados de Loading
Criar componentes `Skeleton` reutilizáveis para:
- Lista de pedidos
- Cards de serviço
- Perfil do usuário

### 6.2 Estados Vazios
Criar componente `EmptyState` bonito para:
- Sem pedidos
- Sem endereços
- Sem resultados de busca

### 6.3 Feedback Visual
- Toast/Sonner já implementado
- Adicionar feedback tátil com `navigator.vibrate()` onde aplicável

### 6.4 Inputs Otimizados
Verificar e adicionar atributos:
- `inputMode="email"` para campos de email
- `inputMode="numeric"` para campos numéricos
- `inputMode="tel"` para telefone

---

## Fase 7: Notificações Push (Base)

### 7.1 Estrutura de Push Notifications
Criar hook `usePushNotifications` com:
- Verificação de suporte do navegador
- Fluxo de permissão
- Subscribe/Unsubscribe
- Armazenamento do device token (mock ou integração real)

### 7.2 UI de Permissão
Criar modal bonito para pedir permissão de notificações (não usar o prompt nativo direto)

---

## Fase 8: Modo Offline

### 8.1 Detector de Conexão
Criar hook `useNetworkStatus` que:
- Monitora `navigator.onLine`
- Mostra banner quando offline
- Notifica quando a conexão é restaurada

### 8.2 Cache de Dados
Usar `react-query` (já instalado) com:
- `staleTime` apropriado
- `cacheTime` longo para dados importantes
- `refetchOnReconnect: true`

---

## Fase 9: Sistema de Atualização

### 9.1 Componente UpdatePrompt
Criar componente que:
- Usa `useRegisterSW` do vite-plugin-pwa
- Detecta atualizações do Service Worker
- Mostra UI discreta com opção de atualizar

---

## Fase 10: Validação Final

### 10.1 Lighthouse PWA Audit
- Installable
- Works offline
- Fast and reliable
- Has icons and manifest

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `public/manifest.json` | Atualizar com ícones completos e shortcuts |
| `public/pwa-*.png` | Gerar ícones faltantes (72, 96, 128, 144, 152, 384) |
| `vite.config.ts` | Expandir configuração do VitePWA |
| `src/hooks/useRegisterSW.ts` | Criar hook para controle do Service Worker |
| `src/hooks/useNetworkStatus.ts` | Criar hook para status de conexão |
| `src/hooks/usePushNotifications.ts` | Criar hook base para push |
| `src/components/ui/UpdatePrompt.tsx` | Criar componente de atualização |
| `src/components/ui/OfflineBanner.tsx` | Criar banner de offline |
| `src/components/ui/EmptyState.tsx` | Criar componente de estado vazio |
| `src/pages/Offline.tsx` | Criar página de fallback offline |
| `src/index.css` | Adicionar utilitários safe-area e overscroll |
| `index.html` | Adicionar splash screens iOS |
| `src/App.tsx` | Integrar UpdatePrompt e OfflineBanner |

---

## Detalhes Técnicos

### Configuração VitePWA Expandida
```typescript
VitePWA({
  registerType: "prompt", // Mudança para controle manual
  includeAssets: ["favicon.ico", "robots.txt", "pwa-*.png"],
  manifest: false,
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    navigateFallback: "/offline.html",
    navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
    runtimeCaching: [
      // Imagens - Cache First
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
        }
      },
      // API Supabase - Network First
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
          networkTimeoutSeconds: 10
        }
      },
      // Páginas HTML - Stale While Revalidate
      {
        urlPattern: /^https:\/\/.*\/(client|pro|admin)\/.*/,
        handler: "StaleWhileRevalidate",
        options: { cacheName: "pages-cache" }
      }
    ]
  }
})
```

### Estrutura do Manifest Final
```json
{
  "id": "ja-limpo-app",
  "name": "Já Limpo - Limpeza Profissional",
  "short_name": "Já Limpo",
  "description": "Precisa de Limpeza? Baixa o Já Limpo",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [/* 72, 96, 128, 144, 152, 192, 384, 512 - normal e maskable */],
  "shortcuts": [
    { "name": "Início", "url": "/client/home", "icons": [...] },
    { "name": "Meus Pedidos", "url": "/client/orders", "icons": [...] },
    { "name": "Suporte", "url": "/client/support", "icons": [...] }
  ],
  "categories": ["lifestyle", "utilities"],
  "lang": "pt-BR"
}
```

---

## Ordem de Implementação

1. **Manifest e Ícones** - Base necessária
2. **Service Worker robusto** - Core do PWA
3. **Sistema de Atualização** - Evita bugs clássicos
4. **Detector de Conexão** - UX offline
5. **Safe Area CSS** - Polimento iOS
6. **Página Offline** - Fallback gracioso
7. **Push Notifications (base)** - Estrutura para futuro
8. **Performance tweaks** - Otimizações finais
