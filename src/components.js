import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./theme";
import { METHODS, pickPoints, winnerPoints } from "./scoring";

export const Label = ({ children, style }) => (
  <Text style={[T.label, { color: C.faint }, style]}>{children}</Text>
);

export const fmtLine = (ml) => (ml == null ? null : `${ml > 0 ? "+" : ""}${ml}`);

/** One fighter, tappable. The selected state is a purple wash and a lit border
 *  rather than a tick, so on a card of fourteen you can see what you have done
 *  by glancing rather than reading. The moneyline and what the pick pays sit
 *  right on the tile - the whole point of the game is the price. */
export function Fighter({ f, picked, onPick, side }) {
  const pays = winnerPoints(f);
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
            <Text style={[T.title, { color: C.faint }]}>{(f.name || "?").slice(0, 1)}</Text>
          </View>
        )}
        {f.flag ? <Image source={{ uri: f.flag }} style={st.flag} /> : null}
      </View>

      <Text numberOfLines={2} style={[T.name, st.fname, { color: picked ? C.white : C.text }]}>
        {f.name}
      </Text>

      <View style={st.priceRow}>
        {f.moneyLine != null && (
          <Text style={[T.tiny, { color: f.moneyLine > 0 ? C.teal : C.muted }]}>
            {fmtLine(f.moneyLine)}
          </Text>
        )}
        <Text style={[T.tiny, { color: C.faint }]}>{f.record ?? ""}</Text>
      </View>

      <View style={[st.pays, picked && { backgroundColor: C.purpleDim, borderColor: C.purpleHi }]}>
        <Text style={[T.tiny, { color: picked ? C.purpleHi : C.faint }]}>{pays} pts</Text>
      </View>
    </Pressable>
  );
}

/** The method row only appears once a fighter is chosen: asking how a fight
 *  ends before asking who wins is a question with no meaning yet. */
export function Methods({ fighter, value, onChange }) {
  return (
    <View style={st.methods}>
      {METHODS.map((m) => {
        const on = value === m.id;
        return (
          <Pressable key={m.id} onPress={() => onChange(on ? null : m.id)}
            style={[st.chip, on && st.chipOn]}>
            <Text style={[T.tiny, { color: on ? C.bg : C.muted, letterSpacing: 0.8 }]}>{m.short}</Text>
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Text style={[T.small, { color: value ? C.teal : C.faint }]}>
        {pickPoints(fighter, value)} pts
      </Text>
    </View>
  );
}

/** Section header for a card segment. Shows when that part starts and how many
 *  of its fights are picked, so progress is legible per segment rather than one
 *  number for fourteen fights. */
export function SegmentHead({ title, startsAt, made, total }) {
  const t = startsAt
    ? new Date(startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;
  return (
    <View style={st.segment}>
      <View style={st.segDot} />
      <Text style={[T.label, { color: C.text }]}>{title}</Text>
      <View style={{ flex: 1 }} />
      {t ? <Text style={[T.tiny, { color: C.faint, marginRight: S.sm }]}>{t}</Text> : null}
      <Text style={[T.tiny, { color: made === total ? C.teal : C.faint }]}>{made}/{total}</Text>
    </View>
  );
}

export function Bout({ bout, index, pick, setPick }) {
  const [a, b] = bout.fighters;
  const main = index === 0;
  const chosen = pick?.fighterId
    ? bout.fighters.find((f) => String(f.id) === String(pick.fighterId))
    : null;
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

      {chosen ? (
        <Methods fighter={chosen} value={pick.method}
          onChange={(m) => setPick({ ...pick, method: m })} />
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  segment: {
    flexDirection: "row", alignItems: "center",
    marginTop: S.xl, marginBottom: S.xs, marginHorizontal: S.lg,
    paddingBottom: S.sm, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  segDot: { width: 4, height: 14, borderRadius: 2, backgroundColor: C.purple, marginRight: S.sm },

  bout: {
    marginHorizontal: S.lg, marginTop: S.sm, padding: S.md,
    backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.line,
  },
  boutMain: { borderColor: "rgba(45,212,191,0.28)", backgroundColor: C.surfaceHi },
  boutHead: { flexDirection: "row", alignItems: "center", marginBottom: S.sm },
  mainTag: { marginLeft: S.sm, paddingHorizontal: S.sm, paddingVertical: 3, borderRadius: R.pill, backgroundColor: C.tealDim },

  row: { flexDirection: "row", alignItems: "stretch" },
  vsWrap: { width: 30, alignItems: "center", justifyContent: "center" },

  fighter: {
    flex: 1, alignItems: "center", paddingVertical: S.sm, paddingHorizontal: S.sm,
    borderRadius: R.md, borderWidth: 1, borderColor: C.line,
    backgroundColor: "rgba(255,255,255,0.02)", overflow: "hidden",
  },
  fighterOn: { borderColor: C.purpleHi, backgroundColor: "rgba(139,92,246,0.10)" },
  fname: { textAlign: "center", minHeight: 34, lineHeight: 17 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: S.sm, marginTop: 2 },
  pays: {
    marginTop: S.sm, paddingHorizontal: S.sm, paddingVertical: 3,
    borderRadius: R.pill, borderWidth: 1, borderColor: C.line,
  },

  shotWrap: { width: 54, height: 54, marginBottom: S.xs },
  shot: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.surfaceHi },
  shotEmpty: { alignItems: "center", justifyContent: "center" },
  flag: { position: "absolute", right: -2, bottom: -2, width: 19, height: 13, borderRadius: 3, borderWidth: 1, borderColor: C.bg },

  methods: { flexDirection: "row", alignItems: "center", marginTop: S.sm },
  chip: { paddingHorizontal: S.md, paddingVertical: 7, borderRadius: R.pill, borderWidth: 1, borderColor: C.lineHi, marginRight: S.xs },
  chipOn: { backgroundColor: C.teal, borderColor: C.teal },
});
