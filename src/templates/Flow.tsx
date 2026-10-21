import React from "react";
import { Shell, ProgressDots, Sfx, useData, useScene } from "../common/Shell";
import { Icon } from "../common/Icons";
import { Data, W, clamp, easeOut, easeOutBack, prog, startOf } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "flow": step-by-step vertical diagram. Every scene with `step: true` becomes a node.
 * intro/outro scenes (no `step`) show a title card. scene fields: title, desc?, icon?, step?
 */
const COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#EA580C", "#16A34A", "#0891B2", "#CA8A04"];

const Steps: React.FC = () => {
  const { d, t, i } = useScene();
  const steps = d.content.scenes.map((s, k) => ({ s, k })).filter((x) => x.s.step);
  const n = steps.length;
  const rowH = Math.min(230, 1180 / n);
  const top = 440;
  const activeIdx = steps.findIndex((x) => x.k === i);
  const dim = !d.content.scenes[i].step && steps.length && i > steps[0].k ? 0.07 : 1;
  return (
    <div style={{ opacity: dim }}>
      {steps.map(({ s, k }, r) => {
        const t0 = d.timeline.scenes[k].start;
        const shown = clamp((t - t0 + 0.2) / 0.5);
        if (shown <= 0) return null;
        const active = r === activeIdx;
        const color = COLORS[r % COLORS.length];
        const y = top + r * rowH;
        const p = easeOutBack(shown);
        const nextStart = steps[r + 1] ? d.timeline.scenes[steps[r + 1].k].start : Infinity;
        const connect = steps[r + 1] ? prog(t, nextStart - 0.5, nextStart, easeOut) : 0;
        return (
          <React.Fragment key={k}>
            {steps[r + 1] && <div style={{ position: "absolute", left: 130 - 5, top: y + 112, width: 10, height: (rowH - 112 + 4) * connect, background: color, borderRadius: 5, opacity: 0.5 }} />}
            <div style={{ position: "absolute", left: 60, top: y, width: W - 120, height: rowH - 24, transform: `scale(${0.85 + 0.15 * p})`, opacity: shown, transformOrigin: "left center", background: active ? "#fff" : "rgba(255,255,255,0.65)", borderRadius: 40, boxShadow: active ? `0 18px 40px ${color}44` : "0 6px 16px rgba(30,41,59,0.08)", border: active ? `5px solid ${color}` : "5px solid transparent", display: "flex", alignItems: "center", gap: 30, padding: "0 36px" }}>
              <div style={{ width: 112, height: 112, borderRadius: 56, background: t > nextStart - 0.1 ? "#16A34A" : color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name={t > nextStart - 0.1 ? "check" : s.icon ?? "star"} size={64} color="#fff" stroke={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: active ? 56 : 48, color: "#1E293B", letterSpacing: -1, lineHeight: 1.1 }}>
                  <span style={{ color }}>{r + 1}.</span> {s.title}
                </div>
                {s.desc && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "#64748B", marginTop: 8, lineHeight: 1.15, opacity: active ? 1 : 0.0, height: active ? "auto" : 0 }}>{s.desc}</div>}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Cards: React.FC = () => {
  const { d, t, i, tl, content: c } = useScene();
  if (c.step) return null;
  const last = i === d.timeline.scenes.length - 1;
  const s = easeOutBack(clamp((t - tl.start - 0.1) / 0.6));
  return (
    <div style={{ position: "absolute", left: 0, top: last ? 760 : 560, width: W, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, transform: `scale(${s})` }}>
      {<div style={{ width: last ? 240 : 340, height: last ? 240 : 340, borderRadius: 100, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-6deg)" }}><Icon name={c.icon ?? "send"} size={last ? 140 : 200} color="#fff" stroke={1.5} /></div>}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: last ? 64 : 92, color: "#1E293B", textAlign: "center", padding: "0 70px", lineHeight: 1.05, letterSpacing: -2 }}>{c.title ?? (i === 0 ? d.content.title : "")}</div>
      {last && d.content.cta && <div style={{ background: "#1E293B", color: "#fff", borderRadius: 999, padding: "22px 54px", fontFamily: FONT, fontWeight: 800, fontSize: 46 }}>{d.content.cta}</div>}
    </div>
  );
};

const Header: React.FC = () => {
  const d = useData();
  const { t, i, tl, content: c } = useScene();
  const showSteps = d.content.scenes.some((s, k) => s.step && t >= d.timeline.scenes[k].start - 0.2);
  return showSteps ? <div style={{ position: "absolute", top: 350, left: 0, width: W, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#475569", letterSpacing: 1, opacity: clamp((t - tl.start) / 0.4) || 1 }}>{d.content.title}</div> : null;
};

export const Flow: React.FC<{ data: Data; name: string }> = ({ data, name }) => (
  <Shell data={data} name={name} bg="linear-gradient(180deg,#E0F2FE 0%,#F1F5F9 55%,#FCE7F3 100%)" captionTop={250} sceneSfx="swoosh">
    <ProgressDots y={318} color="#1E293B" dim="rgba(30,41,59,0.15)" />
    <Header />
    <Steps />
    <Cards />
    {data.timeline.scenes.map((s, k) => (data.content.scenes[k].step ? <Sfx key={k} at={s.start + 0.05} f="pop" v={0.45} /> : null))}
  </Shell>
);
