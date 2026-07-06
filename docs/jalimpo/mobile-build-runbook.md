# Já Limpo — Runbook de build mobile (Capacitor)

Criado em 2026-07-06. Stack: Vite + React (webDir `dist`) + Capacitor 8.
Backend/Supabase/Lovable permanecem intactos — a casca nativa consome o mesmo app.

## Ciclo padrão (toda mudança de frontend)

```powershell
npm run build      # gera dist/ (inclui PWA para a web)
npx cap sync       # copia dist/ para android/ e ios/ e atualiza plugins
```

`npx cap sync` é obrigatório depois de qualquer `npm run build` para o app nativo
enxergar a versão nova. O que muda só em `android/` ou `ios/` (manifest, plist,
ícones) não precisa de sync.

## Android — build local

Pré-requisitos (não presentes na máquina atual):
1. JDK 21 (Temurin) — `winget install EclipseAdoptium.Temurin.21.JDK`
2. Android Studio (instala SDK/platform-tools) — ou SDK command-line tools
3. Variável `ANDROID_HOME` apontando para o SDK (`%LOCALAPPDATA%\Android\Sdk`)

Build debug (APK para testar em aparelho):
```powershell
cd android
.\gradlew assembleDebug
# saída: android\app\build\outputs\apk\debug\app-debug.apk
```

Build release (AAB para a Play Store — exige keystore):
```powershell
cd android
.\gradlew bundleRelease
```

Alternativa sem instalar nada: abrir o projeto `android/` no Android Studio de
outra máquina, ou usar CI (GitHub Actions com `actions/setup-java` + gradle).

## iOS — build

iOS **não builda no Windows**. Opções:
1. Mac com Xcode: `npx cap open ios`, assinar com a conta Apple Developer e archive.
2. Nuvem: Codemagic (tem plano free) ou Ionic Appflow — buildam o `ios/` direto do repo.

A pasta `ios/` já está pronta e versionada (bundle `br.com.jalimpo.app`,
permissões no Info.plist). Depois de `npm run build && npx cap sync`, qualquer
Mac/CI consegue gerar o archive.

## Ícones e splash

Quando houver a logo final em 1024×1024:
```powershell
npm install -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor "#ffffff"
```
(hoje as cascas usam o ícone padrão do Capacitor — pendência antes do release)

## Regras de segurança do processo

- PWA continua no ar durante todo o processo (rollback natural).
- Nenhuma mudança de backend/schema junto com empacotamento — uma mudança por vez.
- Keystore Android e certificados Apple em cofre, nunca no repo.
- Migrations continuam indo via MCP com aprovação; GitHub só frontend/functions.
