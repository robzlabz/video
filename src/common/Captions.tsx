import React from "react";
import { useCurrentFrame } from "remotion";
import { FPS, W, clamp, easeOutBack } from "./time";
import { FONT } from "./font";
import { useData } from "./Shell";
type Chunk = { words: { w: string; s: number; e: number }[]; s: number; e: number };
/** split each sentence into 1-3 word chunks, breaking at punctuation and ~16 chars */
const buildChunks = (SCENES: { text: string; words: Chunk["words"] }[]): Chunk[] => {
  const out: Chunk[] = [];
  SCENES.forEach((sc) => {
    let cur: Chunk["words"] = []; let pos = 0;
    const flush = () => { if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
    sc.words.forEach((w) => {
      const idx = sc.text.indexOf(w.w, pos); pos = idx >= 0 ? idx + w.w.length : pos;
      const punct = /[,.?!:;]/.test(sc.text.charAt(pos)) ? sc.text.charAt(pos) : "";
      const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
      if (cur.length >= 3 || (cur.length >= 1 && len + w.w.length > 15)) flush();
      cur.push({ ...w, w: w.w + (punct === "?" || punct === "!" ? punct : "") });
      if (punct) flush();
    });
    flush();
  });
  // each chunk stays until the next starts (max 0.6s hold over gaps)
  out.forEach((c, i) => { const n = out[i + 1]; c.e = n ? Math.min(n.s, c.e + 0.6) : c.e + 0.8; });
  return out;
};
export const Captions: React.FC<{ top?: number }> = ({ top = 250 }) => {
  const d = useData();
  const CHUNKS = React.useMemo(() => buildChunks(d.timeline.scenes), [d]);
  const t = useCurrentFrame() / FPS;
  const c = CHUNKS.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  const s = easeOutBack(clamp((t - c.s + 0.05) / 0.18));
  return (
    <div style={{ position: "absolute", top, left: 0, width: W, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `translateY(-50%) scale(${0.85 + 0.15 * s})`, background: "rgba(255,255,255,0.88)", borderRadius: 999, padding: "18px 44px", fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "#111", letterSpacing: -1, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", display: "flex", gap: 20, whiteSpace: "nowrap", maxWidth: W - 80 }}>
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03;
          return <span key={i} style={{ opacity: on ? 1 : 0.35, background: on && t < w.e + 0.1 ? "rgba(255,214,90,0.75)" : "transparent", borderRadius: 16, padding: "0 6px" }}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};
