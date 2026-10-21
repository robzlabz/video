# video — template video edukasi (Remotion, 1080x1920, 30fps)

Satu proyek Remotion berisi **6 template** dengan bentuk visual berbeda. Setiap template adalah satu *composition*; isi videonya sepenuhnya dari satu file JSON (`content/<nama>.json`), jadi video baru cukup mengganti konten.

## Template

| Composition | Bentuk visual | Cocok untuk | Field scene |
|---|---|---|---|
| `Whiteboard` | Papan tulis putih, garis digambar bertahap seperti spidol (efek goyang tangan) | Penjelasan konsep, "apa itu X" | `heading`, `icon`, `notes[]`, `noteWords[]` |
| `Infographic` | 2D flat gelap, grafik animasi (bar, donut, angka besar, garis) | Fakta, data, statistik | `kind` (`intro/bar/donut/stat/line/outro`), `heading`, `data`, `value`, `points`, `syncWord` |
| `Flow` | Diagram langkah vertikal, node menyala satu per satu dan tercentang | Proses, cara kerja, tutorial | `step:true`, `title`, `desc`, `icon` |
| `Versus` | Layar terbelah atas/bawah A vs B, skor dan piala per ronde | Perbandingan dua hal | `sides` (top-level), `kind` (`intro/round/verdict`), `label`, `a`, `b`, `winner` (0/1/-1) |
| `Kinetic` | Tipografi kinetik layar penuh, kata muncul tepat saat diucapkan, warna ganti tiap scene | Tips cepat, kutipan, daftar kebiasaan | `emphasis[]`, `kicker`, `palette` (top-level) |
| `Orbit3D` | Objek 3D mengilap (bola, kubus, torus, knot, dll) dengan satelit mengorbit | Konsep sains/benda, tiga wujud, dsb | `heading`, `shape`, `color`, `chips[]` |

Ini berbeda dari adegan 3D clay/pipa TCP-UDP sebelumnya.

## Format konten

```json
{
  "template": "Versus",
  "title": "Judul video",
  "cta": "Follow buat penjelasan berikutnya!",
  "voice": "id-ID-ArdiNeural", "rate": "+4%", "pitch": "+0Hz",
  "scenes": [ { "id": "hook", "text": "Kalimat yang diucapkan (satu scene = satu kalimat)", "...field template..." } ]
}
```

- `text` tiap scene diucapkan lewat edge-tts; durasi scene dan timing per kata otomatis dari suara.
- `syncWord` / `noteWords` = awalan kata yang memicu animasi saat kata itu diucapkan.
- Icon yang tersedia: lihat `src/common/Icons.tsx` (cloud, phone, lock, bulb, clock, heart, star, check, x, wifi, mail, gear, server, user, coffee, leaf, moon, sun, drop, book, chart, search, globe, send, bolt, trophy, shield, flag, home, money, clipboard).
- Contoh lengkap per template: `content/sample-*.json`.

Preview (still frame): `docs/previews/<template>.png`.

## Cara pakai

```bash
npm ci
pip install edge-tts==7.3.1 numpy            # ffmpeg/ffprobe harus ada di PATH
cp content/sample-versus.json content/my-video.json   # edit isinya
python3 scripts/build_audio.py content/my-video.json  # suara, sfx, musik, timeline -> public/my-video/
npx remotion render src/index.ts Versus out/my-video.mp4 \
  --props='{"name":"my-video"}' --codec h264 --audio-codec aac --gl=swangle \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

Cek visual cepat sebelum render penuh (gambar contact sheet di `build/stills/`):

```bash
scripts/stills.sh Versus my-video 2 6 10 15 20
```

Catatan: pakai `--gl=swangle` di mesin headless (tanpa GPU). `public/<nama>/` dan `public/sfx/` dibuat ulang oleh `build_audio.py`, tidak di-commit.

## Struktur

- `src/templates/*.tsx` satu file per template, `src/Root.tsx` mendaftarkannya.
- `src/common/` bagian bersama: `Shell` (audio, musik, sfx, konteks data), `Captions` (karaoke), `Icons`, `time` (util).
- `scripts/build_audio.py` TTS + timeline + sfx + musik; `scripts/stills.sh` still preview.
