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
  ShareIosIcon,
  AddSquareIcon,
  BookmarkIcon,
  CopyIcon,
  PHONE_X,
  PHONE_Y,
  PHONE_W,
  PHONE_H,
} from "./lib/theme";

const SCR_X = PHONE_X + 18;
const SCR_Y = PHONE_Y + 18;
const SCR_W = PHONE_W - 36;
const SCR_H = PHONE_H - 36;

// Chrome iOS share icon: top-right of URL bar
const SHARE_X = SCR_X + SCR_W * 0.925;
const SHARE_Y = SCR_Y + SCR_H * 0.036;

const FPS = 30;

const ChromePage: React.FC = () => (
  <Img
    src={staticFile("images/install-top.jpg")}
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "fill",
    }}
  />
);

const Step1: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps: FPS, config: { damping: 22 } });
  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={1} total={4} os="iPhone" browser="Chrome" title="" />
      <IPhone>
        <ChromePage />
      </IPhone>
      <div
        style={{
          position: "absolute",
          left: SCR_X + 40,
          top: SCR_Y + 16,
          width: SCR_W - 80,
          height: 84,
          borderRadius: 22,
          border: `3px solid ${MINT}`,
          boxShadow: `0 0 40px ${MINT}88`,
          opacity: interpolate(frame % 50, [0, 25, 50], [0.4, 1, 0.4]) * s,
        }}
      />
      <TipCard
        title="Abra jalimpo.com no Chrome"
        tip="Confirme na barra de endereços do topo que aparece jalimpo.com."
      />
    </AbsoluteFill>
  );
};

const Step2: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={2} total={4} os="iPhone" browser="Chrome" title="" />
      <IPhone>
        <ChromePage />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      </IPhone>
      <HighlightRing x={SHARE_X - 46} y={SHARE_Y - 46} w={92} h={92} radius={24} />
      <Tap x={SHARE_X} y={SHARE_Y} delay={14} size={120} />
      <TipCard
        title="Toque no ícone Compartilhar"
        tip="No canto superior direito da barra de endereço — quadrado com seta pra cima."
        fallback="toque em ⋮ (três pontinhos) e depois em Compartilhar."
      />
    </AbsoluteFill>
  );
};

const Step3: React.FC = () => {
  const frame = useCurrentFrame();
  const sheet = spring({ frame: frame - 6, fps: FPS, config: { damping: 24, stiffness: 140 } });
  const y = interpolate(sheet, [0, 1], [1400, 0]);
  const scroll = interpolate(frame, [45, 75], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const highlight = frame > 80;
  const rowHeight = 96;

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={3} total={4} os="iPhone" browser="Chrome" title="" />
      <IPhone>
        <ChromePage />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${interpolate(sheet, [0, 1], [0, 0.55])})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            bottom: 30,
            transform: `translateY(${y}px)`,
            fontFamily: FF,
          }}
        >
          <div
            style={{
              background: "rgba(245,245,247,0.98)",
              borderRadius: 26,
              padding: 22,
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 12,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
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
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: INK, fontSize: 24 }}>Já Limpo</div>
              <div style={{ color: "#8E8E93", fontSize: 18 }}>jalimpo.com</div>
            </div>
            <ShareIosIcon size={30} />
          </div>
          <div
            style={{
              background: "rgba(245,245,247,0.98)",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              transform: `translateY(${scroll}px)`,
            }}
          >
            {[
              { label: "Copiar", icon: <CopyIcon size={28} /> },
              { label: "Adicionar aos Favoritos", icon: <BookmarkIcon size={28} /> },
              { label: "Adicionar à Tela de Início", icon: <AddSquareIcon size={28} />, hl: true },
              { label: "Imprimir", icon: <CopyIcon size={28} /> },
              { label: "Solicitar Site Desktop", icon: <BookmarkIcon size={28} /> },
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
                    padding: "0 26px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
                    background: isHl ? MINT : "transparent",
                    color: isHl ? "white" : INK,
                    fontWeight: it.hl ? 700 : 500,
                    fontSize: 24,
                    boxShadow: isHl ? `inset 0 0 40px ${MINT}88` : "none",
                  }}
                >
                  <span>{it.label}</span>
                  {isHl ? <AddSquareIcon size={28} color="white" /> : it.icon}
                </div>
              );
            })}
          </div>
        </div>
      </IPhone>
      {highlight && (
        <Tap x={SCR_X + SCR_W * 0.5} y={SCR_Y + SCR_H * 0.62} delay={82} size={120} />
      )}
      <TipCard
        title='Escolha "Adicionar à Tela de Início"'
        tip="Role a folha pra baixo. Aparece com o mesmo ícone das opções do sistema."
      />
    </AbsoluteFill>
  );
};

const Step4: React.FC = () => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - 4, fps: FPS, config: { damping: 20 } });
  const addBtnX = SCR_X + SCR_W * 0.87;
  const addBtnY = SCR_Y + SCR_H * 0.185;

  return (
    <AbsoluteFill style={{ fontFamily: FF }}>
      <Bg />
      <Grain />
      <StepHeader n={4} total={4} os="iPhone" browser="Chrome" title="" />
      <IPhone>
        <ChromePage />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: 24,
            right: 24,
            background: "#F2F2F7",
            borderRadius: 28,
            padding: 26,
            fontFamily: FF,
            transform: `scale(${0.9 + s * 0.1}) translateY(${(1 - s) * -24}px)`,
            opacity: s,
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 26,
            }}
          >
            <div style={{ color: "#0A84FF", fontSize: 24, fontWeight: 500 }}>Cancelar</div>
            <div style={{ color: INK, fontWeight: 700, fontSize: 26 }}>Tela de Início</div>
            <div
              style={{
                background: MINT,
                color: "white",
                padding: "12px 24px",
                borderRadius: 24,
                fontWeight: 800,
                fontSize: 22,
                boxShadow: `0 0 30px ${MINT}`,
              }}
            >
              Adicionar
            </div>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 22,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 22,
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
              <div style={{ fontWeight: 700, color: INK, fontSize: 26 }}>Já Limpo</div>
              <div style={{ color: "#8E8E93", fontSize: 20, marginTop: 4 }}>jalimpo.com</div>
            </div>
          </div>
          <div style={{ marginTop: 20, color: "#3A3A3C", fontSize: 18, lineHeight: 1.35 }}>
            Um ícone será adicionado à sua tela inicial para acessar rapidamente este site.
          </div>
        </div>
      </IPhone>
      <HighlightRing x={addBtnX - 90} y={addBtnY - 34} w={180} h={68} radius={34} />
      <Tap x={addBtnX} y={addBtnY} delay={26} size={110} />
      <TipCard
        title='Confirme em "Adicionar"'
        tip="Canto superior direito. Pode manter o nome Já Limpo."
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
        <HomeScreen variant="ios" iconDelay={10} />
      </IPhone>
      <Tap x={PHONE_X + PHONE_W * 0.83} y={PHONE_Y + PHONE_H * 0.68} delay={44} size={110} />
    </AbsoluteFill>
  );
};

const D_INTRO = Math.round(4.5 * FPS);
const D_STEP1 = Math.round(4.5 * FPS);
const D_STEP2 = Math.round(5.0 * FPS);
const D_STEP3 = Math.round(6.5 * FPS);
const D_STEP4 = Math.round(5.0 * FPS);
const D_HOME = Math.round(4.5 * FPS);
const D_OUTRO = Math.round(4.0 * FPS);

export const IOS_CHROME_DURATION =
  D_INTRO + D_STEP1 + D_STEP2 + D_STEP3 + D_STEP4 + D_HOME + D_OUTRO;

export const IosChromeVideo: React.FC = () => {
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
    push(D_INTRO, <Intro os="iPhone" browser="Chrome" />, "intro"),
    push(D_STEP1, <Step1 />, "s1"),
    push(D_STEP2, <Step2 />, "s2"),
    push(D_STEP3, <Step3 />, "s3"),
    push(D_STEP4, <Step4 />, "s4"),
    push(D_HOME, <HomeReveal />, "home"),
    push(D_OUTRO, <Outro />, "outro"),
  ];
  return <AbsoluteFill>{els}</AbsoluteFill>;
};
