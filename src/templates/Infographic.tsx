import React from "react";
import { Shell, ProgressDots, Sfx, useScene } from "../common/Shell";
import { Icon } from "../common/Icons";
import { Data, W, H, clamp, easeOut, easeOutBack, lerp, prog, smooth, startOf } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "infographic": flat dark 2D infographic with animated charts.
 * scene.kind: "intro" | "bar" | "donut" | "stat" | "line" | "outro"
 *  intro/outro: heading, sub?, icon?
 *  bar:   heading, data:[{label,value,color?}], unit?, max?
 *  donut: heading, value (0-100), label, color?
 *  stat:  heading, value, prefix?, suffix?, label, decimals?
 *  line:  heading, points:number[], labels?:string[], unit?
 * every scene may set `syncWord` (word prefix) – the chart animation starts when that word is spoken.
 */
const PAL = ["#38BDF8", "#F472B6", "#FACC15", "#4ADE80", "#A78BFA", "#FB923C"];
const INK = "#F8FAFC", MUTED = "#94A3B8", CARD = "#1E293B";

const Heading: React.FC<{ text?: string; t: number; t0: number }> = ({ text, t, t0 }) => {
  const p = easeOut((t - t0) / 0.5);
  return <div style={{ position: "absolute", top: 330, left: 70, width: W - 140, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 74, lineHeight: 1.08, letterSpacing: -2, color: INK, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>{text}</div>;
};

const Panel: React.FC = () => {
  const { d, t, i, tl, content: c, end } = useScene();
  const t0 = startOf(d.timeline, i, c.syncWord) ;
  const col = (k: number) => PAL[(k + i) % PAL.length];
  const out = 1 - smooth((t - (end - 0.3)) / 0.25);
  const last = i === d.timeline.scenes.length - 1;
  const kind: string = c.kind ?? "intro";
  const a = prog(t, t0, t0 + 1.4, easeOut);
  const box: React.CSSProperties = { position: "absolute", left: 70, top: 560, width: W - 140, height: 900 };
  let body: React.ReactNode = null;

  if (kind === "bar") {
    const data: { label: string; value: number; color?: string }[] = c.data ?? [];
    const max = c.max ?? Math.max(...data.map((x) => x.value));
    body = (
      <div style={{ ...box, background: CARD, borderRadius: 48, padding: "56px 56px", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
        {data.map((x, k) => {
          const ka = prog(t, t0 + k * 0.25, t0 + k * 0.25 + 1.1, easeOut);
          return (
            <div key={k}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK, marginBottom: 12 }}>
                <span>{x.label}</span><span style={{ color: x.color ?? col(k) }}>{Math.round(x.value * ka)}{c.unit ?? ""}</span>
              </div>
              <div style={{ height: 54, borderRadius: 27, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: 54, borderRadius: 27, width: `${(x.value / max) * 100 * ka}%`, background: x.color ?? col(k) }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (kind === "donut") {
    const R = 270, C = 2 * Math.PI * R, color = c.color ?? col(0);
    body = (
      <div style={{ ...box, background: CARD, borderRadius: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <svg width={620} height={620} viewBox="-310 -310 620 620">
          <circle r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={80} />
          <circle r={R} fill="none" stroke={color} strokeWidth={80} strokeLinecap="round" strokeDasharray={`${(c.value / 100) * C * a} ${C}`} transform="rotate(-90)" />
          <text textAnchor="middle" y={36} fontFamily={FONT} fontWeight={800} fontSize={150} fill={INK}>{Math.round(c.value * a)}%</text>
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: MUTED, textAlign: "center", padding: "0 40px" }}>{c.label}</div>
      </div>
    );
  } else if (kind === "stat") {
    const dec = c.decimals ?? 0, v = c.value * a;
    const s = easeOutBack(clamp((t - t0) / 0.6));
    body = (
      <div style={{ ...box, background: `linear-gradient(160deg, ${col(0)}, ${col(1)})`, borderRadius: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, transform: `scale(${0.9 + 0.1 * s})` }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 250, letterSpacing: -8, color: "#0F172A", lineHeight: 1 }}>{c.prefix ?? ""}{v.toFixed(dec)}<span style={{ fontSize: 120 }}>{c.suffix ?? ""}</span></div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#0F172A", textAlign: "center", padding: "0 60px", opacity: 0.8 }}>{c.label}</div>
      </div>
    );
  } else if (kind === "line") {
    const pts: number[] = c.points ?? [], labels: string[] = c.labels ?? [];
    const lo = Math.min(...pts, 0), hi = Math.max(...pts);
    const pw = 800, ph = 560, X = (k: number) => (k / (pts.length - 1)) * pw, Y = (v: number) => ph - ((v - lo) / (hi - lo || 1)) * ph;
    const dPath = pts.map((v, k) => `${k ? "L" : "M"}${X(k)} ${Y(v)}`).join(" ");
    const shown = a * (pts.length - 1);
    body = (
      <div style={{ ...box, background: CARD, borderRadius: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={pw + 120} height={ph + 220} viewBox={`-60 -90 ${pw + 120} ${ph + 220}`}>
          {[0, 1, 2, 3].map((g) => <line key={g} x1={0} x2={pw} y1={(g / 3) * ph} y2={(g / 3) * ph} stroke="rgba(255,255,255,0.08)" strokeWidth={3} />)}
          <path d={dPath} fill="none" stroke={col(0)} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
          {pts.map((v, k) => (k <= shown ? <circle key={k} cx={X(k)} cy={Y(v)} r={18} fill={CARD} stroke={col(1)} strokeWidth={10} /> : null))}
          {labels.map((l, k) => <text key={k} x={X(k)} y={ph + 80} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={MUTED}>{l}</text>)}
          {pts.map((v, k) => (k <= shown ? <text key={k} x={X(k)} y={Y(v) - 36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={42} fill={INK}>{v}{c.unit ?? ""}</text> : null))}
        </svg>
      </div>
    );
  } else {
    // intro / outro
    const s = easeOutBack(clamp((t - tl.start - 0.15) / 0.6));
    body = (
      <div style={{ position: "absolute", left: 0, top: 560, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 50, transform: `scale(${s})` }}>
        <div style={{ width: 380, height: 380, borderRadius: 190, background: `linear-gradient(150deg, ${col(0)}, ${col(1)})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={c.icon ?? "chart"} size={220} color="#0F172A" stroke={1.4} />
        </div>
        {c.sub && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 54, color: MUTED, textAlign: "center", padding: "0 90px" }}>{c.sub}</div>}
        {last && d.content.cta && <div style={{ marginTop: 20, background: col(2), color: "#0F172A", borderRadius: 999, padding: "22px 56px", fontFamily: FONT, fontWeight: 800, fontSize: 48 }}>{d.content.cta}</div>}
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, opacity: last ? 1 : out }}>
      <Heading text={c.heading ?? (i === 0 ? d.content.title : "")} t={t} t0={tl.start + 0.1} />
      {body}
    </div>
  );
};

export const Infographic: React.FC<{ data: Data; name: string }> = ({ data, name }) => (
  <Shell data={data} name={name} bg="#0F172A" captionTop={1700} sceneSfx="swoosh">
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 700px at 85% 8%, rgba(56,189,248,0.22), transparent), radial-gradient(800px 700px at 5% 95%, rgba(244,114,182,0.18), transparent)" }} />
    <ProgressDots y={130} color="#F8FAFC" dim="rgba(255,255,255,0.2)" />
    <Panel />
    {data.timeline.scenes.map((s, k) => (data.content.scenes[k].kind && data.content.scenes[k].kind !== "intro" && data.content.scenes[k].kind !== "outro" ? <Sfx key={k} at={startOf(data.timeline, k, data.content.scenes[k].syncWord)} f="ding" v={0.4} /> : null))}
  </Shell>
);
