/** Purple, teal and white on near-black - Matt's palette.
 *  Kept in one place because the whole app is two accent colours and a lot of
 *  restraint; the moment these get sprinkled inline the app stops looking like
 *  one thing. */
export const C = {
  bg: "#0A0712",
  surface: "#150F26",
  surfaceHi: "#1E1638",
  line: "rgba(255,255,255,0.08)",
  lineHi: "rgba(255,255,255,0.16)",

  purple: "#8B5CF6",
  purpleHi: "#A78BFA",
  purpleDim: "rgba(139,92,246,0.16)",

  teal: "#2DD4BF",
  tealHi: "#5EEAD4",
  tealDim: "rgba(45,212,191,0.14)",

  white: "#F6F4FF",
  text: "#EDEAFB",
  muted: "#9D95BD",
  faint: "#6B6390",

  win: "#2DD4BF",
  lose: "#F87171",
};

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const R = { sm: 10, md: 14, lg: 18, pill: 999 };

/** One type scale. Sizes are deliberate: nothing between 13 and 15, so labels
 *  and body never sit a hair apart and look like a mistake. */
export const T = {
  hero: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  title: { fontSize: 19, fontWeight: "800", letterSpacing: -0.2 },
  name: { fontSize: 15, fontWeight: "700", letterSpacing: -0.1 },
  body: { fontSize: 15, fontWeight: "500" },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase" },
  small: { fontSize: 13, fontWeight: "600" },
  tiny: { fontSize: 11, fontWeight: "600" },
};
