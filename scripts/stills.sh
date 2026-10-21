#!/bin/bash
# usage: scripts/stills.sh <Template> <name> <sec> [<sec>...]  -> build/stills/<name>-<sec>.png + contact sheet build/stills/<name>-sheet.png
# e.g.   scripts/stills.sh Versus sample-versus 2 6 10
cd "$(dirname "$0")/.."
T=$1; N=$2; shift 2
BR=${BROWSER_EXECUTABLE:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
mkdir -p build/stills
B=build/bundle-$N-$$
npx remotion bundle src/index.ts --out-dir $B >/dev/null || exit 1
files=()
for s in "$@"; do
  f=$(python3 -c "print(round($s*30))")
  npx remotion still $B $T build/stills/$N-$s.png --frame=$f --props="{\"name\":\"$N\"}" --gl=swangle --browser-executable=$BR >/dev/null 2>&1 &
  files+=(build/stills/$N-$s.png)
done; wait
ffmpeg -y -v error $(for f in "${files[@]}"; do echo -i $f; done) -filter_complex "$(for i in "${!files[@]}"; do echo -n "[$i]scale=360:640[s$i];"; done)$(for i in "${!files[@]}"; do echo -n "[s$i]"; done)hstack=inputs=${#files[@]}" build/stills/$N-sheet.png
echo build/stills/$N-sheet.png
