import React from "react";
import { Shell, Sfx, useScene } from "../common/Shell";
import { Icon } from "../common/Icons";
import { Data, W, H, clamp, easeOut, easeOutBack, smooth, startOf } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "versus": comparison split-screen (top = A, bottom = B).
 * content.sides: [{name, icon, color}, {name, icon, color}]
 * scene.kind "intro" | "round" | "verdict"
 *  round:   label, a, b, winner?: 0 | 1 | -1 (draw), syncWord?
 *  verdict: heading (e.g. "Seri!"), sub?
 */
const HALF = H / 2;

const Side: React.FC<{ idx: 0 | 1 }> = ({ idx }) => {
  const { d, t, i, tl, content: c, end } = useScene();
  const side = d.content.sides[idx];
  const y0 = idx === 0 ? 0 : HALF;
  const kind: string = c.kind ?? "round";
  const text: string = idx === 0 ? c.a : c.b;
  const t0 = startOf(d.timeline, i, c.syncWord);
  const appear = easeOut((t - tl.start - 0.1) / 0.5);
  const out = 1 - smooth((t - (end - 0.25)) / 0.2);
  const decided = c.winner !== undefined && t >= t0 + 0.6;
  const won = c.winner === idx, lost = decided && c.winner !== -1 && c.winner !== idx;
  const sc = d.content.scenes.slice(0, i + (decided ? 1 : 0));
  const score = sc.filter((s) => s.kind === "round" && s.winner === idx).length;
  const pop = easeOutBack(clamp((t - t0 - 0.6) / 0.5));
  return (
    <div style={{ position: "absolute", left: 0, top: y0, width: W, height: HALF, background: side.color, overflow: "hidden", opacity: lost ? 0.9 : 1 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(600px 500px at 80% 20%, rgba(255,255,255,0.25), transparent)" }} />
      {/* side header */}
      <div style={{ position: "absolute", left: 60, [idx === 0 ? "top" : "bottom"]: idx === 0 ? 330 : 290, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ width: 110, height: 110, borderRadius: 30, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={side.icon} size={68} color={side.color} stroke={1.8} /></div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 66, color: "#fff", letterSpacing: -1 }}>{side.name}</div>
      </div>
      <div style={{ position: "absolute", right: 60, [idx === 0 ? "top" : "bottom"]: idx === 0 ? 345 : 305, fontFamily: FONT, fontWeight: 800, fontSize: 96, color: "rgba(255,255,255,0.95)" }}>{score}</div>
      {/* round content */}
      {kind === "round" && (
        <div style={{ position: "absolute", left: 60, right: 60, top: idx === 0 ? 520 : 150, height: 280, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: appear * out, transform: `translateY(${(1 - appear) * (idx === 0 ? -40 : 40)}px) scale(${lost ? 0.94 : 1})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>{c.label}</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: text && text.length > 14 ? 72 : 96, lineHeight: 1.05, color: "#fff", textAlign: "center", letterSpacing: -2 }}>{text}</div>
        </div>
      )}
      {kind === "round" && decided && c.winner !== -1 && (
        <div style={{ position: "absolute", right: 70, [idx === 0 ? "top" : "bottom"]: idx === 0 ? 520 : 150, width: 130, height: 130, borderRadius: 65, background: won ? "#FACC15" : "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop * out})` }}>
          <Icon name={won ? "trophy" : "x"} size={74} color={won ? "#1E293B" : "#fff"} stroke={1.8} />
        </div>
      )}
      {kind !== "round" && (
        <div style={{ position: "absolute", left: 60, right: 60, top: idx === 0 ? 560 : 130, height: 300, display: "flex", alignItems: "center", justifyContent: "center", opacity: appear }}>
          {idx === 0 && <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff", textAlign: "center", lineHeight: 1, letterSpacing: -3 }}>{c.heading ?? side.name}</div>}
          {idx === 1 && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, color: "rgba(255,255,255,0.92)", textAlign: "center", lineHeight: 1.15 }}>{c.sub ?? (i === d.timeline.scenes.length - 1 ? d.content.cta : "")}</div>}
        </div>
      )}
    </div>
  );
};

const Badge: React.FC = () => {
  const { t, tl } = useScene();
  const s = easeOutBack(clamp((t - 0.2) / 0.6));
  return (
    <div style={{ position: "absolute", left: W / 2 - 100, top: HALF - 100, width: 200, height: 200, borderRadius: 100, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`, fontFamily: FONT, fontWeight: 800, fontSize: 92, color: "#1E293B", letterSpacing: -4 }}>VS</div>
  );
};

const Title: React.FC = () => {
  const { d, t } = useScene();
  return <div style={{ position: "absolute", top: 120, left: 0, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 54, color: "#fff", zIndex: 5, textShadow: "0 3px 12px rgba(0,0,0,0.3)" }}>{d.content.title}</div>;
};

export const Versus: React.FC<{ data: Data; name: string }> = ({ data, name }) => (
  <Shell data={data} name={name} bg="#111" captionTop={1740} sceneSfx="swoosh">
    <Side idx={0} />
    <Side idx={1} />
    <Badge />
    <Title />
    {data.timeline.scenes.map((s, k) => (data.content.scenes[k].winner !== undefined ? <Sfx key={k} at={startOf(data.timeline, k, data.content.scenes[k].syncWord) + 0.6} f="ding" v={0.5} /> : null))}
  </Shell>
);
