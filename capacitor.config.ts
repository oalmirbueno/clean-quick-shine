import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.jalimpo.app",
  appName: "Já Limpo",
  webDir: "dist",
  server: {
    // WebView nativa serve o app em https://localhost (Android) —
    // origin estável para o Supabase Auth e para o localStorage.
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    // Android 15+ desenha atrás das barras; o plugin injeta --safe-area-inset-*
    // (o app usa var(--safe-area-inset-*, env(...)) em todo lugar).
    SystemBars: {
      insetsHandling: "css",
      style: "DEFAULT",
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: "#F6F9FA",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: false,
      splashImmersive: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
