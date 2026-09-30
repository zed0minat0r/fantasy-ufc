/** The fighter, drawn here rather than borrowed.
 *
 *  Full body, head to toe, as layered flat vector: skin, shorts, gloves, wraps,
 *  hair, beard. Every layer is a path in this file, so a new pair of shorts is a
 *  new path and nothing else in the app changes.
 *
 *  Drawn for MMA specifically, which is what makes it read as a fighter rather
 *  than a person in shorts: open-finger gloves, wraps at the wrist, barefoot,
 *  a wide stance, and a build with shoulders wider than the hips.
 *
 *  Canvas is 220 x 420, feet on the floor at y=404.
 */

const W = 220, H = 420;

/* ----------------------------------------------------------------- palette */

export const SKIN = ["f0c3a0", "e0a97e", "c98d62", "a9704a", "855539", "5f3c28"];
export const HAIR = ["1b1310", "3b2a1c", "6b4423", "9c6b3f", "c9a227", "e8e1e1", "0e0e0e"];
export const KIT = ["8b5cf6", "2dd4bf", "e11d48", "f59e0b", "22c55e", "3b82f6", "111827", "e5e7eb"];

const shade = (hex, amt) => {
  const n = parseInt(hex, 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * amt)));
  return ((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, "0");
};

/* ------------------------------------------------------------------- parts */

/** Body.
 *
 *  Landmarks, because a fighter is a shape before it is a drawing:
 *    head 22-84 · neck 84-100 · shoulders y100 x58-162 (widest)
 *    waist y196 x86-134 (narrowest) · hips y226 · knee y316 · floor y404
 *  That is a V from shoulder to waist, which is the whole silhouette. The first
 *  version had the same width all the way down and read as a barrel.
 *
 *  Arms hang CLEAR of the torso with daylight between - merged into the body
 *  they disappear and the shape stops being a person.
 */
const body = (skin) => {
  const s = `#${skin}`;
  const sh = `#${shade(skin, 0.84)}`;
  const dk = `#${shade(skin, 0.72)}`;
  const hi = `#${shade(skin, 1.07)}`;
  // Limbs are STROKED paths with round caps, not filled polygons. Three
  // attempts at polygon arms gave either sticks or shoulder pads; a stroke with
  // a round cap is a limb with a joint at each end, which is what a limb is.
  const limb = (d, w, fill) =>
    `<path d="${d}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  return `
  <g>
    <!-- legs: hip -> knee -> ankle, the far one set back and darker -->
    ${limb("M96 232 L92 300 L90 384", 32, sh)}
    ${limb("M124 232 L128 300 L130 384", 32, s)}
    <!-- toes point OUTWARD, one each way: a stance, not two right feet -->
    <path d="M100 378H82q-10 0-14 6l-6 4q-3 3 0 5h38q4 0 4-4v-7q0-4-4-4z" fill="${sh}"/>
    <path d="M78 387q6-3 12-3h8v4H76z" fill="${dk}" opacity=".35"/>
    <path d="M120 378h18q10 0 14 6l6 4q3 3 0 5h-38q-4 0-4-4v-7q0-4 4-4z" fill="${s}"/>
    <path d="M142 387q-6-3-12-3h-8v4h22z" fill="${dk}" opacity=".3"/>

    <!-- arms BEHIND the torso so the shoulder tucks in instead of sitting on
         top as a blob -->
    ${limb("M80 116 L64 156 L54 194", 25, sh)}
    ${limb("M140 116 L156 156 L166 194", 25, s)}

    <!-- neck, BEFORE the torso so the traps overlap it instead of the other way
         round - drawn after, it printed a dark collar across the shoulders -->
    ${limb("M110 80 L110 102", 21, sh)}

    <!-- torso -->
    <path d="M110 96q17 0 26 9 5 5 7 14l4 38q2 11-2 19l-4 14q-3 9-9 9H88q-6 0-9-9l-4-14q-4-8-2-19l4-38q2-9 7-14 9-9 26-9z" fill="${s}"/>
    <path d="M110 96q17 0 26 9 5 5 7 14l4 38q2 11-2 19l-4 14q-3 9-9 9h-24z" fill="${sh}" opacity=".26"/>
    <path d="M92 114q9 11 18 11t18-11" stroke="${dk}" stroke-width="2" fill="none" opacity=".3" stroke-linecap="round"/>
    <path d="M88 100q10-6 22-6t22 6" stroke="${dk}" stroke-width="2.2" fill="none" opacity=".3" stroke-linecap="round"/>
    <path d="M109 128v78" stroke="${dk}" stroke-width="2.4" opacity=".32" stroke-linecap="round"/>
    <path d="M99 152h22M99 168h22M100 184h20" stroke="${dk}" stroke-width="1.8" opacity=".2" stroke-linecap="round"/>

  </g>`;
};

/** Head. A squared jaw and a slightly heavy brow do more for "fighter" than any
 *  amount of detail. Sized at about a sixth of the figure - realistic is eight,
 *  but at phone size that gives you a pinhead. */
const head = (skin) => {
  const s = `#${skin}`, sh = `#${shade(skin, 0.9)}`;
  return `
  <g>
    <path d="M110 16q30 0 30 28v15q0 15-8 24t-22 9q-14 0-22-9t-8-24V44q0-28 30-28z" fill="${s}"/>
    <path d="M90 62q2 14 8 20h24q6-6 8-20v6q0 16-9 23t-11 0-11 0-9-23z" fill="${sh}" opacity=".3"/>
    <ellipse cx="82" cy="56" rx="5" ry="8" fill="${sh}"/>
    <ellipse cx="138" cy="56" rx="5" ry="8" fill="${sh}"/>
  </g>`;
};

/** The face. Matt: "the faces have zero detail in them" - it was two dots and a
 *  line. Now: eyes with a white, an iris and a catchlight, a nose with a shadow
 *  down one side, a mouth with a lip line, cheekbones and a jaw shadow. All of
 *  it has to be BOLD at this size, because the head is about 50px tall on a
 *  phone and anything subtle disappears. */
const face = (brow, skin) => {
  const dk = `#${shade(skin, 0.72)}`;
  const mid = `#${shade(skin, 0.85)}`;
  // Almond eyes with a heavy upper lid. Round eyes with big whites was the
  // single thing making this look like a children's cartoon - a fighter's eye
  // is mostly lid.
  const eye = (cx) => `
    <path d="M${cx - 8} 60q8-8 16 0q-8 6-16 0z" fill="#f4efe8"/>
    <circle cx="${cx}" cy="59.5" r="3.1" fill="#2f2118"/>
    <circle cx="${cx + 1}" cy="58.6" r="0.9" fill="#fff" opacity=".85"/>
    <path d="M${cx - 8} 60q8-8 16 0" stroke="#2a1d16" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  const brows = {
    // inner ends LOW for the hard brow: inner-high reads as worried, which is
    // what the last pass drew by mistake
    level: `<path d="M90 48h15v3.6H90zm25 0h15v3.6h-15z" fill="#2a1d16"/>`,
    hard: `<path d="M90 46l15 5v4l-15-4z" fill="#2a1d16"/>
           <path d="M130 46l-15 5v4l15-4z" fill="#2a1d16"/>`,
  };
  return `
  <g>
    <path d="M86 56q3 13 10 18l-8 3q-6-7-6-18z" fill="${dk}" opacity=".26"/>
    <path d="M134 56q-3 13-10 18l8 3q6-7 6-18z" fill="${dk}" opacity=".26"/>
    <path d="M93 78q7 8 17 8t17-8q-4 11-17 11t-17-11z" fill="${dk}" opacity=".2"/>

    ${brows[brow] ?? brows.level}
    ${eye(99)}
    ${eye(121)}

    <!-- nose: bridge, tip, nostrils -->
    <path d="M110 58v9q0 3-3 4" stroke="${mid}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M104 71q6 4 12 0" stroke="${dk}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="105.5" cy="70.5" r="1.1" fill="${dk}" opacity=".7"/>
    <circle cx="114.5" cy="70.5" r="1.1" fill="${dk}" opacity=".7"/>

    <path d="M102 80h16" stroke="#6f3f33" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M104 84q6 2.5 12 0" stroke="${dk}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".45"/>
  </g>`;
};

/* ----------------------------------------------------------------- styles */

/** Haircuts, drawn to the CURRENT skull.
 *
 *  The head was enlarged in an earlier pass - top y16, sides x80 and x140,
 *  jaw around y88 - and these were still cut for the old smaller one, so every
 *  style sat wrong and only the bald head looked right. They all trace the same
 *  dome now: M80 46 q0-30 30-30 t30 30.
 */
export const HAIRCUTS = {
  shaved: () => "",

  buzz: (c) => `<path d="M80 48q0-32 30-32t30 32v7q-9-17-30-17t-30 17z" fill="#${c}"/>`,

  crop: (c) => `<path d="M78 48q0-34 32-34t32 34v6q-9-18-32-18t-32 18z" fill="#${c}"/>
                <path d="M97 19q9 9 27 11" stroke="#${shade(c, 0.66)}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>`,

  topknot: (c) => `<path d="M80 48q0-32 30-32t30 32v5q-9-15-30-15t-30 15z" fill="#${c}"/>
                   <path d="M104 18q6-4 12 0v6h-12z" fill="#${c}"/>
                   <circle cx="110" cy="11" r="10" fill="#${c}"/>`,

  // The falls go BEHIND the head (see `.back`), which is the only way they read
  // as hair. Drawn in front they sit on the cheeks and squeeze the face into a
  // slot - two passes of that looked like curtains, not a fighter.
  long: (c) => `<path d="M80 50q0-34 30-34t30 34v4q-9-16-30-16t-30 16z" fill="#${c}"/>`,
};

/** Layers that belong BEHIND the head. A haircut with hanging length has to be
 *  drawn before the skull or it covers the face; everything else has none. */
HAIRCUTS.long.back = (c) => `
  <path d="M104 28q-38 6-38 42v48q0 8 8 8h18q-8-14-8-36V64q0-22 20-30z" fill="#${c}"/>
  <path d="M116 28q38 6 38 42v48q0 8-8 8h-18q8-14 8-36V64q0-22-20-30z" fill="#${c}"/>`;

/** Beards, drawn to the same jaw: the face narrows from x80/x140 at the
 *  cheekbone to about x92/x128 at the chin, bottom around y88. */
export const BEARDS = {
  none: () => "",
  stubble: (c) => `<path d="M81 58q3 26 29 26t29-26v9q0 24-29 24T81 67z" fill="#${c}" opacity=".38"/>`,
  goatee: (c) => `<path d="M99 73q11-4 22 0-2 5-11 5t-11-5z" fill="#${c}"/>
                  <path d="M102 85q8 3 16 0-1 8-8 8t-8-8z" fill="#${c}"/>
                  <path d="M102 80h16" stroke="#6f3f33" stroke-width="3" stroke-linecap="round"/>`,
  full: (c) => `<path d="M80 56q2 30 30 30t30-30v12q0 30-30 30T80 68z" fill="#${c}"/>
                <path d="M102 80h16" stroke="#6f3f33" stroke-width="3.2" stroke-linecap="round"/>`,
  moustache: (c) => `<path d="M99 73q11-4 22 0-2 5-11 5t-11-5z" fill="#${c}"/>`,
};

/** Fight shorts. Board-short and vale-tudo lengths, plus a waistband stripe,
 *  because the waistband is the bit that says "fight shorts" and not "swim". */
export const SHORTS = {
  board: (c) => {
    const d = shade(c, 0.74);
    return `<path d="M80 214h60l6 46q1 8-6 8h-22l-8-28-8 28H80q-7 0-6-8z" fill="#${c}"/>
            <path d="M80 214h60l2 13H78z" fill="#${d}"/>
            <path d="M108 230h4v38h-4z" fill="#${d}" opacity=".55"/>`;
  },
  vale: (c) => {
    const d = shade(c, 0.74);
    return `<path d="M82 214h56l4 32q1 7-6 7h-20l-6-20-6 20H84q-7 0-6-7z" fill="#${c}"/>
            <path d="M82 214h56l2 12H80z" fill="#${d}"/>`;
  },
  slit: (c) => {
    const d = shade(c, 0.74);
    return `<path d="M80 214h60l6 44q1 8-6 8h-22l-8-26-8 26H80q-7 0-6-8z" fill="#${c}"/>
            <path d="M80 214h60l2 13H78z" fill="#${d}"/>
            <path d="M78 232l8 34h-9l-6-32z" fill="#${d}" opacity=".65"/>
            <path d="M142 232l-8 34h9l6-32z" fill="#${d}" opacity=".65"/>`;
  },
};

/** Open-finger gloves with a wrap showing at the wrist. The cut-out thumb and
 *  the exposed fingers are the whole tell - boxing gloves would read as boxing. */
const gloves = (c) => {
  const d = shade(c, 0.78);
  return `
  <g>
    <rect x="38" y="184" width="26" height="9" rx="3" fill="#f2efe6"/>
    <rect x="40" y="188" width="22" height="3" rx="1.5" fill="#d9d4c6"/>
    <path d="M42 192q-10 4-10 14l2 16q1 9 10 10l11 1q8 0 9-8l2-18q1-10-8-13z" fill="#${c}"/>
    <path d="M34 222q2 7 10 8l11 1q7 0 9-6l-1 9q-1 7-9 7l-11-1q-8-1-9-9z" fill="#${d}"/>
    <path d="M32 209l-7 3q-4 2-2 7t6 3l7-3z" fill="#${c}"/>

    <rect x="156" y="184" width="26" height="9" rx="3" fill="#f2efe6"/>
    <rect x="158" y="188" width="22" height="3" rx="1.5" fill="#d9d4c6"/>
    <path d="M178 192q10 4 10 14l-2 16q-1 9-10 10l-11 1q-8 0-9-8l-2-18q-1-10 8-13z" fill="#${c}"/>
    <path d="M186 222q-2 7-10 8l-11 1q-7 0-9-6l1 9q1 7 9 7l11-1q8-1 9-9z" fill="#${d}"/>
    <path d="M188 209l7 3q4 2 2 7t-6 3l-7-3z" fill="#${c}"/>
  </g>`;
};

/* ------------------------------------------------------------------ export */

export function fighterSvg(ch, size = 300) {
  const skin = ch.skin ?? SKIN[2];
  const hairC = ch.hairColor ?? HAIR[1];
  const kit = ch.kitColor ?? KIT[0];
  const cut = HAIRCUTS[ch.hair] ?? HAIRCUTS.buzz;
  const beard = BEARDS[ch.beard] ?? BEARDS.none;
  const shorts = SHORTS[ch.shorts] ?? SHORTS.board;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${size * W / H}" height="${size}">
  <ellipse cx="110" cy="405" rx="58" ry="8" fill="#000" opacity=".28"/>
  ${body(skin)}
  ${shorts(kit)}
  ${gloves(ch.gloveColor ?? kit)}
  ${cut.back ? cut.back(hairC) : ""}
  ${head(skin)}
  ${face(ch.brow ?? "level", skin)}
  ${beard(hairC)}
  ${cut(hairC)}
</svg>`;
}

export const DEFAULT_FIGHTER = {
  skin: SKIN[2], hairColor: HAIR[1], kitColor: KIT[0],
  hair: "buzz", beard: "stubble", shorts: "board", brow: "level",
};
