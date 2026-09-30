import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./theme";
import { Bout, Label, fmtLine } from "./components";
import { METHODS, potential, potentialCard, winnerPoints } from "./scoring";

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

function countdown(iso) {
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

const Page = ({ children }) => (
  <ScrollView
    contentContainerStyle={{ paddingBottom: 110, maxWidth: 720, width: "100%", alignSelf: "center" }}
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

/* ------------------------------------------------------------------- card */

export function CardScreen({ card, picks, setPicks }) {
  const made = Object.values(picks).filter((p) => p?.fighterId).length;
  const onTheLine = potentialCard(picks, card.bouts);
  const pct = card.bouts.length ? made / card.bouts.length : 0;
  const left = countdown(card.date);

  return (
    <Page>
      <LinearGradient
        colors={["rgba(139,92,246,0.28)", "rgba(45,212,191,0.10)", "transparent"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.header}
      >
        <Label>{left ? `Locks in ${left}` : "Happening now"}</Label>
        <Text style={[T.hero, { color: C.white, marginTop: S.sm }]}>{card.name}</Text>
        <Text style={[T.small, { color: C.muted, marginTop: S.xs }]}>
          {fmtDate(card.date)}{card.venue ? ` · ${card.venue}` : ""}
        </Text>

        <View style={{ marginTop: S.xl }}>
          <View style={st.track}>
            <LinearGradient colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[st.fill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
          <View style={st.between}>
            <Text style={[T.small, { color: C.text }]}>{made} of {card.bouts.length} picked</Text>
            <Text style={[T.small, { color: C.teal }]}>{onTheLine} pts on the line</Text>
          </View>
        </View>
      </LinearGradient>

      {card.bouts.map((b, i) => (
        <Bout key={b.id} bout={b} index={i} pick={picks[b.id]}
          setPick={(p) => setPicks((s) => ({ ...s, [b.id]: p }))} />
      ))}

      <Text style={[T.tiny, st.foot]}>
        Points come from the DraftKings line — the longer the odds, the more a correct pick pays.
      </Text>
    </Page>
  );
}

/* ------------------------------------------------------------------- slip */

export function SlipScreen({ card, picks }) {
  const rows = card.bouts
    .map((b) => ({ bout: b, pick: picks[b.id] }))
    .filter((r) => r.pick?.fighterId);
  const total = potentialCard(picks, card.bouts);

  return (
    <Page>
      <View style={st.plain}>
        <Label>Your slip</Label>
        <Text style={[T.hero, { color: C.white, marginTop: S.sm }]}>
          {rows.length ? `${total} pts on the line` : "Nothing picked yet"}
        </Text>
        <Text style={[T.small, { color: C.muted, marginTop: S.xs }]}>
          {rows.length ? `${rows.length} of ${card.bouts.length} fights` : "Head to the card and back some fighters."}
        </Text>
      </View>

      {rows.map(({ bout, pick }) => {
        const f = bout.fighters.find((x) => String(x.id) === String(pick.fighterId));
        const method = METHODS.find((m) => m.id === pick.method);
        return (
          <View key={bout.id} style={st.slip}>
            {f?.headshot ? <Image source={{ uri: f.headshot }} style={st.slipShot} /> : <View style={st.slipShot} />}
            <View style={{ flex: 1, marginLeft: S.md }}>
              <Text numberOfLines={1} style={[T.name, { color: C.white }]}>{f?.name}</Text>
              <Text style={[T.tiny, { color: C.muted, marginTop: 2 }]}>
                {bout.weight ?? "Catchweight"}
                {f?.moneyLine != null ? ` · ${fmtLine(f.moneyLine)}` : ""}
                {method ? ` · ${method.label}` : " · any method"}
              </Text>
            </View>
            <Text style={[T.title, { color: C.teal }]}>{potential(pick, bout)}</Text>
          </View>
        );
      })}
    </Page>
  );
}

/* ---------------------------------------------------------------- profile */

export function ProfileScreen({ card, picks }) {
  const onTheLine = potentialCard(picks, card.bouts);
  const stats = [
    { k: "Points banked", v: "0", note: "after your first card" },
    { k: "On the line", v: String(onTheLine), note: card.shortName },
    { k: "Cards played", v: "0", note: "" },
  ];
  return (
    <Page>
      <LinearGradient
        colors={["rgba(139,92,246,0.24)", "transparent"]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={st.header}
      >
        <View style={st.avatar}>
          <LinearGradient colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill} />
          <Text style={{ fontSize: 26, fontWeight: "900", color: C.bg }}>M</Text>
        </View>
        <Text style={[T.title, { color: C.white, marginTop: S.md }]}>Your fighter</Text>
        <Text style={[T.small, { color: C.muted, marginTop: 2 }]}>Level 1 · Rookie</Text>
      </LinearGradient>

      <View style={st.statRow}>
        {stats.map((s) => (
          <View key={s.k} style={st.stat}>
            <Text style={[T.hero, { color: C.white }]}>{s.v}</Text>
            <Text style={[T.tiny, { color: C.muted, marginTop: 2, textAlign: "center" }]}>{s.k}</Text>
          </View>
        ))}
      </View>

      <View style={st.soon}>
        <Label>Coming</Label>
        <Text style={[T.body, { color: C.text, marginTop: S.sm }]}>
          Spend your points on a fighter and a home gym, then put them up against your mates.
        </Text>
        <Text style={[T.tiny, { color: C.faint, marginTop: S.sm }]}>
          Not built yet — the prediction game comes first.
        </Text>
      </View>
    </Page>
  );
}

const st = StyleSheet.create({
  header: { paddingTop: S.xxl + S.lg, paddingHorizontal: S.lg, paddingBottom: S.xl },
  plain: { paddingTop: S.xxl + S.lg, paddingHorizontal: S.lg, paddingBottom: S.md },
  track: { height: 6, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  fill: { height: "100%", borderRadius: R.pill },
  between: { flexDirection: "row", justifyContent: "space-between", marginTop: S.sm },
  foot: { color: C.faint, textAlign: "center", marginTop: S.lg, paddingHorizontal: S.xl, lineHeight: 17 },

  slip: {
    flexDirection: "row", alignItems: "center", marginHorizontal: S.lg, marginTop: S.sm,
    padding: S.md, backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.line,
  },
  slipShot: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.surfaceHi },

  avatar: { width: 76, height: 76, borderRadius: 26, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  statRow: { flexDirection: "row", marginHorizontal: S.lg, marginTop: S.lg, gap: S.sm },
  stat: {
    flex: 1, alignItems: "center", paddingVertical: S.lg, backgroundColor: C.surface,
    borderRadius: R.md, borderWidth: 1, borderColor: C.line,
  },
  soon: {
    marginHorizontal: S.lg, marginTop: S.lg, padding: S.lg,
    backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.line,
  },
});
