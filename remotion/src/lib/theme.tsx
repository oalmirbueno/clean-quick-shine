import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
export const FF = inter.fontFamily;

export const MINT = "#19CC97";
export const MINT_SOFT = "#8AE6C6";
export const NAVY = "#08172A";
export const NAVY_2 = "#0F2740";
export const NAVY_3 = "#153556";
export const INK = "#0A0A0A";

// ---------- Composition (portrait) ----------
export const CANVAS_W = 1080;
export const CANVAS_H = 1920;
// iPhone frame — big, dominates the composition
export const PHONE_W = 780;
export const PHONE_H = 1420;
export const PHONE_X = (CANVAS_W - PHONE_W) / 2;
export const PHONE_Y = 220;

// ---------- Backgrounds ----------
export const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = Math.sin(frame / 90) * 20;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${20 + shift}% ${10 - shift}%, ${MINT}26 0%, transparent 42%), radial-gradient(circle at ${80 - shift}% ${95 + shift}%, ${MINT}1F 0%, transparent 50%), linear-gradient(160deg, ${NAVY} 0%, ${NAVY_2} 55%, ${NAVY_3} 100%)`,
      }}
    />
  );
};

// Grain / subtle texture using SVG noise
export const Grain: React.FC = () => (
  <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" />
    </svg>
  </AbsoluteFill>
);

// ---------- Brand ----------
export const BrandLight: React.FC<{ width?: number }> = ({ width = 540 }) => (
  <Img
    src={staticFile("images/logo-light.png")}
    style={{
      width,
      objectFit: "contain",
      filter: `drop-shadow(0 10px 36px ${MINT}55)`,
    }}
  />
);

// ---------- Header used on every step ----------
export const StepHeader: React.FC<{
  n: number;
  total: number;
  browser: string;
  os: string;
  title: string;
}> = ({ n, total, browser, os, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 22 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 46,
        left: 60,
        right: 60,
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: FF,
        opacity: s,
        transform: `translateY(${(1 - s) * -18}px)`,
      }}
    >
      <BrandLight width={230} />
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Chip label={os} dark />
        <Chip label={browser} accent />
        <div
          style={{
            marginLeft: 14,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "white",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          Passo {n}/{total}
        </div>
      </div>
    </div>
  );
};

export const Chip: React.FC<{ label: string; accent?: boolean; dark?: boolean }> = ({
  label,
  accent,
  dark,
}) => (
  <div
    style={{
      padding: "10px 18px",
      borderRadius: 999,
      background: accent ? MINT : dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
      color: accent ? "#062017" : "white",
      border: accent ? "none" : "1px solid rgba(255,255,255,0.14)",
      fontFamily: FF,
      fontWeight: 700,
      fontSize: 22,
    }}
  >
    {label}
  </div>
);

// ---------- Tip card (below the phone) ----------
export const TipCard: React.FC<{
  title: string;
  tip: string;
  fallback?: string;
}> = ({ title, tip, fallback }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 6, fps, config: { damping: 22 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 60,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 26,
        padding: "22px 28px",
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
        fontFamily: FF,
        opacity: s,
        transform: `translateY(${(1 - s) * 24}px)`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: MINT,
          color: "#062017",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 32,
          flexShrink: 0,
        }}
      >
        i
      </div>
      <div style={{ color: "white" }}>
        <div style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>{title}</div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 22, lineHeight: 1.35 }}>
          {tip}
        </div>
        {fallback && (
          <div
            style={{
              marginTop: 10,
              color: MINT_SOFT,
              fontSize: 20,
              lineHeight: 1.35,
            }}
          >
            Não achou? {fallback}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- iPhone frame ----------
export const IPhone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: "absolute",
      left: PHONE_X,
      top: PHONE_Y,
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 96,
      background: "#0A0A0A",
      padding: 18,
      boxShadow:
        "0 60px 140px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.08) inset, 0 0 0 6px #1a1a1a",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 78,
        background: "black",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 170,
          height: 42,
          background: "#0A0A0A",
          borderRadius: 24,
          zIndex: 40,
        }}
      />
      {children}
    </div>
  </div>
);

// ---------- Tap indicator ----------
export const Tap: React.FC<{
  x: number;
  y: number;
  delay?: number;
  size?: number;
}> = ({ x, y, delay = 0, size = 110 }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  if (local < 0) return null;
  const cycle = local % 55;
  const ring = interpolate(cycle, [0, 35, 55], [0.5, 1.7, 0.5]);
  const ringOp = interpolate(cycle, [0, 35, 55], [1, 0, 1]);
  const dot = interpolate(cycle, [0, 14, 28], [0.9, 1.15, 0.95]);
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `4px solid ${MINT}`,
          transform: `scale(${ring})`,
          opacity: ringOp,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: size * 0.3,
          borderRadius: "50%",
          background: MINT,
          boxShadow: `0 0 40px ${MINT}`,
          transform: `scale(${dot})`,
        }}
      />
    </div>
  );
};

// Pulsing highlight ring around a UI element
export const HighlightRing: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  radius?: number;
}> = ({ x, y, w, h, radius = 22 }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(frame % 50, [0, 25, 50], [0.6, 1, 0.6]);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        border: `3px solid ${MINT}`,
        boxShadow: `0 0 40px ${MINT}, inset 0 0 20px ${MINT}44`,
        opacity: pulse,
        zIndex: 30,
        pointerEvents: "none",
      }}
    />
  );
};

// ---------- Icons ----------
export const ShareIosIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = INK,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3v13M12 3l-4 4M12 3l4 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const AddSquareIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = INK,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="2" />
    <path
      d="M12 8v8M8 12h8"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

export const BookmarkIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = INK,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3h12v18l-6-4-6 4z" stroke={color} strokeWidth="2" />
  </svg>
);

export const CopyIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = INK,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="8" y="8" width="12" height="12" rx="2" stroke={color} strokeWidth="2" />
    <rect x="4" y="4" width="12" height="12" rx="2" stroke={color} strokeWidth="2" />
  </svg>
);

export const DotsIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 26,
  color = "white",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

// ---------- Intro ----------
export const Intro: React.FC<{ os: string; browser: string; kicker?: string }> = ({
  os,
  browser,
  kicker = "Instalar o app",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 18 } });
  const s2 = spring({ frame: frame - 14, fps, config: { damping: 20 } });
  const s3 = spring({ frame: frame - 26, fps, config: { damping: 22 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FF,
      }}
    >
      <Bg />
      <Grain />
      {/* Concentric decorative rings */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          border: `1px solid ${MINT}18`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          border: `1px solid ${MINT}22`,
        }}
      />
      <div style={{ textAlign: "center", opacity: s1, position: "relative" }}>
        <div
          style={{
            color: MINT,
            letterSpacing: 8,
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 30,
            opacity: s2,
          }}
        >
          {kicker}
        </div>
        <div style={{ transform: `scale(${0.9 + s1 * 0.1})` }}>
          <BrandLight width={680} />
        </div>
        <div
          style={{
            marginTop: 60,
            color: "white",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 24}px)`,
          }}
        >
          Instale em<br />
          <span style={{ color: MINT }}>4 passos.</span>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-flex",
            gap: 16,
            opacity: s3,
            transform: `translateY(${(1 - s3) * 16}px)`,
          }}
        >
          <Chip label={os} dark />
          <Chip label={browser} accent />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Outro ----------
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  const s2 = spring({ frame: frame - 16, fps, config: { damping: 20 } });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FF,
      }}
    >
      <Bg />
      <Grain />
      <div style={{ textAlign: "center", opacity: s }}>
        <div style={{ transform: `scale(${0.9 + s * 0.1})` }}>
          <BrandLight width={720} />
        </div>
        <div
          style={{
            marginTop: 70,
            color: "white",
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 24}px)`,
          }}
        >
          Chamou,
          <br />
          <span style={{ color: MINT }}>tá limpo.</span>
        </div>
        <div
          style={{
            marginTop: 40,
            color: MINT_SOFT,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 6,
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

// ---------- Home Screen simulation (shared) ----------
export const HomeScreen: React.FC<{ variant: "ios" | "android"; iconDelay?: number }> = ({
  variant,
  iconDelay = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - iconDelay, fps, config: { damping: 9, stiffness: 180 } });
  const glow = interpolate(frame, [iconDelay + 12, iconDelay + 40, iconDelay + 120], [0, 1, 0.6], {
    extrapolateRight: "clamp",
  });

  // Blurred wallpaper — soft gradient so we don't rely on external images
  const wall =
    variant === "ios"
      ? "radial-gradient(circle at 30% 20%, #3B4CA8 0%, #1B1F3D 55%, #0A0F24 100%)"
      : "radial-gradient(circle at 70% 20%, #6B4CFF 0%, #2A1A66 55%, #0E0824 100%)";

  const iosApps = [
    { label: "FaceTime", color: "#34C759", letter: "F" },
    { label: "Calendar", color: "#FFFFFF", letter: "31", dark: true },
    { label: "Fotos", color: "#F2F2F7", letter: "◇", dark: true },
    { label: "Câmera", color: "#3A3A3C", letter: "◉" },
    { label: "Mapas", color: "#5AC8FA", letter: "▲" },
    { label: "Clima", color: "#0A84FF", letter: "☁" },
    { label: "Notas", color: "#FFCC00", letter: "≡", dark: true },
    { label: "Ajustes", color: "#8E8E93", letter: "⚙" },
    { label: "Safari", color: "#FFFFFF", letter: "◐", dark: true },
    { label: "Mensagens", color: "#34C759", letter: "◗" },
    { label: "Telefone", color: "#4CD964", letter: "☎" },
    { label: "WhatsApp", color: "#25D366", letter: "W" },
  ];

  const androidApps = [
    { label: "Play Store", color: "#FFFFFF", letter: "▶", dark: true },
    { label: "Chrome", color: "#FFFFFF", letter: "C", dark: true },
    { label: "Fotos", color: "#4285F4", letter: "◈" },
    { label: "YouTube", color: "#FF0000", letter: "▶" },
    { label: "Gmail", color: "#FFFFFF", letter: "M", dark: true },
    { label: "Maps", color: "#34A853", letter: "◇" },
    { label: "Câmera", color: "#2A2A2A", letter: "◉" },
    { label: "WhatsApp", color: "#25D366", letter: "W" },
    { label: "Contatos", color: "#4285F4", letter: "☎" },
    { label: "Config", color: "#616161", letter: "⚙" },
    { label: "Relógio", color: "#FFFFFF", letter: "◷", dark: true },
    { label: "Calendário", color: "#4285F4", letter: "31" },
  ];

  const apps = variant === "ios" ? iosApps : androidApps;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: wall,
        padding: variant === "ios" ? "130px 40px 40px" : "150px 40px 40px",
        fontFamily: FF,
      }}
    >
      {/* Status bar time */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: variant === "ios" ? "space-between" : "space-between",
          padding: "0 60px",
          color: "white",
          fontWeight: 700,
          fontSize: 24,
          zIndex: 5,
        }}
      >
        <div>{variant === "ios" ? "9:41" : "9:41"}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>●●●●</span>
          <span style={{ fontSize: 18 }}>▮</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 30,
        }}
      >
        {apps.map((a, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: variant === "ios" ? 32 : 999,
                background: a.color,
                display: "grid",
                placeItems: "center",
                fontSize: 56,
                fontWeight: 800,
                color: a.dark ? "#0A0A0A" : "white",
                boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                margin: "0 auto",
              }}
            >
              {a.letter}
            </div>
            <div
              style={{
                color: "white",
                fontSize: 20,
                marginTop: 12,
                textShadow: "0 1px 3px rgba(0,0,0,0.7)",
              }}
            >
              {a.label}
            </div>
          </div>
        ))}
        {/* Já Limpo — the new icon (pops in) */}
        <div style={{ textAlign: "center", transform: `scale(${pop})` }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: variant === "ios" ? 32 : 999,
              background: MINT,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 10px 30px ${MINT}, 0 0 ${80 * glow}px ${MINT}`,
              margin: "0 auto",
            }}
          >
            <Img
              src={staticFile("images/logo-icon.png")}
              style={{ width: "72%", height: "72%", objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              color: "white",
              fontSize: 20,
              marginTop: 12,
              fontWeight: 800,
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}
          >
            Já Limpo
          </div>
        </div>
      </div>
    </div>
  );
};
