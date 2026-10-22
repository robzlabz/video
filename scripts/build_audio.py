"""Voiceover + sfx + music + timeline for one content file.
Usage: python3 scripts/build_audio.py content/<name>.json
Writes public/<name>/voice.wav, public/<name>/music.wav, public/<name>/data.json ({content, timeline}) and public/sfx/*.wav.
Needs: pip install edge-tts==7.3.1 numpy ; ffmpeg/ffprobe in PATH ; HTTPS_PROXY is honoured."""
import asyncio, json, os, subprocess, sys, wave
import numpy as np, edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
name = os.path.splitext(os.path.basename(src))[0]
cfg = json.load(open(src, encoding="utf-8"))
OUT = os.path.join(ROOT, "public", name); os.makedirs(OUT, exist_ok=True)
SFX = os.path.join(ROOT, "public", "sfx"); os.makedirs(SFX, exist_ok=True)
TMP = os.path.join(ROOT, "build", name); os.makedirs(TMP, exist_ok=True)
voice, rate, pitch = cfg.get("voice", "id-ID-ArdiNeural"), cfg.get("rate", "+4%"), cfg.get("pitch", "+0Hz")
lead, gap, tail = cfg.get("leadSec", 0.4), cfg.get("gapSec", 0.35), cfg.get("tailSec", 1.6)
PROXY = os.environ.get("HTTPS_PROXY") or None

async def gen(i, sc):
    mp3 = os.path.join(TMP, f"s{i:02d}.mp3")
    for attempt in range(4):
        try:
            com = edge_tts.Communicate(sc["text"], voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=PROXY)
            words = []
            with open(mp3, "wb") as f:
                async for ch in com.stream():
                    if ch["type"] == "audio": f.write(ch["data"])
                    elif ch["type"] == "WordBoundary":
                        words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
            if words: return mp3, words
        except Exception as ex:
            print("retry", ex); await asyncio.sleep(2)
    raise SystemExit(f"no word boundaries for scene {sc['id']}")

def dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode())

async def voiceover():
    t = lead; parts = []; timeline = []
    for i, sc in enumerate(cfg["scenes"]):
        mp3, words = await gen(i, sc)
        wav = os.path.join(TMP, f"s{i:02d}.wav")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp3, "-ar", "48000", "-ac", "2", wav], check=True)
        d = dur(wav)
        timeline.append({"id": sc["id"], "text": sc["text"], "start": round(t, 3), "end": round(t + d, 3),
                         "words": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words]})
        parts.append((t, wav)); t += d + gap
    total = t - gap + tail
    inputs = []; filt = []
    for k, (off, w) in enumerate(parts):
        inputs += ["-i", w]; filt.append(f"[{k}]adelay={int(off*1000)}|{int(off*1000)}[a{k}]")
    filt.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad,atrim=0:{total:.3f}[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[out]", "-ar", "48000", os.path.join(OUT, "voice.wav")], check=True)
    return {"fps": 30, "duration": round(total, 3), "scenes": timeline}

SR = 48000
def save(path, x):
    x = np.clip(x, -1, 1); st = np.stack([x, x], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
def t_(d): return np.arange(int(SR * d)) / SR

def sfx():
    rng = np.random.default_rng(1)
    tt = t_(0.14); f = 380 + 900 * (tt / 0.14) ** 0.5
    save(os.path.join(SFX, "pop.wav"), np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30) * 0.6)
    tt = t_(0.45); n = rng.standard_normal(len(tt)); k = 40
    n = np.convolve(n, np.ones(k) / k, "same") - np.convolve(n, np.ones(400) / 400, "same")
    save(os.path.join(SFX, "swoosh.wav"), n * np.sin(np.pi * tt / 0.45) ** 2 * 1.6)
    def note(fr, d, dec=6, amp=0.4):
        tt = t_(d); return (np.sin(2*np.pi*fr*tt) + 0.3*np.sin(4*np.pi*fr*tt)) * np.exp(-tt*dec) * amp
    ding = np.zeros(int(SR*0.6)); a = note(880, 0.6); b = note(1318.5, 0.5)
    ding[:len(a)] += a; ding[int(SR*0.09):int(SR*0.09)+len(b)] += b
    save(os.path.join(SFX, "ding.wav"), ding * 0.8)
    tt = t_(0.18); bonk = np.sin(2*np.pi*(220 - 80*tt/0.18)*tt) * np.exp(-tt*18) * 0.6
    wrong = np.zeros(int(SR*0.4)); wrong[:len(bonk)] += bonk; wrong[int(SR*0.16):int(SR*0.16)+len(bonk)] += bonk*0.8
    save(os.path.join(SFX, "wrong.wav"), wrong)

def music(total):
    dur_ = total + 0.5; N = int(SR * dur_); m = np.zeros(N); beat = 60 / cfg.get("bpm", 96)
    chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
    mel = [0, 2, 4, 2, 1, 2, 4, 5, 4, 2, 1, 0, 2, 1, 4, 2]
    scale = [523.3, 587.3, 659.3, 784.0, 880.0, 1046.5]
    i = 0; tpos = 0.0
    while tpos < dur_:
        s = int(tpos * SR)
        if i % 8 == 0:
            ch = chords[(i // 8) % 4]; L = min(int(SR * beat * 8), N - s); tt = np.arange(L) / SR
            pad = sum(np.sin(2*np.pi*fr*tt) + 0.5*np.sin(2*np.pi*fr*0.5*tt) for fr in ch)
            m[s:s+L] += pad * np.minimum(1, tt / 0.8) * np.minimum(1, (L/SR - tt) / 0.8) * 0.035
        if i % 2 == 0:
            fr = scale[mel[(i // 2) % len(mel)]]; L = min(int(SR * 0.5), N - s); tt = np.arange(L) / SR
            m[s:s+L] += (np.sin(2*np.pi*fr*tt) * 0.6 + 0.4*np.sin(2*np.pi*2*fr*tt)) * np.exp(-tt*7) * 0.05
        i += 1; tpos += beat / 2
    fade = np.minimum(1, np.arange(N) / SR) * np.minimum(1, (N - np.arange(N)) / (SR * 1.5))
    save(os.path.join(OUT, "music.wav"), m * fade)

tl = asyncio.run(voiceover())
sfx(); music(tl["duration"])
json.dump({"content": cfg, "timeline": tl}, open(os.path.join(OUT, "data.json"), "w"), indent=1, ensure_ascii=False)
print(name, "duration", tl["duration"], "scenes", len(tl["scenes"]))
