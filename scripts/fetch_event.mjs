/**
 * Bake the next UFC card to data/event.json.
 *
 * ESPN's core API is the source (free, no key, and the only one checked that
 * carries the FINISH - method, round and time - which is what scoring needs).
 * Everything hangs off $ref links, so a single card costs ~40 requests; that is
 * fine for a build step and unacceptable inside the app, which is why this is a
 * build step. The real backend will run exactly this on a schedule.
 *
 *   node scripts/fetch_event.mjs            # next upcoming card
 *   node scripts/fetch_event.mjs --past     # the most recent finished card
 *
 * NOTE: undocumented endpoint. If ESPN changes it this script fails loudly
 * rather than writing a half-empty card - see the assert at the end.
 */
import { writeFileSync } from "node:fs";

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };
const BASE = "http://sports.core.api.espn.com/v2/sports/mma/leagues/ufc";

const get = async (url) => {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const deref = (o) => (o && o.$ref ? get(o.$ref) : Promise.resolve(o));

async function listEvents(year) {
  const d = await get(`${BASE}/events?dates=${year}&limit=100`);
  const events = await Promise.all((d.items ?? []).map((i) => get(i.$ref).catch(() => null)));
  return events.filter(Boolean);
}

async function fighter(competitor) {
  const athlete = await deref(competitor.athlete);
  let record = null;
  try {
    const r = await deref(competitor.record);
    record = r?.items?.[0]?.displayValue ?? null;
  } catch {}
  return {
    id: athlete?.id ?? null,
    name: athlete?.displayName ?? "TBD",
    short: athlete?.shortName ?? athlete?.displayName ?? "TBD",
    nickname: athlete?.nickname ?? null,
    headshot: athlete?.headshot?.href ?? null,
    flag: athlete?.flag?.href ?? null,
    record,
    winner: competitor.winner ?? null,
  };
}

async function bout(c) {
  const [competitors, status] = await Promise.all([
    Promise.all((c.competitors ?? []).map(fighter)),
    deref(c.status).catch(() => null),
  ]);
  const result = status?.result ?? null;
  return {
    id: c.id,
    weight: c.type?.text ?? null,
    // ESPN gives the card order the wrong way round for display: last listed is
    // the main event, so the caller reverses.
    fighters: competitors,
    finished: status?.type?.completed ?? false,
    result: result
      ? { method: result.displayName ?? result.name, short: result.shortDisplayName ?? null,
          round: status?.period ?? null, time: status?.displayClock ?? null }
      : null,
  };
}

const main = async () => {
  const wantPast = process.argv.includes("--past");
  const now = Date.now();
  const year = new Date().getUTCFullYear();
  const all = [...(await listEvents(year)), ...(await listEvents(year + 1))];
  const dated = all
    .map((e) => ({ e, t: Date.parse(e.date) }))
    .filter((x) => Number.isFinite(x.t) && (e => true)(x))
    .sort((a, b) => a.t - b.t);

  const pick = wantPast
    ? [...dated].reverse().find((x) => x.t < now && (x.e.competitions ?? []).length)
    : dated.find((x) => x.t > now && (x.e.competitions ?? []).length > 2);

  if (!pick) throw new Error("no event found - has the ESPN endpoint changed?");

  const bouts = await Promise.all((pick.e.competitions ?? []).map(bout));
  const card = {
    id: pick.e.id,
    name: pick.e.name,
    shortName: pick.e.shortName ?? pick.e.name,
    date: pick.e.date,
    venue: pick.e.venues?.[0]?.fullName ?? null,
    fetchedAt: new Date().toISOString(),
    // main event first
    bouts: bouts.reverse().filter((b) => b.fighters.length === 2),
  };

  if (!card.bouts.length) throw new Error("card has no bouts - refusing to write an empty file");
  writeFileSync(new URL("../data/event.json", import.meta.url), JSON.stringify(card, null, 1));
  console.log(`${card.name}  ${card.date}  ->  ${card.bouts.length} bouts`);
  card.bouts.slice(0, 3).forEach((b) =>
    console.log(`   ${b.weight ?? "?"}: ${b.fighters.map((f) => f.name).join("  vs  ")}`));
};

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
