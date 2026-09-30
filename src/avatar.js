import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";

/** The character.
 *
 *  DiceBear's Pixel Art set, generated locally - no network call, ~1.6KB of SVG
 *  per character, and CC0 so there is no attribution to honour and nothing to
 *  renegotiate if the app ever charges. Chosen over drawing a sprite sheet
 *  because a character is then a handful of choices rather than a pile of
 *  images, and the parts can be swapped for custom-drawn ones later without the
 *  rest of the app noticing.
 */

const opt = (k) => pixelArt.schema.properties[k]?.items?.enum ?? pixelArt.schema.properties[k]?.enum ?? [];

/** Only the parts worth putting in front of someone. The set also ships
 *  probabilities and background options that would just be noise here. */
export const PARTS = [
  { key: "hair", label: "Hair", options: opt("hair") },
  { key: "eyes", label: "Eyes", options: opt("eyes") },
  { key: "mouth", label: "Mouth", options: opt("mouth") },
  { key: "beard", label: "Beard", options: opt("beard"), optional: true },
  { key: "glasses", label: "Glasses", options: opt("glasses"), optional: true },
  { key: "hat", label: "Hat", options: opt("hat"), optional: true },
  { key: "clothing", label: "Kit", options: opt("clothing") },
];

export const SWATCHES = {
  skinColor: ["8d5524", "a26d3d", "b68655", "cb9e6e", "e0b188", "f5cfa0", "ffdbac"],
  hairColor: ["000000", "2c1b18", "603015", "89523d", "a55728", "b58143", "d6b370", "e8e1e1", "cb6820", "6a4e35"],
  clothingColor: ["8b5cf6", "2dd4bf", "e11d48", "f59e0b", "22c55e", "3b82f6", "e5e7eb", "1f2937"],
  eyesColor: ["647b90", "5b7c8d", "76778b", "697b94", "4b5563", "2c1b18"],
};

export const DEFAULT_CHARACTER = {
  seed: "fighter",
  hair: opt("hair")[10] ?? opt("hair")[0],
  eyes: opt("eyes")[3] ?? opt("eyes")[0],
  mouth: opt("mouth")[12] ?? opt("mouth")[0],
  beard: null,
  glasses: null,
  hat: null,
  clothing: opt("clothing")[4] ?? opt("clothing")[0],
  skinColor: SWATCHES.skinColor[3],
  hairColor: SWATCHES.hairColor[2],
  clothingColor: SWATCHES.clothingColor[0],
  eyesColor: SWATCHES.eyesColor[0],
};

/** DiceBear takes arrays and picks from them; give it one value and it is
 *  deterministic, which is what "this is MY character" requires. A null part
 *  means "none", which the set expresses as a 0% probability. */
export function avatarSvg(ch, size = 160) {
  const o = { seed: ch.seed ?? "fighter", size, scale: 92 };
  for (const p of PARTS) {
    if (ch[p.key]) o[p.key] = [ch[p.key]];
    else if (p.optional) o[`${p.key}Probability`] = 0;
  }
  for (const k of ["skinColor", "hairColor", "clothingColor", "eyesColor"]) {
    if (ch[k]) o[k] = [ch[k]];
  }
  for (const p of PARTS) if (ch[p.key] && p.optional) o[`${p.key}Probability`] = 100;
  return createAvatar(pixelArt, o).toString();
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function randomCharacter() {
  const ch = { seed: String(Math.random()).slice(2, 9) };
  for (const p of PARTS) {
    ch[p.key] = p.optional && Math.random() < 0.55 ? null : pick(p.options);
  }
  for (const k of Object.keys(SWATCHES)) ch[k] = pick(SWATCHES[k]);
  return ch;
}
