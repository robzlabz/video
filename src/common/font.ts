import { continueRender, delayRender, staticFile } from "remotion";
// Plus Jakarta Sans, bundled in public/ (latin subset) so rendering works without Google Fonts access.
export const FONT = "Plus Jakarta Sans";
const handle = delayRender("loading Plus Jakarta Sans");
Promise.all(
  ["700", "800"].map((weight) => {
    const face = new FontFace(FONT, `url(${staticFile(`PlusJakartaSans-${weight}.woff2`)})`, { weight });
    document.fonts.add(face);
    return face.load();
  })
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
