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

Ambiente instalado na máquina principal em 2026-07-06:
- **JDK 21 (Temurin)**: `C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`
  (instalado via `winget install EclipseAdoptium.Temurin.21.JDK`)
- **Android SDK**: `E:\Android\Sdk` (command-line tools oficiais do Google;
  platform-tools + platforms;android-36 + build-tools 35/36; licenças aceitas
  via `sdkmanager --licenses`)
- **Gradle caches**: `E:\Android\gradle` (via `GRADLE_USER_HOME`, para não encher o C:)
- `android/local.properties` (gitignored): `sdk.dir=E:/Android/Sdk` — usar
  **barras normais**; backslash simples quebra o parse de .properties.

Build debug (APK para testar em aparelho):
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:GRADLE_USER_HOME = "E:\Android\gradle"
cd android
.\gradlew assembleDebug
# saída: android\app\build\outputs\apk\debug\app-debug.apk
```

Instalar no aparelho (depurar via USB com "Depuração USB" ativa):
```powershell
E:\Android\Sdk\platform-tools\adb.exe install -r android\app\build\outputs\apk\debug\app-debug.apk
```
Sem cabo: copiar o APK para o aparelho (WhatsApp/Drive/USB) e abrir — Android
pede permissão para "instalar apps de fontes desconhecidas" (normal em debug).

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

Gerados em 2026-07-06 com `@capacitor/assets` a partir de `assets/logo.png`
(marca da gota, canvas 1024×1024 montado por upscale do `src/assets/logo-icon.png`
384px — qualidade OK para beta; **arte final nativa em 1024×1024 continua
pendente** para o release de loja):
```powershell
npx capacitor-assets generate --iconBackgroundColor "#FFFFFF" --iconBackgroundColorDark "#111B2E" --splashBackgroundColor "#FFFFFF" --splashBackgroundColorDark "#111B2E"
```
Atenção: a ferramenta também sobrescreve `public/manifest.json` e gera ícones de
PWA fora de `public/` — depois de rodar, conferir que os ícones estão em
`public/icons/` e que o manifest aponta para `/icons/icon-*.png`. De brinde ela
corrigiu os ícones do PWA, que eram todos 1920×1280 mislabeled.

## Regras de segurança do processo

- PWA continua no ar durante todo o processo (rollback natural).
- Nenhuma mudança de backend/schema junto com empacotamento — uma mudança por vez.
- Keystore Android e certificados Apple em cofre, nunca no repo.
- Migrations continuam indo via MCP com aprovação; GitHub só frontend/functions.
