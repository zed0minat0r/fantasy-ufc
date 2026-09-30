# Fantasy UFC

Pick every fight on the card - the winner and how it ends - and earn points when
you get it right. No money, no odds, just predictions.

**Design preview (phone):** https://zed0minat0r.github.io/fantasy-ufc/

## Where the fights come from

ESPN's core API, which is free, needs no key and - crucially - carries the
**finish**: winner, method, round and time. That is the whole scoring input.

    http://sports.core.api.espn.com/v2/sports/mma/leagues/ufc/events?dates=<year>&limit=100

Everything hangs off `$ref` links. The finish is NOT in statistics or boxscore,
it is on the competition's **status**: `status.result.displayName` is the method,
`status.period` the round, `status.displayClock` the time.

`scripts/fetch_event.mjs` walks all that and bakes the next card to
`data/event.json`. It is a build step because one card costs ~40 requests, which
is fine offline and unacceptable inside the app. The real backend will run the
same thing on a schedule.

    node scripts/fetch_event.mjs          # next upcoming card
    node scripts/fetch_event.mjs --past   # most recent finished card, for testing scoring

**The endpoint is undocumented.** It can change or be blocked without notice, so
scoring needs a manual override path - a wrong feed must be visible, not silent.

## Scoring

`src/scoring.js`, deliberately pure so the same code can run on a server when
results land.

| | |
|---|---|
| Correct fighter | 10 |
| Correct fighter **and** method | 15 |

## Running it

    npm install
    npm run web        # browser
    npm run ios        # simulator / Expo Go
    npm start          # then scan the QR with Expo Go

## Publishing the preview

    npx expo export -p web && rm -rf docs && cp -R dist docs && touch docs/.nojekyll

GitHub Pages serves `main` → `/docs`. `expo.experiments.baseUrl` in `app.json`
is `/fantasy-ufc` so the asset paths resolve under the project subpath.

## Not built yet

Accounts, saving picks, leaderboards, friends. And the long game Matt wants:
spending points on a fighter and a home gym, then PVP. Points and profiles are
stored so that can bolt on - the sim is deliberately not started.
