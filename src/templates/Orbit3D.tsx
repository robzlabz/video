import React from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Shell, ProgressDots, Sfx, useScene } from "../common/Shell";
import { Data, W, H, clamp, easeOut, easeOutBack, lerp, rnd, smooth } from "../common/time";
import { FONT } from "../common/font";

/**
 * Template "orbit3d": glossy 3D hero object per scene (NOT the clay-pipe stage).
 * scene fields: heading, shape: box|sphere|torus|knot|ico|octa|cone|dodeca, color (hex), chips?: string[], intro/last scene optional
 */
const Geo: React.FC<{ shape: string }> = ({ shape }) => {
  switch (shape) {
    case "box": return <boxGeometry args={[2.1, 2.1, 2.1]} />;
    case "torus": return <torusGeometry args={[1.25, 0.5, 48, 96]} />;
    case "knot": return <torusKnotGeometry args={[1.0, 0.36, 160, 24]} />;
    case "ico": return <icosahedronGeometry args={[1.55, 1]} />;
    case "octa": return <octahedronGeometry args={[1.7]} />;
    case "cone": return <coneGeometry args={[1.35, 2.5, 48]} />;
    case "dodeca": return <dodecahedronGeometry args={[1.6]} />;
    default: return <sphereGeometry args={[1.5, 64, 48]} />;
  }
};

const Hero: React.FC = () => {
  const { d, t, i, tl, content: c, end } = useScene();
  const local = t - tl.start;
  const inn = easeOutBack(clamp(local / 0.7));
  const outp = 1 - smooth((t - (end - 0.3)) / 0.25);
  const s = (i === d.timeline.scenes.length - 1 ? 1 : outp) * inn;
  const color = c.color ?? "#6366F1";
  const flat = c.shape === "ico" || c.shape === "octa" || c.shape === "dodeca";
  return (
    <group position={[0, -0.5, 0]} scale={s} rotation={[0.3 + Math.sin(t * 0.8) * 0.15, local * 0.9 + i, 0]}>
      <mesh key={c.shape}>
        <Geo shape={c.shape ?? "sphere"} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.25} flatShading={flat} />
      </mesh>
      {/* orbiting satellites */}
      {Array.from({ length: 6 }, (_, k) => {
        const a = local * (0.9 + 0.2 * (k % 3)) + k * 1.05, r = 2.7 + (k % 3) * 0.35;
        return (
          <mesh key={k} position={[Math.cos(a) * r, Math.sin(a * 0.7 + k) * 0.9, Math.sin(a) * r]} scale={0.14 + 0.1 * (k % 2)}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={k % 2 ? "#FDE68A" : "#F9A8D4"} roughness={0.3} emissive={k % 2 ? "#FDE68A" : "#F9A8D4"} emissiveIntensity={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

const Stars: React.FC = () => {
  const { t } = useScene();
  const pts = React.useMemo(() => Array.from({ length: 90 }, (_, k) => [(rnd(k, 1) - 0.5) * 18, (rnd(k, 2) - 0.5) * 26, -4 - rnd(k, 3) * 6, 0.03 + rnd(k, 4) * 0.06] as number[]), []);
  return (
    <>
      {pts.map((p, k) => (
        <mesh key={k} position={[p[0], p[1] + Math.sin(t * 0.6 + k) * 0.15, p[2]]} scale={p[3] * (0.8 + 0.4 * Math.sin(t * 2 + k))}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#fff" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
};

const Text: React.FC = () => {
  const { d, t, i, tl, content: c, end } = useScene();
  const last = i === d.timeline.scenes.length - 1;
  const p = easeOut((t - tl.start - 0.1) / 0.5);
  const out = last ? 1 : 1 - smooth((t - (end - 0.25)) / 0.2);
  const chips: string[] = c.chips ?? [];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <div style={{ position: "absolute", top: 330, left: 60, width: W - 120, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 96, lineHeight: 1.05, letterSpacing: -3, color: "#fff", opacity: p, transform: `translateY(${(1 - p) * 40}px)`, textShadow: "0 6px 30px rgba(0,0,0,0.35)" }}>{c.heading ?? (i === 0 ? d.content.title : "")}</div>
      <div style={{ position: "absolute", top: 1470, left: 60, width: W - 120, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20 }}>
        {chips.map((ch, k) => {
          const cp = easeOutBack(clamp((t - tl.start - 0.9 - k * 0.45) / 0.45));
          return <div key={k} style={{ background: "rgba(255,255,255,0.95)", color: "#1E1B4B", borderRadius: 999, padding: "16px 40px", fontFamily: FONT, fontWeight: 800, fontSize: 50, transform: `scale(${cp})`, opacity: cp > 0 ? 1 : 0 }}>{ch}</div>;
        })}
      </div>
      {last && d.content.cta && <div style={{ position: "absolute", top: 1560, left: 0, width: W, display: "flex", justifyContent: "center" }}><div style={{ background: "#FACC15", color: "#1E1B4B", borderRadius: 999, padding: "22px 56px", fontFamily: FONT, fontWeight: 800, fontSize: 48 }}>{d.content.cta}</div></div>}
    </div>
  );
};

export const Orbit3D: React.FC<{ data: Data; name: string }> = ({ data, name }) => (
  <Shell data={data} name={name} bg="linear-gradient(180deg,#1E1B4B 0%,#4C1D95 55%,#BE185D 120%)" captionTop={1700} sceneSfx="swoosh">
    <ThreeCanvas width={W} height={H} camera={{ position: [0, 0.4, 12], fov: 38 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} />
      <pointLight position={[-5, -2, 4]} intensity={40} color="#F472B6" />
      <pointLight position={[5, 2, -2]} intensity={30} color="#38BDF8" />
      <Stars />
      <Hero />
    </ThreeCanvas>
    <ProgressDots y={130} color="#fff" dim="rgba(255,255,255,0.25)" />
    <Text />
    {data.timeline.scenes.map((s, k) => <Sfx key={k} at={s.start + 0.1} f="pop" v={0.4} />)}
  </Shell>
);
