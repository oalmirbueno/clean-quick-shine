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
  FF,
  MINT,
  INK,
  Bg,
  Grain,
  IPhone,
  StepHeader,
  TipCard,
  Tap,
  HighlightRing,
  Intro,
  Outro,
  HomeScreen,
  DotsIcon,
  AddSquareIcon,
  PHONE_X,
  PHONE_Y,
  PHONE_W,
  PHONE_H,
} from "./lib/theme";

const SCR_X = PHONE_X + 18;
const SCR_Y = PHONE_Y + 18;
const SCR_W = PHONE_W - 36;
const SCR_H = PHONE_H - 36;

// Chrome Android: 3-dot menu top right
const MENU_X = SCR_X + SCR_W * 0.94;
const MENU_Y = SCR_Y + SCR_H * 0.035;

const FPS = 30;

// Stylized Chrome Android page (dark) with jalimpo.com
const ChromeAndroidPage: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, #08172A 0%, #0F2740 100%)",
      fontFamily: FF,
    }}
  >
    {/* Status bar */}
    <div
      style={{
        height: 44,
        background: "#020D1B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        color: "white",
        fontSize: 18,
        fontWeight: 700,
      }}
    >
      <span>9:41</span>
      <span style={{ opacity: 0.8 }}>●●● ▮</span>
    </div>
    {/* Chrome URL bar */}
    <div
      style={{
        height: 100,
        background: "#1B1B1F",
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 12,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 62,
          borderRadius: 999,
          background: "#2D2D31",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          gap: 14,
          color: "white",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: MINT,
            display: "grid",
            placeItems: "center",
            fontSize: 14,
            color: "#062017",
            fontWeight: 800,
          }}
        >
          ✓
        </div>
        <div style={{ fontSize: 24, fontWeight: 500 }}>jalimpo.com</div>
      </div>
      <div style={{ width: 44, height: 44, display: "grid", placeItems: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#3A3A3F",
            display: "grid",
            placeItems: "center",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          2
        </div>
      </div>
      <div style={{ width: 44, height: 44, display: "grid", placeItems: "center" }}>
        <DotsIcon color="white" size={30} />
      </div>
    </div>
    {/* Page body — jalimpo hero */}
    <div style={{ padding: "60px 40px", color: "white", textAlign: "center" }}>
      <Img
        src={staticFile("images/logo-light.png")}
        style={{ width: 380, objectFit: "contain", margin: "0 auto" }}
      />
      <div style={{ marginTop: 40, fontSize: 40, fontWeight: 800, lineHeight: 1.1 }}>
        Diaristas verificadas
        <br />
        na hora que precisar.
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 20,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.4,
        }}
      >
        Agende em poucos cliques. Pagamento
        <br />
        protegido. Padrão e confiança.
      </div>
      <div
        style={{
          marginTop: 40,
          display: "inline-block",
          padding: "20px 40px",
          background: MINT,
          color: "#062017",
          fontWeight: 800,
          fontSize: 24,
          borderRadius: 20,
          boxShadow: `0 12px 30px ${MINT}55`,
        }}
      >
        Agendar limpeza
      </div>
      <div
        style={{
          marginTop: 60,
          padding: 24,
          borderRadius: 24,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          textAlign: "left",
        }}
      >
        <div style={{ color: MINT, fontSize: 16, fontWeight: 700, letterSpacing: 3 }}>
          COMO FUNCIONA
        </div>
        <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700 }}>
          1. Escolha o serviço
          <br />
          2. Confirme endereço
          <br />
          3. Pronto, tá limpo.
        </div>
      </div>
    </div>
    {/* Bottom Android nav bar */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 74,
        background: "#020D1B",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        color: "white",
        fontSize: 30,
      }}
    >
      <div>◁</div>
      <div>○</div>
      <div>▭</div>
    </div>
  </div>
);

const Step1: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps: FPS, config: { damping: 22 } });
  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={1} total={4} os="Android" browser="Chrome" title="" />
      <IPhone>
        <ChromeAndroidPage />
      </IPhone>
      <div
        style={{
          position: "absolute",
          left: SCR_X + 30,
          top: SCR_Y + 52,
          width: SCR_W - 220,
          height: 84,
          borderRadius: 42,
          border: `3px solid ${MINT}`,
          boxShadow: `0 0 40px ${MINT}88`,
          opacity: interpolate(frame % 50, [0, 25, 50], [0.4, 1, 0.4]) * s,
        }}
      />
      <TipCard
        title="Abra jalimpo.com no Chrome"
        tip="Confirme na barra do topo que aparece jalimpo.com. Use o Chrome — é o mais compatível."
      />
    </AbsoluteFill>
  );
};

const Step2: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={2} total={4} os="Android" browser="Chrome" title="" />
      <IPhone>
        <ChromeAndroidPage />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      </IPhone>
      <HighlightRing x={MENU_X - 40} y={MENU_Y - 40} w={80} h={80} radius={40} />
      <Tap x={MENU_X} y={MENU_Y} delay={14} size={120} />
      <TipCard
        title="Toque nos 3 pontinhos"
        tip="No canto superior direito do Chrome (⋮) — abre o menu de opções."
        fallback="atualize o Chrome pela Play Store e tente de novo."
      />
    </AbsoluteFill>
  );
};

// Chrome Android menu with "Instalar app"
const Step3: React.FC = () => {
  const frame = useCurrentFrame();
  const menu = spring({ frame: frame - 4, fps: FPS, config: { damping: 22, stiffness: 160 } });
  const highlight = frame > 50;

  const rows = [
    { label: "Nova aba", icon: "+" },
    { label: "Nova aba anônima", icon: "◐" },
    { label: "Histórico", icon: "⟲" },
    { label: "Downloads", icon: "↓" },
    { label: "Instalar app", icon: <AddSquareIcon size={24} color={INK} />, hl: true },
    { label: "Compartilhar…", icon: "↗" },
    { label: "Encontrar na página", icon: "◎" },
    { label: "Configurações", icon: "⚙" },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={3} total={4} os="Android" browser="Chrome" title="" />
      <IPhone>
        <ChromeAndroidPage />
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.3 * menu})` }} />
        {/* Dropdown menu top-right */}
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 20,
            width: 460,
            background: "white",
            borderRadius: 20,
            padding: "12px 0",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            transform: `translateY(${(1 - menu) * -20}px) scale(${0.9 + menu * 0.1})`,
            transformOrigin: "top right",
            opacity: menu,
          }}
        >
          {rows.map((r, i) => {
            const isHl = r.hl && highlight;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "18px 24px",
                  background: isHl ? MINT : "transparent",
                  color: isHl ? "white" : INK,
                  fontWeight: r.hl ? 700 : 500,
                  fontSize: 22,
                }}
              >
                <div style={{ width: 30, textAlign: "center", fontSize: 22 }}>
                  {typeof r.icon === "string" ? r.icon : r.icon}
                </div>
                <div>{r.label}</div>
              </div>
            );
          })}
        </div>
      </IPhone>
      {highlight && <Tap x={SCR_X + SCR_W * 0.72} y={SCR_Y + SCR_H * 0.42} delay={52} size={110} />}
      <TipCard
        title='Escolha "Instalar app"'
        tip='Pode aparecer como "Adicionar à Tela inicial" em Android mais antigo — é a mesma coisa.'
      />
    </AbsoluteFill>
  );
};

// Android install prompt
const Step4: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 4, fps: FPS, config: { damping: 20 } });
  const btnX = SCR_X + SCR_W * 0.78;
  const btnY = SCR_Y + SCR_H * 0.6;

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={4} total={4} os="Android" browser="Chrome" title="" />
      <IPhone>
        <ChromeAndroidPage />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
        <div
          style={{
            position: "absolute",
            left: 30,
            right: 30,
            top: "26%",
            background: "white",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            transform: `scale(${0.9 + s * 0.1}) translateY(${(1 - s) * -24}px)`,
            opacity: s,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: MINT,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Img
                src={staticFile("images/logo-icon.png")}
                style={{ width: "72%", height: "72%", objectFit: "contain" }}
              />
            </div>
            <div>
              <div style={{ color: INK, fontWeight: 700, fontSize: 28 }}>Instalar app</div>
              <div style={{ color: "#5F6368", fontSize: 20, marginTop: 4 }}>jalimpo.com</div>
            </div>
          </div>
          <div style={{ color: "#3C4043", fontSize: 20, lineHeight: 1.4, marginBottom: 30 }}>
            Adiciona o Já Limpo à sua tela inicial. Abre em tela cheia, com notificações e acesso rápido.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <div
              style={{
                padding: "16px 26px",
                color: "#5F6368",
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              Cancelar
            </div>
            <div
              style={{
                padding: "16px 34px",
                borderRadius: 999,
                background: MINT,
                color: "white",
                fontWeight: 800,
                fontSize: 22,
                boxShadow: `0 0 30px ${MINT}`,
              }}
            >
              Instalar
            </div>
          </div>
        </div>
      </IPhone>
      <HighlightRing x={btnX - 90} y={btnY - 34} w={180} h={68} radius={34} />
      <Tap x={btnX} y={btnY} delay={26} size={110} />
      <TipCard
        title='Confirme em "Instalar"'
        tip='Pode aparecer também como "Adicionar" ou "OK". Aceite pra concluir.'
      />
    </AbsoluteFill>
  );
};

const HomeReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps: FPS, config: { damping: 22 } });
  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FF,
          opacity: s,
        }}
      >
        <div
          style={{
            color: MINT,
            letterSpacing: 6,
            fontSize: 22,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Pronto
        </div>
        <div
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 800,
            marginTop: 14,
            lineHeight: 1.05,
          }}
        >
          Já Limpo instalado
          <br />
          na sua tela inicial
        </div>
      </div>
      <IPhone>
        <HomeScreen variant="android" iconDelay={10} />
      </IPhone>
      <Tap x={PHONE_X + PHONE_W * 0.83} y={PHONE_Y + PHONE_H * 0.68} delay={44} size={110} />
    </AbsoluteFill>
  );
};

const D_INTRO = Math.round(4.5 * FPS);
const D_STEP1 = Math.round(4.5 * FPS);
const D_STEP2 = Math.round(5.0 * FPS);
const D_STEP3 = Math.round(6.0 * FPS);
const D_STEP4 = Math.round(5.0 * FPS);
const D_HOME = Math.round(4.5 * FPS);
const D_OUTRO = Math.round(4.0 * FPS);

export const ANDROID_CHROME_DURATION =
  D_INTRO + D_STEP1 + D_STEP2 + D_STEP3 + D_STEP4 + D_HOME + D_OUTRO;

export const AndroidChromeVideo: React.FC = () => {
  let t = 0;
  const push = (d: number, node: React.ReactNode, key: string) => {
    const el = (
      <Sequence key={key} from={t} durationInFrames={d}>
        {node}
      </Sequence>
    );
    t += d;
    return el;
  };
  const els = [
    push(D_INTRO, <Intro os="Android" browser="Chrome" />, "intro"),
    push(D_STEP1, <Step1 />, "s1"),
    push(D_STEP2, <Step2 />, "s2"),
    push(D_STEP3, <Step3 />, "s3"),
    push(D_STEP4, <Step4 />, "s4"),
    push(D_HOME, <HomeReveal />, "home"),
    push(D_OUTRO, <Outro />, "outro"),
  ];
  return <AbsoluteFill>{els}</AbsoluteFill>;
};
