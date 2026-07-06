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
};

export default config;
