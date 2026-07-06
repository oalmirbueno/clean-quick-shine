# Já Limpo — Capacitor native readiness

Estado da preparação do app (PWA existente) para as cascas nativas Android e iOS.
Criado em 2026-07-06.

## Configuração

- **appName:** Já Limpo
- **appId / package / bundleId:** `br.com.jalimpo.app`
- **webDir:** `dist`
- **Domínio público:** https://jalimpo.com (HTTPS)
- **Capacitor:** 8.x (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/ios`)
- Backend, banco e auth **não mudam**: a casca nativa consome exatamente a mesma
  aplicação web e a mesma API. O PWA continua no ar (rollback vivo).

## Adaptações de runtime (web continua igual; muda só dentro da casca nativa)

| Área | Arquivo | Comportamento no nativo |
|---|---|---|
| Detecção de plataforma | `src/lib/platform.ts` | `isNativeApp()` via `Capacitor.isNativePlatform()`; `getPublicOrigin()` retorna `https://jalimpo.com` |
| Gate de instalação PWA | `src/hooks/useIsStandalone.ts` | casca nativa conta como "instalado" → `MobilePwaGate` nunca manda para `/install` |
| Banner "Instale o app" | `src/components/ui/InstallBanner.tsx` | nunca aparece |
| Service worker / update prompt | `src/hooks/useRegisterSW.ts` | SW não registra (assets são locais); `UpdatePrompt` nunca dispara |
| Limpeza de cache no boot | `src/main.tsx` | rotinas de reset de cache PWA/preview não rodam |
| Web Push | `src/hooks/usePushNotifications.ts` | `isSupported=false` (push nativo FCM/APNs fica para fase futura) |
| Redirects de auth (signup, reset de senha) | `AuthContext`, `ForgotPassword`, `AdminUsers` | e-mails apontam para `https://jalimpo.com/...` em vez de `capacitor://localhost` |
| Compartilhar indicação | `ReferralCard` | link compartilhado = domínio público |

## Páginas públicas para as lojas

- `/terms` — Termos de Uso (já existia)
- `/privacy` — Política de Privacidade (já existia)
- `/support` — **nova** página pública de suporte (suporte@jalimpo.com + canais)
- `/account-deletion` — **nova** página pública de exclusão de conta (fluxo
  self-service no app + alternativa por e-mail), exigida pelo Google Play Data
  safety e pela App Store

URLs finais (após deploy): `https://jalimpo.com/terms`, `/privacy`, `/support`, `/account-deletion`.

## Permissões nativas

- **Geolocalização** (mapa/rastreio da diarista): `navigator.geolocation` na WebView;
  Android precisa de `ACCESS_COARSE_LOCATION`/`ACCESS_FINE_LOCATION` no manifest;
  iOS precisa de `NSLocationWhenInUseUsageDescription` no Info.plist.
- **Câmera/upload de documentos** (verificação da diarista): input file com captura;
  Android precisa de `CAMERA` + `READ_MEDIA_IMAGES`; iOS precisa de
  `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`.
- **Push:** pendência futura (`@capacitor/push-notifications` + FCM/APNs). No beta,
  fallback in-app/e-mail.

## Pendências conhecidas

- Ícone/splash nativos gerados a partir de `public/pwa-512x512.png` (usar
  `@capacitor/assets` quando houver arte final em alta resolução).
- Deep links / App Links (`assetlinks.json` + `apple-app-site-association` em
  jalimpo.com) — necessários para abrir links de e-mail direto no app; sem eles o
  link abre no navegador (funciona, só não é o ideal).
- Build Android requer JDK 21 + Android Studio/SDK (não presentes nesta máquina).
- Build iOS requer Mac/Xcode ou serviço de build em nuvem (Codemagic/Appflow).
