import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Data, FPS, Scene, SceneT, sceneEnd, sceneIndex } from "./time";
import { Captions } from "./Captions";
import "./font";

const Ctx = createContext<Data | null>(null);
export const useData = () => useContext(Ctx)!;

/** current time + the active scene (content + timeline entry) */
export const useScene = () => {
  const d = useData();
  const t = useCurrentFrame() / FPS;
  const i = sceneIndex(d.timeline, t);
  const tl: SceneT = d.timeline.scenes[i];
  const content: Scene = d.content.scenes[i];
  return { d, t, i, tl, content, local: t - tl.start, end: sceneEnd(d.timeline, i), n: d.timeline.scenes.length };
};

export type ShellProps = {
  data: Data;
  name: string;
  bg: string;
  /** vertical position (px) of the karaoke caption pill; null hides captions */
  captionTop?: number | null;
  /** sfx played at every scene start */
  sceneSfx?: "swoosh" | "pop" | null;
  children: React.ReactNode;
};

/** Wraps a template: data context, background, voice/music, scene-change sfx, captions. */
export const Shell: React.FC<ShellProps> = ({ data, name, bg, captionTop = 250, sceneSfx = "swoosh", children }) => {
  const { fps } = useVideoConfig();
  return (
    <Ctx.Provider value={data}>
      <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
        {children}
        {captionTop !== null && <Captions top={captionTop} />}
        <Audio src={staticFile(`${name}/voice.wav`)} />
        <Audio src={staticFile(`${name}/music.wav`)} volume={0.14} />
        {sceneSfx && data.timeline.scenes.slice(1).map((s, i) => (
          <Sequence key={i} from={Math.round(s.start * fps)} durationInFrames={30} layout="none">
            <Audio src={staticFile(`sfx/${sceneSfx}.wav`)} volume={0.35} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

/** one-shot sfx at an absolute time (sec) */
export const Sfx: React.FC<{ at: number; f: "pop" | "swoosh" | "ding" | "wrong"; v?: number }> = ({ at, f, v = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(at * FPS))} durationInFrames={30} layout="none">
    <Audio src={staticFile(`sfx/${f}.wav`)} volume={v} />
  </Sequence>
);

/** row of dots showing scene progress */
export const ProgressDots: React.FC<{ y?: number; color?: string; dim?: string }> = ({ y = 110, color = "#111", dim = "rgba(0,0,0,0.18)" }) => {
  const { i, n } = useScene();
  return (
    <div style={{ position: "absolute", top: y, left: 0, width: 1080, display: "flex", justifyContent: "center", gap: 12 }}>
      {Array.from({ length: n }, (_, k) => (
        <div key={k} style={{ width: k === i ? 38 : 14, height: 14, borderRadius: 99, background: k <= i ? color : dim, transition: "none" }} />
      ))}
    </div>
  );
};
