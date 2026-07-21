import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const inter = loadInter("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const FF = inter.fontFamily;

const MINT = "#19CC97";
const MINT_SOFT = "#8AE6C6";
const NAVY = "#0B1E30";
const NAVY_2 = "#102A43";

// ============================================================
// Shared building blocks
// ============================================================

const Bg: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 20% 10%, ${MINT}22 0%, transparent 45%), radial-gradient(circle at 85% 90%, ${MINT}18 0%, transparent 50%), linear-gradient(160deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
    }}
  />
);

const Brand: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * scale, fontFamily: FF }}>
    <div
      style={{
        width: 56 * scale,
        height: 56 * scale,
        borderRadius: 16 * scale,
        background: MINT,
        display: "grid",
        placeItems: "center",
        boxShadow: `0 10px 30px ${MINT}55`,
      }}
    >
      <Img src={staticFile("images/logo-icon.png")} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
    </div>
    <div style={{ color: "white", fontSize: 32 * scale, fontWeight: 800, letterSpacing: -0.5 }}>
      Já Limpo
    </div>
  </div>
);

// Finger / tap indicator
const Tap: React.FC<{ x: number; y: number; delay?: number }> = ({ x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180 } });
  const pulse = interpolate((frame - delay) % 40, [0, 20, 40], [1, 1.35, 1]);
  const opacity = interpolate((frame - delay) % 40, [0, 20, 40], [0.7, 0, 0.7]);
  return (
    <div style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, height: 80, pointerEvents: "none", transform: `scale(${s})` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `3px solid ${MINT}`,
          transform: `scale(${pulse})`,
          opacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 18,
          borderRadius: "50%",
          background: MINT,
          boxShadow: `0 0 24px ${MINT}`,
        }}
      />
    </div>
  );
};

// Phone shell (used for iPhone and Android with variant tweaks)
const Phone: React.FC<{ children: React.ReactNode; kind: "ios" | "android" }> = ({ children, kind }) => {
  const radius = kind === "ios" ? 66 : 52;
  return (
    <div
      style={{
        width: 540,
        height: 1140,
        borderRadius: radius,
        background: "#0A0A0A",
        padding: 14,
        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08) inset",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - 12,
          background: "white",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {kind === "ios" ? (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 130,
              height: 34,
              background: "#0A0A0A",
              borderRadius: 20,
              zIndex: 20,
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 22,
              left: "50%",
              transform: "translateX(-50%)",
              width: 14,
              height: 14,
              background: "#0A0A0A",
              borderRadius: "50%",
              zIndex: 20,
            }}
          />
        )}
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
};

// Status bar
const StatusBar: React.FC<{ kind: "ios" | "android" }> = ({ kind }) => (
  <div
    style={{
      height: kind === "ios" ? 60 : 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: kind === "ios" ? "0 34px" : "0 20px",
      fontFamily: FF,
      fontSize: 16,
      fontWeight: 600,
      color: "#0A0A0A",
      background: "white",
    }}
  >
    <div>{kind === "ios" ? "9:41" : "10:24"}</div>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <div style={{ width: 18, height: 12, borderRadius: 2, background: "#0A0A0A" }} />
      <div style={{ width: 22, height: 12, borderRadius: 2, background: "#0A0A0A" }} />
      <div style={{ width: 26, height: 12, borderRadius: 3, border: "1px solid #0A0A0A" }} />
    </div>
  </div>
);

// Padlock icon
const Lock: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = "#0A0A0A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="11" width="16" height="10" rx="2" fill={color} />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

// Safari chrome
const SafariBar: React.FC = () => (
  <div style={{ background: "#F2F2F7", padding: "10px 16px", fontFamily: FF }}>
    <div
      style={{
        background: "white",
        borderRadius: 12,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#0A0A0A",
        fontSize: 16,
        fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
    >
      <Lock size={13} />
      <span>jalimpo.com</span>
    </div>
  </div>
);

const SafariBottomBar: React.FC<{ highlightShare?: boolean }> = ({ highlightShare }) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#F2F2F7",
      padding: "14px 24px 28px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: FF,
    }}
  >
    {["‹", "›", "share", "▢", "☰"].map((k, i) => (
      <div
        key={i}
        style={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          borderRadius: 10,
          background: highlightShare && k === "share" ? MINT : "transparent",
          transition: "background .3s",
          fontSize: 24,
          color: highlightShare && k === "share" ? "white" : "#0A84FF",
          fontWeight: 600,
          boxShadow: highlightShare && k === "share" ? `0 0 24px ${MINT}` : "none",
        }}
      >
        {k === "share" ? (
          <ShareIcon color={highlightShare ? "white" : "#0A84FF"} />
        ) : (
          k
        )}
      </div>
    ))}
  </div>
);

const ShareIcon: React.FC<{ color?: string }> = ({ color = "#0A84FF" }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M12 3l-4 4M12 3l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Chrome chrome
const ChromeBar: React.FC<{ highlightMenu?: boolean }> = ({ highlightMenu }) => (
  <div
    style={{
      background: "#F1F3F4",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontFamily: FF,
    }}
  >
    <div style={{ fontSize: 22, color: "#5F6368" }}>‹</div>
    <div
      style={{
        flex: 1,
        background: "white",
        height: 42,
        borderRadius: 22,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        color: "#0A0A0A",
        fontSize: 15,
        fontWeight: 500,
      }}
    >
      <Lock size={12} color="#5F6368" />
      <span>jalimpo.com</span>
    </div>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        display: "grid",
        placeItems: "center",
        background: highlightMenu ? MINT : "transparent",
        boxShadow: highlightMenu ? `0 0 24px ${MINT}` : "none",
        transition: "background .3s",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: 2, background: highlightMenu ? "white" : "#5F6368" }} />
        ))}
      </div>
    </div>
  </div>
);

// App screenshot area inside phone
const AppScreen: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: NAVY }}>
    <Img
      src={staticFile("images/app-client.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
    />
  </div>
);

// ============================================================
// iOS SAFARI FLOW
// ============================================================

// Scene A1 — Title
const IosTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <div style={{ transform: `scale(${s})`, textAlign: "center" }}>
        <Brand scale={1.4} />
        <div style={{ marginTop: 42, color: MINT_SOFT, fontSize: 26, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" }}>
          Instalar no iPhone
        </div>
        <div style={{ marginTop: 12, color: "white", fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
          Safari em<br/>3 passos
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene A2 — Open Safari on jalimpo.com
const IosStep1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={1} title="Abra jalimpo.com no Safari" />
      <div style={{ transform: `scale(${0.88 + s * 0.08})`, marginTop: 40 }}>
        <Phone kind="ios">
          <StatusBar kind="ios" />
          <SafariBar />
          <div style={{ position: "absolute", top: 116, bottom: 96, left: 0, right: 0, overflow: "hidden" }}>
            <AppScreen />
          </div>
          <SafariBottomBar />
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

// Scene A3 — Tap Share
const IosStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={2} title="Toque no botão Compartilhar" />
      <div style={{ position: "relative", transform: `scale(${0.88 + s * 0.08})`, marginTop: 40 }}>
        <Phone kind="ios">
          <StatusBar kind="ios" />
          <SafariBar />
          <div style={{ position: "absolute", top: 116, bottom: 96, left: 0, right: 0, overflow: "hidden" }}>
            <AppScreen />
          </div>
          <SafariBottomBar highlightShare />
        </Phone>
        {/* Tap on share button — 3rd of 5 buttons, bottom bar */}
        <Tap x={270} y={1080} delay={10} />
      </div>
    </AbsoluteFill>
  );
};

// Scene A4 — Share sheet + Add to Home Screen
const IosStep3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheet = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const y = interpolate(sheet, [0, 1], [700, 0]);
  const highlight = frame > 30;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={3} title='Escolha "Adicionar à Tela de Início"' />
      <div style={{ position: "relative", marginTop: 40 }}>
        <Phone kind="ios">
          <StatusBar kind="ios" />
          <SafariBar />
          <div style={{ position: "absolute", top: 116, bottom: 0, left: 0, right: 0, overflow: "hidden", background: "rgba(0,0,0,0.35)" }}>
            <AppScreen />
          </div>
          {/* Share sheet */}
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 24,
              background: "#F2F2F7",
              borderRadius: 24,
              padding: 16,
              transform: `translateY(${y}px)`,
              boxShadow: "0 -10px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* App preview row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: 12, borderRadius: 14, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: MINT, display: "grid", placeItems: "center" }}>
                <Img src={staticFile("images/logo-icon.png")} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#0A0A0A", fontSize: 15 }}>Já Limpo</div>
                <div style={{ color: "#8E8E93", fontSize: 12 }}>jalimpo.com</div>
              </div>
            </div>
            {/* Action row */}
            <ShareRow
              icon={<PlusIcon />}
              label="Adicionar à Tela de Início"
              highlight={highlight}
            />
            <ShareRow icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-6-4-6 4z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} label="Adicionar aos Favoritos" />
            <ShareRow icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="6" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="3" y="6" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/></svg>} label="Copiar" />
          </div>
        </Phone>
        {highlight && <Tap x={330} y={880} delay={35} />}
      </div>
    </AbsoluteFill>
  );
};

const ShareRow: React.FC<{ icon: React.ReactNode; label: string; highlight?: boolean }> = ({ icon, label, highlight }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: highlight ? MINT : "white",
      padding: "16px 18px",
      borderRadius: 12,
      marginTop: 6,
      color: highlight ? "white" : "#0A0A0A",
      fontWeight: highlight ? 700 : 500,
      fontSize: 16,
      boxShadow: highlight ? `0 0 30px ${MINT}77` : "none",
    }}
  >
    <span>{label}</span>
    <span style={{ fontSize: 20 }}>{icon}</span>
  </div>
);

const PlusIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Scene A5 — Confirm add (dialog)
const IosStep4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={4} title='Confirme em "Adicionar"' />
      <div style={{ position: "relative", marginTop: 40, transform: `scale(${0.9 + s * 0.06})` }}>
        <Phone kind="ios">
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 440,
              background: "#F2F2F7",
              borderRadius: 22,
              padding: 20,
              fontFamily: FF,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ color: "#0A84FF", fontSize: 17, fontWeight: 500 }}>Cancelar</div>
              <div style={{ color: "#0A0A0A", fontWeight: 700, fontSize: 17 }}>Tela de Início</div>
              <div style={{ background: MINT, color: "white", padding: "6px 14px", borderRadius: 20, fontWeight: 700, fontSize: 15, boxShadow: `0 0 20px ${MINT}` }}>Adicionar</div>
            </div>
            <div style={{ background: "white", borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: MINT, display: "grid", placeItems: "center" }}>
                <Img src={staticFile("images/logo-icon.png")} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0A0A0A", fontSize: 17 }}>Já Limpo</div>
                <div style={{ color: "#8E8E93", fontSize: 13 }}>jalimpo.com</div>
              </div>
            </div>
          </div>
        </Phone>
        <Tap x={430} y={520} delay={20} />
      </div>
    </AbsoluteFill>
  );
};

// Scene A6 — Home screen with icon
const HomeScreenPhone: React.FC<{ kind: "ios" | "android" }> = ({ kind }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 200 } });
  const glow = interpolate(frame, [30, 60, 90], [0, 1, 0.6], { extrapolateRight: "clamp" });

  const wallpaper = kind === "ios"
    ? `linear-gradient(160deg, #1F2A44 0%, #4B3E7A 60%, #7A4E88 100%)`
    : `linear-gradient(160deg, #0F3A2E 0%, #133F4A 100%)`;

  const apps = [
    { label: "Mensagens", color: "#34C759", letter: "M" },
    { label: "Câmera", color: "#3A3A3C", letter: "C" },
    { label: "Fotos", color: "#F2F2F7", letter: "F", dark: true },
    { label: "Mapas", color: "#5AC8FA", letter: "◇" },
    { label: "WhatsApp", color: "#25D366", letter: "W" },
    { label: "Ajustes", color: "#8E8E93", letter: "⚙" },
    { label: "Safari", color: "#0A84FF", letter: "S" },
    { label: "Notas", color: "#FFCC00", letter: "N", dark: true },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, background: wallpaper, padding: "80px 30px 30px", fontFamily: FF }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
        {apps.map((a, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ width: 96, height: 96, borderRadius: kind === "ios" ? 22 : 48, background: a.color, display: "grid", placeItems: "center", fontSize: 44, fontWeight: 700, color: a.dark ? "#0A0A0A" : "white", fontFamily: FF, boxShadow: "0 6px 14px rgba(0,0,0,0.25)" }}>
              {a.letter}
            </div>
            <div style={{ color: "white", fontSize: 14, marginTop: 8, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{a.label}</div>
          </div>
        ))}
        {/* Já Limpo icon appearing */}
        <div style={{ textAlign: "center", transform: `scale(${pop})` }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: kind === "ios" ? 22 : 48,
              background: MINT,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 6px 30px ${MINT}${Math.round(glow * 255).toString(16).padStart(2, "0")}, 0 0 ${40 * glow}px ${MINT}`,
            }}
          >
            <Img src={staticFile("images/logo-icon.png")} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
          </div>
          <div style={{ color: "white", fontSize: 14, marginTop: 8, fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>Já Limpo</div>
        </div>
      </div>
    </div>
  );
};

const IosStep5: React.FC = () => {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={5} title="Pronto! Ícone na sua tela" />
      <div style={{ position: "relative", marginTop: 40 }}>
        <Phone kind="ios">
          <StatusBar kind="ios" />
          <HomeScreenPhone kind="ios" />
        </Phone>
        <Tap x={430} y={720} delay={45} />
      </div>
    </AbsoluteFill>
  );
};

// Scene A7 — Outro
const Outro: React.FC<{ platform: string }> = ({ platform }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <div style={{ transform: `scale(${s})`, textAlign: "center" }}>
        <Brand scale={1.6} />
        <div style={{ marginTop: 40, color: "white", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
          Chamou,<br/>tá limpo.
        </div>
        <div style={{ marginTop: 24, color: MINT_SOFT, fontSize: 24, fontWeight: 600 }}>
          Instalado no {platform}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Shared step label at top
const StepLabel: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `translateY(${(1 - s) * -30}px)`, opacity: s }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FF }}>
        <div style={{ width: 68, height: 68, borderRadius: 20, background: MINT, color: "white", display: "grid", placeItems: "center", fontSize: 32, fontWeight: 800, boxShadow: `0 0 30px ${MINT}88` }}>{n}</div>
        <div style={{ color: "white", fontSize: 32, fontWeight: 700, maxWidth: 800 }}>{title}</div>
      </div>
    </div>
  );
};

// ============================================================
// ANDROID CHROME FLOW
// ============================================================

const AndTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <div style={{ transform: `scale(${s})`, textAlign: "center" }}>
        <Brand scale={1.4} />
        <div style={{ marginTop: 42, color: MINT_SOFT, fontSize: 26, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase" }}>
          Instalar no Android
        </div>
        <div style={{ marginTop: 12, color: "white", fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
          Chrome em<br/>3 passos
        </div>
      </div>
    </AbsoluteFill>
  );
};

const AndStep1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={1} title="Abra jalimpo.com no Chrome" />
      <div style={{ transform: `scale(${0.88 + s * 0.08})`, marginTop: 40 }}>
        <Phone kind="android">
          <StatusBar kind="android" />
          <ChromeBar />
          <div style={{ position: "absolute", top: 118, bottom: 0, left: 0, right: 0, overflow: "hidden" }}>
            <AppScreen />
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

const AndStep2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={2} title="Toque no menu ⋮ (canto superior)" />
      <div style={{ position: "relative", transform: `scale(${0.88 + s * 0.08})`, marginTop: 40 }}>
        <Phone kind="android">
          <StatusBar kind="android" />
          <ChromeBar highlightMenu />
          <div style={{ position: "absolute", top: 118, bottom: 0, left: 0, right: 0, overflow: "hidden" }}>
            <AppScreen />
          </div>
        </Phone>
        <Tap x={490} y={175} delay={12} />
      </div>
    </AbsoluteFill>
  );
};

const AndStep3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22, stiffness: 140 } });
  const items = [
    { label: "Nova aba", icon: "＋" },
    { label: "Nova aba anônima", icon: "◑" },
    { label: "Favoritos", icon: "★" },
    { label: "Histórico", icon: "⟳" },
    { label: "Instalar aplicativo", icon: <PlusIcon />, highlight: true },
    { label: "Compartilhar…", icon: "↗" },
    { label: "Configurações", icon: "⚙" },
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={3} title='Escolha "Instalar aplicativo"' />
      <div style={{ position: "relative", marginTop: 40 }}>
        <Phone kind="android">
          <StatusBar kind="android" />
          <ChromeBar />
          <div style={{ position: "absolute", top: 118, bottom: 0, left: 0, right: 0, overflow: "hidden", background: "rgba(0,0,0,0.3)" }}>
            <AppScreen />
          </div>
          {/* Menu */}
          <div
            style={{
              position: "absolute",
              top: 118,
              right: 12,
              width: 320,
              background: "white",
              borderRadius: 14,
              padding: 8,
              boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
              transform: `scale(${s}) translateY(${(1 - s) * -20}px)`,
              transformOrigin: "top right",
              fontFamily: FF,
            }}
          >
            {items.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 14px",
                  borderRadius: 10,
                  background: it.highlight ? MINT : "transparent",
                  color: it.highlight ? "white" : "#0A0A0A",
                  fontWeight: it.highlight ? 700 : 500,
                  fontSize: 15,
                  boxShadow: it.highlight ? `0 0 20px ${MINT}66` : "none",
                  marginBottom: 2,
                }}
              >
                <span>{it.label}</span>
                <span style={{ fontSize: 18, display: "grid", placeItems: "center", width: 22, height: 22 }}>{it.icon}</span>
              </div>
            ))}
          </div>
        </Phone>
        <Tap x={430} y={490} delay={22} />
      </div>
    </AbsoluteFill>
  );
};

const AndStep4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20 } });
  const y = interpolate(s, [0, 1], [500, 0]);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <StepLabel n={4} title='Toque em "Instalar"' />
      <div style={{ position: "relative", marginTop: 40 }}>
        <Phone kind="android">
          <StatusBar kind="android" />
          <ChromeBar />
          <div style={{ position: "absolute", top: 118, bottom: 0, left: 0, right: 0, overflow: "hidden", background: "rgba(0,0,0,0.5)" }}>
            <AppScreen />
          </div>
          {/* Bottom dialog */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: "white",
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: 22,
              transform: `translateY(${y}px)`,
              fontFamily: FF,
              boxShadow: "0 -10px 30px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: MINT, display: "grid", placeItems: "center" }}>
                <Img src={staticFile("images/logo-icon.png")} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0A0A0A", fontSize: 20 }}>Instalar aplicativo</div>
                <div style={{ color: "#5F6368", fontSize: 14 }}>Já Limpo · jalimpo.com</div>
              </div>
            </div>
            <div style={{ color: "#3C4043", fontSize: 15, lineHeight: 1.4, marginBottom: 20 }}>
              Instale para abrir mais rápido, receber notificações e usar como um app nativo.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <div style={{ padding: "12px 20px", color: "#5F6368", fontWeight: 600, fontSize: 15 }}>Cancelar</div>
              <div style={{ background: MINT, color: "white", padding: "12px 28px", borderRadius: 22, fontWeight: 700, fontSize: 15, boxShadow: `0 0 24px ${MINT}` }}>Instalar</div>
            </div>
          </div>
        </Phone>
        <Tap x={440} y={1030} delay={25} />
      </div>
    </AbsoluteFill>
  );
};

const AndStep5: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
    <Bg />
    <StepLabel n={5} title="Pronto! Ícone na sua tela" />
    <div style={{ position: "relative", marginTop: 40 }}>
      <Phone kind="android">
        <StatusBar kind="android" />
        <HomeScreenPhone kind="android" />
      </Phone>
      <Tap x={430} y={720} delay={45} />
    </div>
  </AbsoluteFill>
);

// ============================================================
// Composition wrappers
// ============================================================

const Scene: React.FC<{ from: number; duration: number; children: React.ReactNode }> = ({ from, duration, children }) => (
  <Sequence from={from} durationInFrames={duration}>{children}</Sequence>
);

const FPS = 30;
const D_TITLE = 2.5 * FPS;
const D_STEP = 3 * FPS;
const D_OUTRO = 3 * FPS;

export const IOS_DURATION = D_TITLE + D_STEP * 5 + D_OUTRO;
export const AND_DURATION = D_TITLE + D_STEP * 5 + D_OUTRO;

export const IosVideo: React.FC = () => {
  let t = 0;
  const s: React.ReactNode[] = [];
  s.push(<Scene key="t" from={t} duration={D_TITLE}><IosTitle /></Scene>); t += D_TITLE;
  s.push(<Scene key="1" from={t} duration={D_STEP}><IosStep1 /></Scene>); t += D_STEP;
  s.push(<Scene key="2" from={t} duration={D_STEP}><IosStep2 /></Scene>); t += D_STEP;
  s.push(<Scene key="3" from={t} duration={D_STEP}><IosStep3 /></Scene>); t += D_STEP;
  s.push(<Scene key="4" from={t} duration={D_STEP}><IosStep4 /></Scene>); t += D_STEP;
  s.push(<Scene key="5" from={t} duration={D_STEP}><IosStep5 /></Scene>); t += D_STEP;
  s.push(<Scene key="o" from={t} duration={D_OUTRO}><Outro platform="iPhone" /></Scene>);
  return <AbsoluteFill>{s}</AbsoluteFill>;
};

export const AndroidVideo: React.FC = () => {
  let t = 0;
  const s: React.ReactNode[] = [];
  s.push(<Scene key="t" from={t} duration={D_TITLE}><AndTitle /></Scene>); t += D_TITLE;
  s.push(<Scene key="1" from={t} duration={D_STEP}><AndStep1 /></Scene>); t += D_STEP;
  s.push(<Scene key="2" from={t} duration={D_STEP}><AndStep2 /></Scene>); t += D_STEP;
  s.push(<Scene key="3" from={t} duration={D_STEP}><AndStep3 /></Scene>); t += D_STEP;
  s.push(<Scene key="4" from={t} duration={D_STEP}><AndStep4 /></Scene>); t += D_STEP;
  s.push(<Scene key="5" from={t} duration={D_STEP}><AndStep5 /></Scene>); t += D_STEP;
  s.push(<Scene key="o" from={t} duration={D_OUTRO}><Outro platform="Android" /></Scene>);
  return <AbsoluteFill>{s}</AbsoluteFill>;
};

// Legacy export
export const MainVideo = IosVideo;
export const DURATION = IOS_DURATION;
