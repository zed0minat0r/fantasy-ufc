/** Scoring. Deliberately small and pure so it can be unit tested and, later,
 *  run identically on a server when results come in.
 *
 *  The shape Matt asked for: pick the fighter, pick the method. Getting the
 *  fighter right is the bread and butter; getting the method as well is the bit
 *  that makes people argue about it on a Saturday night, so it pays more than
 *  the winner alone but not so much that method-chasing beats picking winners.
 */
export const METHODS = [
  { id: "ko", label: "KO/TKO", short: "KO" },
  { id: "sub", label: "Submission", short: "SUB" },
  { id: "dec", label: "Decision", short: "DEC" },
];

export const POINTS = {
  winner: 10,      // right fighter
  method: 15,      // right fighter AND right method
  round: 5,        // bonus, only offered on a finish - not wired to the UI yet
};

/** ESPN writes the finish as "KO/TKO", "Submission", "Decision - Unanimous"... */
export function methodIdFromResult(result) {
  if (!result?.method) return null;
  const m = result.method.toLowerCase();
  if (m.includes("sub")) return "sub";
  if (m.includes("ko") || m.includes("tko")) return "ko";
  if (m.includes("dec")) return "dec";
  return null;
}

/** A single pick against a finished bout. Returns the points and WHY, because
 *  a scoring app that will not show its working gets argued with. */
export function scorePick(pick, bout) {
  if (!pick?.fighterId || !bout?.finished || !bout.result) return { points: 0, lines: [] };
  const winner = bout.fighters.find((f) => f.winner);
  if (!winner) return { points: 0, lines: [] };

  const rightFighter = String(winner.id) === String(pick.fighterId);
  if (!rightFighter) return { points: 0, lines: [{ label: "Wrong fighter", points: 0 }] };

  const actual = methodIdFromResult(bout.result);
  const rightMethod = pick.method && actual && pick.method === actual;

  const lines = [{ label: "Correct fighter", points: POINTS.winner }];
  if (rightMethod) lines.push({ label: "Correct method", points: POINTS.method - POINTS.winner });

  return { points: rightMethod ? POINTS.method : POINTS.winner, lines };
}

/** What a pick is worth if everything lands - shown before the fights so people
 *  can see what they are playing for. */
export const potential = (pick) => (pick?.method ? POINTS.method : pick?.fighterId ? POINTS.winner : 0);

export const scoreCard = (picks, bouts) =>
  bouts.reduce((sum, b) => sum + scorePick(picks[b.id], b).points, 0);
