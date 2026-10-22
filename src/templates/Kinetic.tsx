import React from "react";
import { Shell, Sfx, useScene } from "../common/Shell";
import { Data, FPS, W, H, clamp, easeOutBack, easeOut, rnd, smooth } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "kinetic": full-bleed kinetic typography. Words pop in exactly when spoken.
 * content.palette: [bg colors...] cycled per scene. scene fields: emphasis?: string[] (word prefixes highlighted), kicker?
 * No captions are drawn (the words ARE the captions).
 */
const DEF = ["#FF3D6E", "#FFD23F", "#2EC4B6", "#3A86FF", "#8338EC", "#FB5607"];
const ink = (bg: string) => (["#FFD23F", "#2EC4B6"].includes(bg) ? "#111" : "#fff");

const Backdrops: React.FC<{ pal: string[] }> = ({ pal }) => {
  const { d, t, i } = useScene();
  const sc = d.timeline.scenes;
  return (
    <>
      {sc.slice(0, i + 1).map((s, k) => {
        const p = k === 0 ? 1 : easeOut((t - s.start + 0.05) / 0.55);
        const cx = rnd(k, 1) * W, cy = 500 + rnd(k, 2) * 900;
        return <div key={k} style={{ position: "absolute", inset: 0, background: pal[k % pal.length], clipPath: `circle(${p * 2300}px at ${cx}px ${cy}px)` }} />;
      })}
    </>
  );
};

const Decor: React.FC<{ color: string }> = ({ color }) => {
  const { t, i, tl } = useScene();
  const local = t - tl.start;
  return (
    <>
      {Array.from({ length: 7 }, (_, k) => {
        const x = rnd(k + i * 7, 3) * W, y = rnd(k + i * 7, 4) * H, size = 60 + rnd(k, 5) * 160;
        const rot = local * (20 + rnd(k, 6) * 40) * (k % 2 ? 1 : -1);
        const sh = k % 3;
        return (
          <div key={k} style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + Math.sin(local * 1.5 + k) * 18, width: size, height: size, opacity: 0.16, transform: `rotate(${rot}deg) scale(${easeOut(local / 0.6)})`, background: sh === 0 ? color : "transparent", border: sh === 1 ? `${size / 8}px solid ${color}` : "none", borderRadius: sh === 2 ? 0 : "50%", clipPath: sh === 2 ? "polygon(50% 0, 100% 100%, 0 100%)" : undefined, backgroundColor: sh === 2 ? color : undefined }} />
        );
      })}
    </>
  );
};

const Words: React.FC<{ pal: string[] }> = ({ pal }) => {
  const { d, t, i, tl, content: c, end } = useScene();
  const bg = pal[i % pal.length], fg = ink(bg);
  const words = tl.words;
  const emph: string[] = (c.emphasis ?? []).map((x: string) => x.toLowerCase());
  const big = words.length <= 6 ? 150 : words.length <= 9 ? 120 : 100;
  const out = 1 - smooth((t - (end - 0.2)) / 0.18);
  const last = i === d.timeline.scenes.length - 1;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, bottom: 300, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: `10px ${28}px`, opacity: last ? 1 : out }}>
      {words.map((w, k) => {
        const p = easeOutBack(clamp((t - w.s + 0.04) / 0.28));
        const isE = emph.some((e) => w.w.toLowerCase().startsWith(e));
        const rot = (rnd(k + i * 13, 8) - 0.5) * 8;
        return (
          <span key={k} style={{ display: "inline-block", fontFamily: FONT, fontWeight: 800, fontSize: isE ? big * 1.12 : big, lineHeight: 1.08, letterSpacing: -4, color: isE ? bg : fg, background: isE ? fg : "transparent", borderRadius: 26, padding: isE ? "0 26px" : 0, opacity: t >= w.s - 0.04 ? 1 : 0, transform: `translateY(${(1 - p) * 70}px) rotate(${rot * (1 - 0.3 * p)}deg) scale(${0.4 + 0.6 * p})` }}>{w.w}</span>
        );
      })}
    </div>
  );
};

const Chrome: React.FC<{ pal: string[] }> = ({ pal }) => {
  const { d, t, i, tl } = useScene();
  const bg = pal[i % pal.length], fg = ink(bg);
  const last = i === d.timeline.scenes.length - 1;
  return (
    <>
      <div style={{ position: "absolute", top: 120, left: 70, fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 4, textTransform: "uppercase", color: fg, opacity: 0.8 }}>{d.content.scenes[i].kicker ?? d.content.title}</div>
      <div style={{ position: "absolute", top: 100, right: 70, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: fg, opacity: 0.35 }}>{String(i + 1).padStart(2, "0")}</div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 120, height: 14, borderRadius: 7, background: "rgba(0,0,0,0.15)" }}>
        <div style={{ width: `${(t / d.timeline.duration) * 100}%`, height: 14, borderRadius: 7, background: fg }} />
      </div>
      {last && d.content.cta && <div style={{ position: "absolute", bottom: 190, left: 0, width: W, display: "flex", justifyContent: "center", transform: `scale(${easeOutBack(clamp((t - tl.start - 0.5) / 0.5))})` }}><div style={{ background: fg, color: bg, borderRadius: 999, padding: "20px 52px", fontFamily: FONT, fontWeight: 800, fontSize: 46 }}>{d.content.cta}</div></div>}
    </>
  );
};

export const Kinetic: React.FC<{ data: Data; name: string }> = ({ data, name }) => {
  const pal = data.content.palette ?? DEF;
  return (
    <Shell data={data} name={name} bg={pal[0]} captionTop={null} sceneSfx="swoosh">
      <Backdrops pal={pal} />
      <DecorWrap pal={pal} />
      <Words pal={pal} />
      <Chrome pal={pal} />
      {data.timeline.scenes.flatMap((s, k) => s.words.filter((w) => (data.content.scenes[k].emphasis ?? []).some((e: string) => w.w.toLowerCase().startsWith(e.toLowerCase()))).map((w, j) => <Sfx key={`${k}-${j}`} at={w.s} f="pop" v={0.5} />))}
    </Shell>
  );
};
const DecorWrap: React.FC<{ pal: string[] }> = ({ pal }) => {
  const { i } = useScene();
  return <Decor color={ink(pal[i % pal.length])} />;
};
