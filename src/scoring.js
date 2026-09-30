/** Scoring. Pure and side-effect free so the identical code can run on a server
 *  when results land, and so it can be tested without a renderer.
 *
 *  THE PRICE OF A PICK COMES FROM THE MARKET. Matt: "I'm sure Natalia Silva to
 *  get a submission is probably crazy odds so if the person wanted to pick that
 *  and get it, they should get a ton of points." So points are derived from the
 *  DraftKings moneyline ESPN publishes: implied probability in, points out. A
 *  +455 underdog is worth about five times a -625 favourite because it is about
 *  five times less likely, and nobody has to hand-tune a table of fighters.
 */
export const METHODS = [
  { id: "ko", label: "KO/TKO", short: "KO" },
  { id: "sub", label: "Submission", short: "SUB" },
  { id: "dec", label: "Decision", short: "DEC" },
];

/** Small numbers on purpose. Matt: "make the point denominations smaller, I
 *  don't like how big the points are." At 2, a heavy favourite is worth 2 and a
 *  big underdog about 11, which keeps a whole card in double figures instead of
 *  the hundreds. Change this one number to rescale the entire game. */
export const BASE_POINTS = 2;

/** No free feed publishes method-of-victory props - ESPN has the winner market
 *  and a rounds over/under and nothing more. So these are OUR numbers, not the
 *  market's, and they are in one place to be argued with. Roughly the real-world
 *  split of UFC finishes: decisions are the most common outcome, submissions the
 *  least, so calling a submission pays the most. */
export const METHOD_MULTIPLIER = { ko: 1.8, sub: 2.2, dec: 1.4 };   // ours, not the market's - no free feed prices method

/** American moneyline -> implied probability. -205 means risk 205 to win 100. */
export function impliedProbability(moneyLine) {
  if (moneyLine == null || !Number.isFinite(moneyLine)) return null;
  return moneyLine > 0 ? 100 / (moneyLine + 100) : -moneyLine / (-moneyLine + 100);
}

/** What backing this fighter is worth if they simply win.
 *  Unpriced bouts (an early card with no market yet) fall back to the base. */
export function winnerPoints(fighter) {
  const p = impliedProbability(fighter?.moneyLine);
  if (!p) return BASE_POINTS;
  return Math.max(BASE_POINTS, Math.round(BASE_POINTS / p));
}

/** And with the method called as well. */
export function pickPoints(fighter, method) {
  const win = winnerPoints(fighter);
  if (!method) return win;
  return Math.round(win * (METHOD_MULTIPLIER[method] ?? 1));
}

/** ESPN writes the finish as "KO/TKO", "Submission", "Decision - Unanimous"... */
export function methodIdFromResult(result) {
  if (!result?.method) return null;
  const m = result.method.toLowerCase();
  if (m.includes("sub")) return "sub";
  if (m.includes("ko") || m.includes("tko")) return "ko";
  if (m.includes("dec")) return "dec";
  return null;
}

/** Score one pick against a finished bout. Returns the points AND the working,
 *  because a scoring app that will not show its maths gets argued with. */
export function scorePick(pick, bout) {
  if (!pick?.fighterId || !bout?.finished || !bout.result) return { points: 0, lines: [] };
  const winner = bout.fighters.find((f) => f.winner);
  if (!winner) return { points: 0, lines: [] };

  const backed = bout.fighters.find((f) => String(f.id) === String(pick.fighterId));
  if (!backed || String(winner.id) !== String(pick.fighterId)) {
    return { points: 0, lines: [{ label: "Wrong fighter", points: 0 }] };
  }

  const win = winnerPoints(backed);
  const actual = methodIdFromResult(bout.result);
  const rightMethod = pick.method && actual && pick.method === actual;

  const lines = [{ label: `${backed.name} to win`, points: win }];
  if (pick.method && !rightMethod) lines.push({ label: "Method missed", points: 0 });
  if (rightMethod) {
    lines.push({ label: `By ${METHODS.find((m) => m.id === actual)?.label.toLowerCase()}`,
                 points: pickPoints(backed, actual) - win });
  }
  return { points: rightMethod ? pickPoints(backed, actual) : win, lines };
}

/** What a pick is worth if everything lands - shown before the fights. */
export function potential(pick, bout) {
  if (!pick?.fighterId || !bout) return 0;
  const f = bout.fighters.find((x) => String(x.id) === String(pick.fighterId));
  return f ? pickPoints(f, pick.method) : 0;
}

export const scoreCard = (picks, bouts) =>
  bouts.reduce((sum, b) => sum + scorePick(picks[b.id], b).points, 0);

export const potentialCard = (picks, bouts) =>
  bouts.reduce((sum, b) => sum + potential(picks[b.id], b), 0);
