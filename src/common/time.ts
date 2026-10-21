export const FPS = 30, W = 1080, H = 1920;
export type Word = { w: string; s: number; e: number };
export type SceneT = { id: string; text: string; start: number; end: number; words: Word[] };
export type Timeline = { fps: number; duration: number; scenes: SceneT[] };
export type Scene = { id: string; text: string; [k: string]: any };
export type Content = { template: string; title: string; cta?: string; palette?: string[]; scenes: Scene[]; [k: string]: any };
export type Data = { content: Content; timeline: Timeline };

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (x: number) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeInOut = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const easeOutBack = (x: number) => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/** eased progress of t between a and b */
export const prog = (t: number, a: number, b: number, f = easeInOut) => f((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const rnd = (i: number, salt = 0) => { const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453; return x - Math.floor(x); };

/** index of the scene active at time t (scene i owns [start_i, start_{i+1}); first scene owns t < start_1) */
export const sceneIndex = (tl: Timeline, t: number) => {
  let idx = 0;
  tl.scenes.forEach((s, i) => { if (t >= s.start - 0.05) idx = i; });
  return idx;
};
/** time a scene's visuals end: next scene start (or the end of the video) */
export const sceneEnd = (tl: Timeline, i: number) => (tl.scenes[i + 1] ? tl.scenes[i + 1].start : tl.duration);
/** start time of scene i, or of the first word in it starting with `word` (case-insensitive prefix) */
export const startOf = (tl: Timeline, i: number, word?: string) => {
  const sc = tl.scenes[i];
  if (!word) return sc.start;
  const w = sc.words.find((x) => x.w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "").startsWith(word.toLowerCase()));
  return w ? w.s : sc.start;
};
