import { useMemo, useState } from "react";
import {
  Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./src/theme";
import { METHODS, POINTS, potential } from "./src/scoring";
import card from "./data/event.json";

/* ------------------------------------------------------------------ helpers */

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
};

function countdown(iso) {
  const ms = Date.parse(iso) - Date.now();
  if (ms <= 0) return "Live";
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

/* -------------------------------------------------------------------- bits */

const Label = ({ children, style }) => (
  <Text style={[T.label, { color: C.faint }, style]}>{children}</Text>
);

/** One fighter, tappable. Selected state is a purple wash plus a lit border -
 *  not a tick - so the whole tile reads as chosen at a glance on a card of 14. */
function Fighter({ f, picked, onPick, side }) {
  return (
    <Pressable
      onPress={onPick}
      style={({ pressed }) => [
        st.fighter,
        side === "left" ? { marginRight: S.xs } : { marginLeft: S.xs },
        picked && st.fighterOn,
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      {picked && (
        <LinearGradient
          colors={["rgba(139,92,246,0.30)", "rgba(139,92,246,0.04)"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        />
      )}
      <View style={st.shotWrap}>
        {f.headshot ? (
          <Image source={{ uri: f.headshot }} style={st.shot} resizeMode="cover" />
        ) : (
          <View style={[st.shot, st.shotEmpty]}>
            <Text style={{ color: C.faint, ...T.title }}>
              {(f.name || "?").slice(0, 1)}
            </Text>
          </View>
        )}
        {f.flag ? <Image source={{ uri: f.flag }} style={st.flag} /> : null}
      </View>

      {/* two lines, not an ellipsis: "Deiveson Figuei..." is not a fighter.
          minHeight keeps the two tiles level when one name wraps and one does not. */}
      <Text numberOfLines={2} style={[T.name, st.fname, { color: picked ? C.white : C.text }]}>
        {f.name}
      </Text>
      {f.record ? <Text style={[T.tiny, { color: C.muted, marginTop: 2 }]}>{f.record}</Text> : null}
    </Pressable>
  );
}

/** The method row only appears once a fighter is chosen: asking for a method
 *  before a fighter is asking a question that has no meaning yet. */
function Methods({ value, onChange }) {
  return (
    <View style={st.methods}>
      {METHODS.map((m) => {
        const on = value === m.id;
        return (
          <Pressable key={m.id} onPress={() => onChange(on ? null : m.id)}
            style={[st.chip, on && st.chipOn]}>
            <Text style={[T.tiny, { color: on ? C.bg : C.muted, letterSpacing: 0.8 }]}>
              {m.short}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Text style={[T.tiny, { color: value ? C.teal : C.faint }]}>
        {value ? `+${POINTS.method} if it lands` : `+${POINTS.winner} for the win`}
      </Text>
    </View>
  );
}

function Bout({ bout, index, pick, setPick }) {
  const [a, b] = bout.fighters;
  const main = index === 0;
  return (
    <View style={[st.bout, main && st.boutMain]}>
      <View style={st.boutHead}>
        <Label>{bout.weight ?? "Catchweight"}</Label>
        {main && (
          <View style={st.mainTag}>
            <Text style={[T.tiny, { color: C.teal, letterSpacing: 1.2 }]}>MAIN EVENT</Text>
          </View>
        )}
      </View>

      <View style={st.row}>
        <Fighter f={a} side="left" picked={pick?.fighterId === a.id}
          onPick={() => setPick(a.id === pick?.fighterId ? null : { fighterId: a.id, method: pick?.method ?? null })} />
        <View style={st.vsWrap}><Text style={[T.tiny, { color: C.faint }]}>VS</Text></View>
        <Fighter f={b} side="right" picked={pick?.fighterId === b.id}
          onPick={() => setPick(b.id === pick?.fighterId ? null : { fighterId: b.id, method: pick?.method ?? null })} />
      </View>

      {pick?.fighterId ? (
        <Methods value={pick.method} onChange={(m) => setPick({ ...pick, method: m })} />
      ) : null}
    </View>
  );
}

/* -------------------------------------------------------------------- app */

export default function App() {
  const [picks, setPicks] = useState({});
  const { width } = useWindowDimensions();

  const made = Object.values(picks).filter((p) => p?.fighterId).length;
  const max = useMemo(
    () => Object.values(picks).reduce((n, p) => n + potential(p), 0),
    [picks]
  );
  const pct = card.bouts.length ? made / card.bouts.length : 0;

  return (
    <View style={st.app}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: S.xxl * 2, maxWidth: 720, width: "100%", alignSelf: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <LinearGradient
          colors={["rgba(139,92,246,0.28)", "rgba(45,212,191,0.10)", "transparent"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={st.header}
        >
          <Label>{countdown(card.date) === "Live" ? "Happening now" : `Locks in ${countdown(card.date)}`}</Label>
          <Text style={[T.hero, { color: C.white, marginTop: S.sm }]}>{card.name}</Text>
          <Text style={[T.small, { color: C.muted, marginTop: S.xs }]}>
            {fmtDate(card.date)}{card.venue ? ` · ${card.venue}` : ""}
          </Text>

          <View style={st.meter}>
            <View style={st.meterTrack}>
              <LinearGradient
                colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[st.meterFill, { width: `${Math.round(pct * 100)}%` }]}
              />
            </View>
            <View style={st.meterRow}>
              <Text style={[T.small, { color: C.text }]}>
                {made} of {card.bouts.length} picked
              </Text>
              <Text style={[T.small, { color: C.teal }]}>{max} pts on the line</Text>
            </View>
          </View>
        </LinearGradient>

        {card.bouts.map((b, i) => (
          <Bout key={b.id} bout={b} index={i} pick={picks[b.id]}
            setPick={(p) => setPicks((s) => ({ ...s, [b.id]: p }))} />
        ))}

        <Text style={[T.tiny, { color: C.faint, textAlign: "center", marginTop: S.lg, paddingHorizontal: S.xl }]}>
          Correct fighter {POINTS.winner} pts · correct fighter and method {POINTS.method} pts
        </Text>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ styles */

const st = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg },

  header: { paddingTop: S.xxl + S.xl, paddingHorizontal: S.lg, paddingBottom: S.xl },
  meter: { marginTop: S.xl },
  meterTrack: { height: 6, borderRadius: R.pill, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: R.pill },
  meterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: S.sm },

  bout: {
    marginHorizontal: S.lg, marginTop: S.md, padding: S.md,
    backgroundColor: C.surface, borderRadius: R.lg,
    borderWidth: 1, borderColor: C.line,
  },
  boutMain: { borderColor: "rgba(45,212,191,0.28)", backgroundColor: C.surfaceHi },
  boutHead: { flexDirection: "row", alignItems: "center", marginBottom: S.md },
  mainTag: {
    marginLeft: S.sm, paddingHorizontal: S.sm, paddingVertical: 3,
    borderRadius: R.pill, backgroundColor: C.tealDim,
  },

  row: { flexDirection: "row", alignItems: "stretch" },
  vsWrap: { width: 30, alignItems: "center", justifyContent: "center" },

  fighter: {
    flex: 1, alignItems: "center", paddingVertical: S.md, paddingHorizontal: S.sm,
    borderRadius: R.md, borderWidth: 1, borderColor: C.line,
    backgroundColor: "rgba(255,255,255,0.02)", overflow: "hidden",
  },
  fighterOn: { borderColor: C.purpleHi, backgroundColor: "rgba(139,92,246,0.10)" },

  fname: { textAlign: "center", minHeight: 38, lineHeight: 19 },
  shotWrap: { width: 68, height: 68, marginBottom: S.sm },
  shot: { width: 68, height: 68, borderRadius: 34, backgroundColor: C.surfaceHi },
  shotEmpty: { alignItems: "center", justifyContent: "center" },
  flag: {
    position: "absolute", right: -2, bottom: -2, width: 22, height: 15,
    borderRadius: 3, borderWidth: 1, borderColor: C.bg,
  },

  methods: { flexDirection: "row", alignItems: "center", marginTop: S.md, gap: S.xs },
  chip: {
    paddingHorizontal: S.md, paddingVertical: 7, borderRadius: R.pill,
    borderWidth: 1, borderColor: C.lineHi, marginRight: S.xs,
  },
  chipOn: { backgroundColor: C.teal, borderColor: C.teal },
});
