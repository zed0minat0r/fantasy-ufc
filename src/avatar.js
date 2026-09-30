import { createAvatar } from "@dicebear/core";
import { toonHead } from "@dicebear/collection";

/** The character.
 *
 *  DiceBear's toonHead, CURATED. Matt picked the style, then: "we shouldn't
 *  just have random people in there, they should only be able to choose people
 *  that look like fighters." So the option lists below are deliberately shorter
 *  than what the set ships - a shirt, a dress and a sad mouth are all available
 *  and all wrong for someone about to fight. Everything left in reads as a
 *  fighter, so there is no way to build an accountant.
 *
 *  Generated locally: no network call, CC0 art, ~2KB a character. avatar.js is
 *  the only file that knows where the parts come from, so this can be replaced
 *  with commissioned art later without touching the rest of the app.
 */

const all = (k) => toonHead.schema.properties[k]?.items?.enum ?? [];
const only = (k, keep) => all(k).filter((v) => keep.includes(v));

/** A shaved head is as much a fighter look as any hairstyle, so "none" is a
 *  first-class option rather than an accident of probability. */
export const BALD = "__bald";

export const PARTS = [
  {
    key: "hair", label: "Hair",
    // every cut here is short or tied back - nothing that would last a round
    options: [BALD, ...only("hair", ["undercut", "spiky", "sideComed", "bun"])],
  },
  {
    key: "rearHair", label: "Back", optional: true,
    options: only("rearHair", ["neckHigh", "shoulderHigh", "longStraight"]),
  },
  {
    key: "beard", label: "Beard", optional: true,
    options: only("beard", ["chin", "fullBeard", "chinMoustache", "longBeard"]),
  },
  {
    key: "eyebrows", label: "Brow",
    // no "happy" and no "sad": one is a birthday party, the other is a loss
    options: only("eyebrows", ["angry", "neutral", "raised"]),
  },
  {
    key: "eyes", label: "Eyes",
    // "wide" is the only open-eyed option in the set. The rest are closed and
    // read as serene, which is not the look of someone about to fight.
    options: only("eyes", ["wide", "humble", "happy"]),
  },
  {
    key: "mouth", label: "Mouth",
    // agape is an O of surprise and laugh is a belly laugh - Matt: "the facial
    // expressions are ridiculous". Both gone. What is left is a flat mouth and
    // a gritted one.
    options: only("mouth", ["smile", "angry"]),
  },
  {
    key: "clothes", label: "Kit",
    // dress and shirt are out - this is a walkout, not a wedding
    options: only("clothes", ["tShirt", "turtleNeck", "openJacket"]),
  },
];

export const SWATCHES = {
  skinColor: ["8d5524", "a26d3d", "b68655", "cb9e6e", "e0b188", "f5cfa0", "ffdbac"],
  // Natural, plus the bleach blonde a lot of fighters actually walk out with.
  // Purple and teal were in here and a teal BEARD is a joke, not a fighter.
  hairColor: ["0e0e0e", "2c1b18", "603015", "89523d", "a55728", "b58143", "d6b370", "e8e1e1", "f2e3c0"],
  clothesColor: ["8b5cf6", "2dd4bf", "e11d48", "111827", "f59e0b", "22c55e", "3b82f6", "e5e7eb"],
};

/** Straight face by default. In this set "smile" is a closed, flat mouth rather
 *  than a grin - it is the neutral one - and neutral brows with open eyes is as
 *  close to deadpan as the art gets. */
export const DEFAULT_CHARACTER = {
  seed: "fighter",
  hair: "undercut",
  rearHair: null,
  beard: "chin",
  eyebrows: "neutral",
  eyes: "wide",
  mouth: "smile",
  clothes: "tShirt",
  skinColor: SWATCHES.skinColor[3],
  hairColor: SWATCHES.hairColor[1],
  clothesColor: SWATCHES.clothesColor[0],
};

/** DiceBear picks randomly from whatever arrays it is given, so passing exactly
 *  one value per part is what makes a character yours rather than a roll. */
export function avatarSvg(ch, size = 160) {
  const o = { seed: ch.seed ?? "fighter", size, scale: 100 };

  if (ch.hair && ch.hair !== BALD) { o.hair = [ch.hair]; o.hairProbability = 100; }
  else o.hairProbability = 0;

  for (const key of ["rearHair", "beard"]) {
    if (ch[key]) { o[key] = [ch[key]]; o[`${key}Probability`] = 100; }
    else o[`${key}Probability`] = 0;
  }
  for (const key of ["eyebrows", "eyes", "mouth", "clothes"]) {
    if (ch[key]) o[key] = [ch[key]];
  }
  for (const key of ["skinColor", "hairColor", "clothesColor"]) {
    if (ch[key]) o[key] = [ch[key]];
  }
  return createAvatar(toonHead, o).toString();
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** Weighted so a shuffle produces someone who looks like they fight: a hard
 *  brow most of the time, a beard more often than not, long hair rarely. */
export function randomCharacter() {
  const ch = { seed: String(Math.random()).slice(2, 9) };
  ch.hair = pick(PARTS[0].options);
  ch.rearHair = Math.random() < 0.25 ? pick(PARTS[1].options) : null;
  ch.beard = Math.random() < 0.6 ? pick(PARTS[2].options) : null;
  // Lean neutral rather than gurning: a shuffled fighter should look composed,
  // with the odd hard stare, not a cartoon.
  ch.eyebrows = Math.random() < 0.55 ? "neutral" : pick(PARTS[3].options);
  ch.eyes = Math.random() < 0.7 ? "wide" : pick(PARTS[4].options);
  ch.mouth = Math.random() < 0.7 ? "smile" : "angry";
  ch.clothes = pick(PARTS[6].options);
  for (const k of Object.keys(SWATCHES)) ch[k] = pick(SWATCHES[k]);
  return ch;
}
