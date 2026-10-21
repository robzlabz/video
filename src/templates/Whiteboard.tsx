import React from "react";
import { Shell, ProgressDots, Sfx, useScene } from "../common/Shell";
import { Icon } from "../common/Icons";
import { Data, W, H, clamp, easeOut, easeOutBack, prog, smooth, startOf } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "whiteboard": paper background, marker line-drawing explainer.
 * scene fields: heading?, icon?, notes?: string[], noteWords?: string[] (word prefix each note is written on)
 */
const INK = ["#2563EB", "#DC2626", "#16A34A", "#EA580C", "#7C3AED", "#0891B2"];

const Wipe: React.FC<{ t: number; t0: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, t0, dur = 0.7, children, style }) => {
  const p = clamp((t - t0) / dur);
  return <div style={{ ...style, clipPath: `inset(-20px ${(1 - p) * 100}% -20px -20px)`, opacity: p > 0 ? 1 : 0 }}>{children}</div>;
};

const Board: React.FC = () => {
  const { d, t, i, tl, content, end } = useScene();
  const accent = INK[i % INK.length];
  const heading: string = content.heading ?? (i === 0 ? d.content.title : "");
  const notes: string[] = content.notes ?? [];
  const fade = 1 - smooth((t - (end - 0.35)) / 0.3);
  const t0 = tl.start + 0.1;
  const iconDraw = prog(t, t0 + 0.5, t0 + 2.0);
  const isLast = i === d.timeline.scenes.length - 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: i === d.timeline.scenes.length - 1 ? 1 : fade, filter: "url(#wob)" }}>
      <Wipe t={t} t0={t0} dur={0.9} style={{ position: "absolute", top: 400, left: 70, width: W - 140, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: heading.length <= 14 ? 96 : heading.length <= 19 ? 80 : 62, lineHeight: 1.05, letterSpacing: -2, color: "#1F2937" }}>
        {heading}
      </Wipe>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {heading && <path d={`M${W / 2 - 330} 560 q165 -22 330 -2 t330 -4`} fill="none" stroke={accent} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, t0 + 0.6, t0 + 1.1)} />}
        {/* doodle circle around the icon */}
        <ellipse cx={W / 2} cy={880} rx={290} ry={270} fill="none" stroke={accent} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, t0 + 0.3, t0 + 1.6)} transform={`rotate(-8 ${W / 2} 880)`} />
      </svg>
      <div style={{ position: "absolute", left: W / 2 - 220, top: 660, width: 440, height: 440 }}>
        <Icon name={content.icon} size={440} color={accent} stroke={0.7} draw={iconDraw} />
      </div>
      <div style={{ position: "absolute", top: 1180, left: 120, width: W - 240, display: "flex", flexDirection: "column", gap: 26 }}>
        {notes.map((n, k) => {
          const word = content.noteWords?.[k];
          const nt = word ? startOf(d.timeline, i, word) : tl.start + 1.2 + k * 1.3;
          const p = clamp((t - nt) / 0.7);
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <svg width={54} height={30} viewBox="0 0 54 30" style={{ flexShrink: 0 }}>
                <path d="M3 15 H48 M34 4 L49 15 L34 26" fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - easeOut(p * 2)} />
              </svg>
              <Wipe t={t} t0={nt + 0.15} dur={0.6} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 58, color: "#1F2937", letterSpacing: -1 }}>{n}</Wipe>
            </div>
          );
        })}
      </div>
      {isLast && d.content.cta && (
        <div style={{ position: "absolute", top: 1460, left: 0, width: W, display: "flex", justifyContent: "center", transform: `scale(${easeOutBack(clamp((t - tl.start - 0.3) / 0.5))})` }}>
          <div style={{ background: "#1F2937", color: "#fff", borderRadius: 24, padding: "22px 48px", fontFamily: FONT, fontWeight: 800, fontSize: 48 }}>{d.content.cta}</div>
        </div>
      )}
    </div>
  );
};

export const Whiteboard: React.FC<{ data: Data; name: string }> = ({ data, name }) => (
  <Shell data={data} name={name} bg="#FBFAF6" captionTop={1700} sceneSfx="swoosh">
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale={7} /></filter>
    </svg>
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,0.10) 2px, transparent 2px)", backgroundSize: "54px 54px" }} />
    <div style={{ position: "absolute", top: 60, left: 0, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: "#9CA3AF", letterSpacing: 4, textTransform: "uppercase" }}>{data.content.title}</div>
    <ProgressDots y={140} color="#1F2937" />
    <Board />
    {data.timeline.scenes.map((s, k) => (content_has(data, k) ? <Sfx key={k} at={s.start + 0.6} f="pop" v={0.35} /> : null))}
  </Shell>
);
const content_has = (d: Data, k: number) => !!d.content.scenes[k].icon;
