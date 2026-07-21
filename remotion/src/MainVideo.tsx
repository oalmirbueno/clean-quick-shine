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
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const inter = loadInter("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const FF = inter.fontFamily;

const MINT = "#19CC97";
const MINT_SOFT = "#8AE6C6";
const NAVY = "#0B1E30";
const NAVY_2 = "#102A43";
const INK = "#0F172A";
const CARD = "rgba(255,255,255,0.06)";
const BORDER = "rgba(255,255,255,0.12)";

// Scene durations
const S1 = 90;   // Intro (3s)
const S2 = 150;  // iPhone reveals /install page (5s)
const S3 = 150;  // Tap Share (5s)
const S4 = 150;  // Add to Home Screen (5s)
const S5 = 150;  // Icon on home, open app (5s)
const S6 = 90;   // Outro (3s)
const T = 15;    // Transition duration

export const DURATION = S1 + S2 + S3 + S4 + S5 + S6 - T * 5;

// ============= Persistent background =============
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 12;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% ${20 + drift}%, ${NAVY_2} 0%, ${NAVY} 55%, #060F1B 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at ${50 + drift}% 110%, rgba(25,204,151,0.35), transparent 65%)`,
          opacity: 0.9,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 30% at ${15 - drift}% -5%, rgba(255,255,255,0.08), transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ============= iPhone frame =============
const IPhone: React.FC<{ children: React.ReactNode; scale?: number; y?: number }> = ({
  children,
  scale = 1,
  y = 0,
}) => {
  const W = 640;
  const H = 1300;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`,
        width: W,
        height: H,
        borderRadius: 78,
        padding: 14,
        background: "linear-gradient(160deg, #2a3444 0%, #0d141e 60%, #1a2432 100%)",
        boxShadow:
          "0 60px 120px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 66,
          overflow: "hidden",
          background: "#f6f8fb",
          boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.6)",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 180,
            height: 38,
            borderRadius: 22,
            background: "#000",
            zIndex: 20,
          }}
        />
        {children}
      </div>
    </div>
  );
};

// Pointer / tap indicator
const Pointer: React.FC<{ x: number; y: number; tap?: number }> = ({ x, y, tap = 0 }) => {
  const frame = useCurrentFrame();
  const pulse = tap > 0 && frame >= tap ? Math.max(0, 1 - (frame - tap) / 25) : 0;
  return (
    <>
      {pulse > 0 && (
        <div
          style={{
            position: "absolute",
            left: x - 60,
            top: y - 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `3px solid ${MINT}`,
            opacity: pulse,
            transform: `scale(${1 + (1 - pulse) * 1.5})`,
            zIndex: 30,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: x - 22,
          top: y - 22,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.95)",
          boxShadow: `0 0 0 6px ${MINT}55, 0 8px 24px rgba(0,0,0,0.35)`,
          zIndex: 31,
        }}
      />
    </>
  );
};

// ============= SCENE 1: Intro =============
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 20, stiffness: 120 } });
  const s2 = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 120 } });
  const s3 = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 120 } });
  const drift = Math.sin(frame / 20) * 4;

  return (
    <AbsoluteFill style={{ fontFamily: FF, color: "white", padding: 80 }}>
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: 0,
          right: 0,
          textAlign: "center",
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            borderRadius: 999,
            background: "rgba(25,204,151,0.14)",
            border: `1px solid ${MINT}55`,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 2,
            color: MINT_SOFT,
            opacity: s1,
            transform: `translateY(${(1 - s1) * 20}px)`,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: 999, background: MINT }} />
          TUTORIAL
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 130,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 40}px)`,
          }}
        >
          Instale o
        </div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 6,
            opacity: s2,
            transform: `translateY(${(1 - s2) * 40}px)`,
            background: `linear-gradient(120deg, ${MINT} 0%, #7EF0C2 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Já Limpo
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            fontWeight: 500,
            color: "rgba(255,255,255,0.72)",
            opacity: s3,
            transform: `translateY(${(1 - s3) * 20}px)`,
          }}
        >
          em poucos toques no seu iPhone
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============= SCENE 2: iPhone reveals /install page =============
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 90 } });
  const scale = interpolate(enter, [0, 1], [0.7, 1]);
  const opacity = enter;
  const captionOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <div style={{ opacity, transform: `scale(${1})` }}>
        <IPhone scale={scale}>
          {/* Fake browser bar (Safari-like) */}
          <div
            style={{
              position: "absolute",
              top: 76,
              left: 24,
              right: 24,
              height: 56,
              borderRadius: 18,
              background: "rgba(230,232,238,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: 22,
              color: "#3a4356",
              fontWeight: 500,
            }}
          >
            <span style={{ opacity: 0.6 }}>🔒</span>
            jalimpo.com
          </div>
          {/* App screenshot */}
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 0,
              right: 0,
              bottom: 60,
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("images/client.png")}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
          {/* Bottom Safari toolbar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 90,
              background: "rgba(240,242,246,0.95)",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              fontSize: 32,
              color: "#3a4356",
            }}
          >
            <span>‹</span>
            <span>›</span>
            <span style={{ color: MINT, fontWeight: 700 }}>⬆</span>
            <span>▢</span>
            <span>≡</span>
          </div>
        </IPhone>
      </div>

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          opacity: captionOpacity,
        }}
      >
        <div style={{ fontSize: 30, color: MINT, fontWeight: 700, letterSpacing: 3 }}>PASSO 1</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 8 }}>Abra jalimpo.com</div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", marginTop: 10 }}>
          no Safari do seu iPhone
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============= SCENE 3: Tap Share =============
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // Pointer moves from center to share icon
  const px = interpolate(frame, [10, 45], [540, 540], { extrapolateRight: "clamp" });
  // Share icon x is roughly middle of bottom bar. Phone is centered.
  // The share button in scene = center of iPhone bottom toolbar (which we render inside iPhone) — but here we overlay pointer in absolute video coords.
  // Bottom of iphone is around y ~ 1620 (video 1920 tall). Share icon centered-ish.
  const targetX = 540;
  const targetY = interpolate(frame, [10, 45], [1100, 1580], { extrapolateRight: "clamp" });
  const tapFrame = 46;

  // Share sheet slides up after tap
  const sheetY = spring({ frame: frame - 55, fps: 30, config: { damping: 22, stiffness: 110 } });
  const sheetOffset = interpolate(sheetY, [0, 1], [800, 0]);

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <IPhone>
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 24,
            right: 24,
            height: 56,
            borderRadius: 18,
            background: "rgba(230,232,238,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 22,
            color: "#3a4356",
            fontWeight: 500,
          }}
        >
          <span style={{ opacity: 0.6 }}>🔒</span>
          jalimpo.com
        </div>
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 0,
            right: 0,
            bottom: 60,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("images/client.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
        </div>
        {/* Bottom toolbar with highlight on share */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            background: "rgba(240,242,246,0.95)",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            fontSize: 32,
            color: "#3a4356",
          }}
        >
          <span>‹</span>
          <span>›</span>
          <span
            style={{
              color: MINT,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 12,
              background: `${MINT}22`,
              boxShadow: `0 0 0 2px ${MINT}66`,
            }}
          >
            ⬆
          </span>
          <span>▢</span>
          <span>≡</span>
        </div>

        {/* Share sheet */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 700,
            transform: `translateY(${sheetOffset}px)`,
            background: "rgba(245,247,251,0.98)",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 30,
            zIndex: 15,
            boxShadow: "0 -20px 40px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              width: 60,
              height: 5,
              background: "#cbd0d9",
              borderRadius: 999,
              margin: "0 auto 24px",
            }}
          />
          <div style={{ fontSize: 24, color: "#7a8394", fontWeight: 600, marginBottom: 20 }}>
            Compartilhar
          </div>
          {/* Icon row */}
          <div style={{ display: "flex", gap: 18, marginBottom: 30 }}>
            {["Msg", "Mail", "WhatsApp"].map((label, i) => (
              <div key={i} style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    width: 88,
                    height: 88,
                    background: "#dde2ec",
                    borderRadius: 22,
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 18, color: "#3a4356" }}>{label}</div>
              </div>
            ))}
          </div>
          {/* Options list */}
          {[
            { icon: "🔗", label: "Copiar" },
            { icon: "🏠", label: "Adicionar à Tela de Início", highlight: false },
            { icon: "⭐", label: "Adicionar aos Favoritos" },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 24px",
                background: "white",
                borderBottom: "1px solid #eef0f4",
                borderTopLeftRadius: i === 0 ? 18 : 0,
                borderTopRightRadius: i === 0 ? 18 : 0,
                borderBottomLeftRadius: i === 2 ? 18 : 0,
                borderBottomRightRadius: i === 2 ? 18 : 0,
                fontSize: 26,
                color: "#0f172a",
                fontWeight: 500,
              }}
            >
              <span>{it.label}</span>
              <span style={{ fontSize: 30 }}>{it.icon}</span>
            </div>
          ))}
        </div>
      </IPhone>

      {frame < 55 && <Pointer x={targetX} y={targetY} tap={tapFrame} />}

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          opacity: captionOpacity,
          fontFamily: FF,
        }}
      >
        <div style={{ fontSize: 30, color: MINT, fontWeight: 700, letterSpacing: 3 }}>PASSO 2</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 8 }}>Toque em Compartilhar</div>
      </div>
    </AbsoluteFill>
  );
};

// ============= SCENE 4: Add to Home Screen =============
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const captionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const targetX = 540;
  const targetY = interpolate(frame, [10, 45], [1350, 1300], { extrapolateRight: "clamp" });
  const tapFrame = 46;

  const highlight = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <IPhone>
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 24,
            right: 24,
            height: 56,
            borderRadius: 18,
            background: "rgba(230,232,238,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "#3a4356",
            fontWeight: 500,
          }}
        >
          🔒 jalimpo.com
        </div>
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 0,
            right: 0,
            height: 280,
            overflow: "hidden",
            opacity: 0.5,
          }}
        >
          <Img
            src={staticFile("images/client.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
        </div>

        {/* Share sheet fully visible */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 850,
            background: "rgba(245,247,251,0.98)",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 30,
          }}
        >
          <div
            style={{
              width: 60,
              height: 5,
              background: "#cbd0d9",
              borderRadius: 999,
              margin: "0 auto 24px",
            }}
          />
          <div style={{ fontSize: 24, color: "#7a8394", fontWeight: 600, marginBottom: 20 }}>
            Compartilhar
          </div>
          <div style={{ display: "flex", gap: 18, marginBottom: 30 }}>
            {["Msg", "Mail", "WhatsApp"].map((label, i) => (
              <div key={i} style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{ width: 88, height: 88, background: "#dde2ec", borderRadius: 22, marginBottom: 8 }}
                />
                <div style={{ fontSize: 18, color: "#3a4356" }}>{label}</div>
              </div>
            ))}
          </div>
          {[
            { icon: "🔗", label: "Copiar", isTarget: false },
            { icon: "＋", label: "Adicionar à Tela de Início", isTarget: true },
            { icon: "⭐", label: "Adicionar aos Favoritos", isTarget: false },
          ].map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "26px 24px",
                background: it.isTarget
                  ? `rgba(25,204,151,${0.08 + highlight * 0.18})`
                  : "white",
                borderBottom: "1px solid #eef0f4",
                borderRadius: i === 0 ? "18px 18px 0 0" : i === 2 ? "0 0 18px 18px" : 0,
                boxShadow: it.isTarget ? `inset 0 0 0 ${highlight * 3}px ${MINT}` : "none",
                fontSize: 28,
                color: it.isTarget ? INK : "#0f172a",
                fontWeight: it.isTarget ? 700 : 500,
              }}
            >
              <span>{it.label}</span>
              <span
                style={{
                  fontSize: 32,
                  color: it.isTarget ? MINT : "#3a4356",
                  fontWeight: 700,
                }}
              >
                {it.icon}
              </span>
            </div>
          ))}
        </div>
      </IPhone>

      <Pointer x={targetX} y={targetY} tap={tapFrame} />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          opacity: captionOpacity,
        }}
      >
        <div style={{ fontSize: 30, color: MINT, fontWeight: 700, letterSpacing: 3 }}>PASSO 3</div>
        <div style={{ fontSize: 52, fontWeight: 700, marginTop: 8 }}>Adicionar à Tela de Início</div>
      </div>
    </AbsoluteFill>
  );
};

// ============= SCENE 5: Icon appears + open app =============
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const captionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Home screen with icon popping in, then zoom into app
  const iconSpring = spring({ frame: frame - 20, fps, config: { damping: 10, stiffness: 140 } });
  const zoom = spring({ frame: frame - 80, fps, config: { damping: 30, stiffness: 60 } });
  const appOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" });
  const homeOpacity = interpolate(frame, [80, 110], [1, 0], { extrapolateRight: "clamp" });

  const iconScale = 1 + zoom * 3;

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <IPhone>
        {/* iOS wallpaper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #1a2b4a 0%, #0e1729 100%)",
            opacity: homeOpacity,
          }}
        />
        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 40,
            right: 40,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "white",
            fontWeight: 600,
            opacity: homeOpacity,
            zIndex: 5,
          }}
        >
          <span>9:41</span>
          <span>••• 5G ▮</span>
        </div>
        {/* App grid */}
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 40,
            right: 40,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 30,
            opacity: homeOpacity,
          }}
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                aspectRatio: "1",
                borderRadius: 24,
                background: `hsl(${(i * 47) % 360}, 30%, 40%)`,
                opacity: 0.55,
              }}
            />
          ))}
          {/* Já Limpo icon */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 24,
              background: `linear-gradient(135deg, ${MINT} 0%, #0EA872 100%)`,
              transform: `scale(${iconSpring * iconScale})`,
              boxShadow: `0 20px 40px rgba(25,204,151,0.5), 0 0 0 ${iconSpring * 6}px rgba(25,204,151,0.2)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 34,
              letterSpacing: -1,
              transformOrigin: "center",
            }}
          >
            JL
          </div>
        </div>
        {/* Icon label */}
        <div
          style={{
            position: "absolute",
            top: 130 + 4 * 30 + (2.75 * (400 - 40) / 4),
            left: 0,
            right: 0,
            textAlign: "center",
            color: "white",
            fontSize: 20,
            fontWeight: 500,
            opacity: iconSpring * homeOpacity,
          }}
        />

        {/* App opens (fades in on top) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: appOpacity,
            background: "white",
          }}
        >
          <Img
            src={staticFile("images/client.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
          />
        </div>
      </IPhone>

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "white",
          opacity: captionOpacity,
        }}
      >
        <div style={{ fontSize: 30, color: MINT, fontWeight: 700, letterSpacing: 3 }}>PASSO 4</div>
        <div style={{ fontSize: 56, fontWeight: 700, marginTop: 8 }}>Pronto! Abra o app</div>
      </div>
    </AbsoluteFill>
  );
};

// ============= SCENE 6: Outro =============
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s1 = spring({ frame, fps, config: { damping: 18 } });
  const s2 = spring({ frame: frame - 15, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill
      style={{
        fontFamily: FF,
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 44,
          color: MINT_SOFT,
          letterSpacing: 4,
          fontWeight: 600,
          opacity: s1,
          transform: `translateY(${(1 - s1) * 30}px)`,
        }}
      >
        CHAMOU
      </div>
      <div
        style={{
          fontSize: 180,
          fontWeight: 800,
          letterSpacing: -6,
          lineHeight: 1,
          marginTop: 10,
          opacity: s2,
          transform: `translateY(${(1 - s2) * 30}px)`,
          background: `linear-gradient(120deg, ${MINT} 0%, #7EF0C2 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        tá limpo.
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 32,
          color: "rgba(255,255,255,0.7)",
          opacity: s2,
        }}
      >
        jalimpo.com
      </div>
    </AbsoluteFill>
  );
};

// ============= MAIN =============
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S1}>
          <Scene1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S2}>
          <Scene2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S3}>
          <Scene3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S4}>
          <Scene4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S5}>
          <Scene5 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={S6}>
          <Scene6 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
