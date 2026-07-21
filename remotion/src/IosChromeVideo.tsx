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
// Base
// ============================================================
const Bg: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 18% 12%, ${MINT}22 0%, transparent 45%), radial-gradient(circle at 85% 92%, ${MINT}1A 0%, transparent 50%), linear-gradient(160deg, ${NAVY} 0%, ${NAVY_2} 100%)`,
    }}
  />
);

// Real brand lockup
const Brand: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <Img
    src={staticFile("images/logo-jalimpo.png")}
    style={{ width: 520 * scale, objectFit: "contain", filter: `drop-shadow(0 12px 40px ${MINT}55)` }}
  />
);

// Tap / pulse ring
const Tap: React.FC<{ x: number; y: number; delay?: number; size?: number }> = ({
  x,
  y,
  delay = 0,
  size = 90,
}) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  if (local < 0) return null;
  const cycle = local % 45;
  const ring = interpolate(cycle, [0, 30, 45], [0.6, 1.6, 0.6]);
  const ringOp = interpolate(cycle, [0, 30, 45], [0.9, 0, 0.9]);
  const dot = interpolate(cycle, [0, 12, 24], [0.9, 1.1, 0.95]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `3px solid ${MINT}`,
          transform: `scale(${ring})`,
          opacity: ringOp,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: size * 0.28,
          borderRadius: "50%",
          background: MINT,
          boxShadow: `0 0 30px ${MINT}`,
          transform: `scale(${dot})`,
        }}
      />
    </div>
  );
};

// Callout arrow with text — always points to something concrete
const Callout: React.FC<{
  x: number;
  y: number;
  text: string;
  side?: "left" | "right" | "top" | "bottom";
  delay?: number;
}> = ({ x, y, text, side = "left", delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const dx = side === "left" ? -30 : side === "right" ? 30 : 0;
  const dy = side === "top" ? -30 : side === "bottom" ? 30 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x + dx * (1 - s),
        top: y + dy * (1 - s),
        opacity: s,
        transform: `translate(${side === "left" ? "-100%" : side === "right" ? "0" : "-50%"}, ${
          side === "top" ? "-100%" : side === "bottom" ? "0" : "-50%"
        })`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: MINT,
          color: "#062017",
          fontFamily: FF,
          fontWeight: 700,
          fontSize: 22,
          padding: "12px 18px",
          borderRadius: 14,
          whiteSpace: "nowrap",
          boxShadow: `0 10px 30px ${MINT}66`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// iPhone shell (matches proportions of the screenshot ratio 810x1620 => 1:2)
const IPHONE_W = 560;
const IPHONE_H = 1180;

const IPhone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: IPHONE_W,
      height: IPHONE_H,
      borderRadius: 72,
      background: "#0A0A0A",
      padding: 14,
      boxShadow:
        "0 50px 120px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.08) inset",
      position: "relative",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 58,
        background: "black",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Dynamic Island */}
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
          zIndex: 30,
        }}
      />
      {children}
    </div>
  </div>
);

// The install page screenshot fills the phone
const InstallPageBg: React.FC = () => (
  <Img
    src={staticFile("images/install-top.jpg")}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
  />
);

// ============================================================
// Coordinates on the screenshot (mapped to IPHONE_W=560, IPHONE_H=1180 inner)
// Screenshot is ~810x1620. Share button top-right center ≈ (750, 57)
// -> x ratio 0.926, y ratio 0.035
// Inner area is 532x1152 (14 padding). We ignore the tiny padding for a clean read.
// ============================================================
const SHARE_X = IPHONE_W * 0.926; // ~519
const SHARE_Y = IPHONE_H * 0.045; // ~53 (a bit lower to sit under Dynamic Island vibe)

// ============================================================
// Scene: Intro
// ============================================================
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16 } });
  const s2 = spring({ frame: frame - 20, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <div style={{ textAlign: "center", opacity: s }}>
        <div style={{ transform: `scale(${0.9 + s * 0.1})` }}>
          <Brand scale={1.1} />
        </div>
        <div
          style={{
            marginTop: 60,
            color: MINT_SOFT,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: s2,
          }}
        >
          Instalar no iPhone
        </div>
        <div
          style={{
            marginTop: 18,
            color: "white",
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 20}px)`,
          }}
        >
          Chrome, em<br />4 passos.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Step wrapper with number & title
// ============================================================
const StepShell: React.FC<{
  n: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ n, title, subtitle, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", fontFamily: FF, paddingTop: 90 }}>
      <Bg />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          transform: `translateY(${(1 - s) * -20}px)`,
          opacity: s,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: MINT,
            color: "#062017",
            display: "grid",
            placeItems: "center",
            fontSize: 34,
            fontWeight: 800,
            boxShadow: `0 0 30px ${MINT}77`,
          }}
        >
          {n}
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ color: MINT_SOFT, fontSize: 20, fontWeight: 500, marginTop: 4 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ marginTop: 40, transform: `scale(${0.92 + s * 0.05})` }}>{children}</div>
    </AbsoluteFill>
  );
};

// ============================================================
// Step 1 — you are here at jalimpo.com in Chrome
// ============================================================
const Step1: React.FC = () => (
  <StepShell n={1} title="Você está em jalimpo.com" subtitle="Aberto no Chrome do seu iPhone">
    <div style={{ position: "relative" }}>
      <IPhone>
        <InstallPageBg />
      </IPhone>
    </div>
  </StepShell>
);

// ============================================================
// Step 2 — tap Share icon (top-right in Chrome iOS bar)
// ============================================================
const Step2: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <StepShell n={2} title="Toque em Compartilhar" subtitle="Ícone no canto superior direito">
      <div style={{ position: "relative" }}>
        <IPhone>
          <InstallPageBg />
          {/* Highlight ring around the share button in the Chrome top bar */}
          <div
            style={{
              position: "absolute",
              left: SHARE_X - 44,
              top: SHARE_Y - 6,
              width: 88,
              height: 88,
              borderRadius: 24,
              border: `3px solid ${MINT}`,
              boxShadow: `0 0 40px ${MINT}, inset 0 0 20px ${MINT}55`,
              opacity: interpolate(frame % 40, [0, 20, 40], [0.6, 1, 0.6]),
            }}
          />
        </IPhone>
        <Tap x={SHARE_X + 14} y={SHARE_Y + 34} delay={12} size={110} />
        <Callout x={SHARE_X - 60} y={SHARE_Y + 40} text="Toque aqui" side="left" delay={20} />
      </div>
    </StepShell>
  );
};

// ============================================================
// Chrome iOS Share Sheet — hand rebuilt to animate cleanly
// ============================================================
const ShareIcon: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M12 3l-4 4M12 3l4 4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AddIcon: React.FC<{ color?: string }> = ({ color = "#0A0A0A" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="2" />
    <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const BookmarkIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12v18l-6-4-6 4z" stroke="#0A0A0A" strokeWidth="2" />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="8" y="8" width="12" height="12" rx="2" stroke="#0A0A0A" strokeWidth="2" />
    <rect x="4" y="4" width="12" height="12" rx="2" stroke="#0A0A0A" strokeWidth="2" />
  </svg>
);

// ============================================================
// Step 3 — Share sheet slides up, highlight "Adicionar à Tela de Início"
// ============================================================
const Step3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheet = spring({ frame: frame - 6, fps, config: { damping: 22, stiffness: 130 } });
  const y = interpolate(sheet, [0, 1], [900, 0]);
  const highlight = frame > 40;
  const scrimOp = interpolate(sheet, [0, 1], [0, 0.55]);

  const sheetWidth = 512;
  const rowHeight = 68;

  return (
    <StepShell n={3} title='Escolha "Adicionar à Tela de Início"'>
      <div style={{ position: "relative" }}>
        <IPhone>
          <InstallPageBg />
          {/* Scrim */}
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${scrimOp})` }} />
          {/* Share sheet */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 24,
              width: sheetWidth,
              transform: `translateY(${y}px)`,
              fontFamily: FF,
            }}
          >
            {/* App card */}
            <div
              style={{
                background: "rgba(245,245,247,0.98)",
                borderRadius: 22,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 10,
                backdropFilter: "blur(10px)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  background: MINT,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Img src={staticFile("images/logo-icon.png")} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#0A0A0A", fontSize: 18 }}>Já Limpo</div>
                <div style={{ color: "#8E8E93", fontSize: 14 }}>jalimpo.com</div>
              </div>
              <ShareIcon />
            </div>

            {/* Actions */}
            <div
              style={{
                background: "rgba(245,245,247,0.98)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              }}
            >
              {[
                { label: "Adicionar à Tela de Início", icon: <AddIcon />, hl: true },
                { label: "Adicionar aos Favoritos", icon: <BookmarkIcon /> },
                { label: "Copiar", icon: <CopyIcon /> },
              ].map((it, i, arr) => {
                const isHl = it.hl && highlight;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      height: rowHeight,
                      padding: "0 20px",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                      background: isHl ? MINT : "transparent",
                      color: isHl ? "white" : "#0A0A0A",
                      fontWeight: it.hl ? 600 : 500,
                      fontSize: 18,
                      boxShadow: isHl ? `inset 0 0 30px ${MINT}88` : "none",
                    }}
                  >
                    <span>{it.label}</span>
                    <span style={{ opacity: isHl ? 0 : 1 }}>{it.icon}</span>
                    {isHl && <AddIcon color="white" />}
                  </div>
                );
              })}
            </div>
          </div>
        </IPhone>
        {highlight && <Tap x={IPHONE_W * 0.5} y={IPHONE_H * 0.72} delay={45} size={110} />}
      </div>
    </StepShell>
  );
};

// ============================================================
// Step 4 — Add to Home Screen confirmation dialog
// ============================================================
const Step4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 18 } });
  return (
    <StepShell n={4} title='Toque em "Adicionar"' subtitle="No canto superior direito">
      <div style={{ position: "relative" }}>
        <IPhone>
          <InstallPageBg />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          <div
            style={{
              position: "absolute",
              top: "18%",
              left: 20,
              right: 20,
              background: "#F2F2F7",
              borderRadius: 22,
              padding: 22,
              fontFamily: FF,
              transform: `scale(${0.9 + s * 0.1}) translateY(${(1 - s) * -20}px)`,
              opacity: s,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ color: "#0A84FF", fontSize: 19, fontWeight: 500 }}>Cancelar</div>
              <div style={{ color: "#0A0A0A", fontWeight: 700, fontSize: 20 }}>Tela de Início</div>
              <div
                style={{
                  background: MINT,
                  color: "white",
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 17,
                  boxShadow: `0 0 24px ${MINT}`,
                }}
              >
                Adicionar
              </div>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: 16,
                padding: 18,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 16,
                  background: MINT,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Img src={staticFile("images/logo-icon.png")} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0A0A0A", fontSize: 20 }}>Já Limpo</div>
                <div style={{ color: "#8E8E93", fontSize: 15, marginTop: 2 }}>jalimpo.com</div>
              </div>
            </div>
          </div>
        </IPhone>
        <Tap x={IPHONE_W * 0.85} y={IPHONE_H * 0.235} delay={28} size={100} />
        <Callout x={IPHONE_W * 0.85} y={IPHONE_H * 0.19} text="Adicionar" side="top" delay={22} />
      </div>
    </StepShell>
  );
};

// ============================================================
// Step 5 — Home screen with icon appearing
// ============================================================
const HomeScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 12, fps, config: { damping: 9, stiffness: 180 } });
  const glow = interpolate(frame, [24, 60, 120], [0, 1, 0.6], { extrapolateRight: "clamp" });

  const apps = [
    { label: "Mensagens", color: "#34C759", letter: "M" },
    { label: "FaceTime", color: "#00E676", letter: "F" },
    { label: "Câmera", color: "#3A3A3C", letter: "C" },
    { label: "Fotos", color: "#F2F2F7", letter: "F", dark: true },
    { label: "Mapas", color: "#5AC8FA", letter: "M" },
    { label: "Ajustes", color: "#8E8E93", letter: "⚙" },
    { label: "Chrome", color: "#FFFFFF", letter: "C", dark: true },
    { label: "WhatsApp", color: "#25D366", letter: "W" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, #1F2A44 0%, #3A2E5A 60%, #5A3E68 100%)",
        padding: "80px 32px 40px",
        fontFamily: FF,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {apps.map((a, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 94,
                height: 94,
                borderRadius: 22,
                background: a.color,
                display: "grid",
                placeItems: "center",
                fontSize: 42,
                fontWeight: 800,
                color: a.dark ? "#0A0A0A" : "white",
                boxShadow: "0 8px 18px rgba(0,0,0,0.3)",
              }}
            >
              {a.letter}
            </div>
            <div style={{ color: "white", fontSize: 14, marginTop: 8, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
              {a.label}
            </div>
          </div>
        ))}
        {/* Já Limpo icon */}
        <div style={{ textAlign: "center", transform: `scale(${pop})` }}>
          <div
            style={{
              width: 94,
              height: 94,
              borderRadius: 22,
              background: MINT,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 8px 30px ${MINT}, 0 0 ${60 * glow}px ${MINT}`,
            }}
          >
            <Img src={staticFile("images/logo-icon.png")} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
          </div>
          <div style={{ color: "white", fontSize: 14, marginTop: 8, fontWeight: 800, textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
            Já Limpo
          </div>
        </div>
      </div>
    </div>
  );
};

const Step5: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <StepShell n={5} title="Pronto! Ícone na sua tela" subtitle="Toque para abrir como um app">
      <div style={{ position: "relative" }}>
        <IPhone>
          <HomeScreen />
        </IPhone>
        <Tap x={IPHONE_W * 0.85} y={IPHONE_H * 0.62} delay={40} size={100} />
      </div>
    </StepShell>
  );
};

// ============================================================
// Outro
// ============================================================
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16 } });
  const s2 = spring({ frame: frame - 15, fps, config: { damping: 18 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FF }}>
      <Bg />
      <div style={{ textAlign: "center", opacity: s }}>
        <div style={{ transform: `scale(${0.9 + s * 0.1})` }}>
          <Brand scale={1.2} />
        </div>
        <div
          style={{
            marginTop: 60,
            color: "white",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.02,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 20}px)`,
          }}
        >
          Chamou,<br />tá limpo.
        </div>
        <div
          style={{
            marginTop: 28,
            color: MINT_SOFT,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            opacity: s2,
          }}
        >
          jalimpo.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Composition
// ============================================================
const FPS = 30;
const D_INTRO = Math.round(3.5 * FPS);
const D_STEP1 = Math.round(4.5 * FPS);
const D_STEP2 = Math.round(5.0 * FPS);
const D_STEP3 = Math.round(5.5 * FPS);
const D_STEP4 = Math.round(4.5 * FPS);
const D_STEP5 = Math.round(4.0 * FPS);
const D_OUTRO = Math.round(4.0 * FPS);

export const IOS_CHROME_DURATION =
  D_INTRO + D_STEP1 + D_STEP2 + D_STEP3 + D_STEP4 + D_STEP5 + D_OUTRO;

const S: React.FC<{ from: number; d: number; children: React.ReactNode }> = ({ from, d, children }) => (
  <Sequence from={from} durationInFrames={d}>
    {children}
  </Sequence>
);

export const IosChromeVideo: React.FC = () => {
  let t = 0;
  const push = (d: number, node: React.ReactNode, key: string) => {
    const el = (
      <S key={key} from={t} d={d}>
        {node}
      </S>
    );
    t += d;
    return el;
  };
  const els = [
    push(D_INTRO, <Intro />, "intro"),
    push(D_STEP1, <Step1 />, "s1"),
    push(D_STEP2, <Step2 />, "s2"),
    push(D_STEP3, <Step3 />, "s3"),
    push(D_STEP4, <Step4 />, "s4"),
    push(D_STEP5, <Step5 />, "s5"),
    push(D_OUTRO, <Outro />, "outro"),
  ];
  return <AbsoluteFill>{els}</AbsoluteFill>;
};
