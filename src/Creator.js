import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./theme";
import { BALD, PARTS, SWATCHES, avatarSvg, randomCharacter } from "./avatar";

const LABELS = { skinColor: "Skin", hairColor: "Hair colour", clothesColor: "Kit colour" };

/** Steppers rather than a grid of thumbnails. 45 hairstyles as a scrolling wall
 *  of previews means generating 45 avatars to draw one screen; arrows change one
 *  part at a time and the big preview is the only thing that has to render. */
function PartRow({ part, value, onChange }) {
  const list = part.options;
  const idx = Math.max(0, list.indexOf(value));
  const step = (d) => {
    if (part.optional) {
      // optional parts cycle through "none" as well
      const seq = [null, ...list];
      const at = seq.indexOf(value ?? null);
      onChange(seq[(at + d + seq.length) % seq.length]);
    } else {
      onChange(list[(idx + d + list.length) % list.length]);
    }
  };
  const shown = value === BALD ? "Shaved" : value ? `${idx + 1} of ${list.length}` : "None";
  return (
    <View style={st.row}>
      <Text style={[T.small, { color: C.text, width: 78 }]}>{part.label}</Text>
      <Pressable onPress={() => step(-1)} style={st.arrow} hitSlop={8}>
        <Text style={st.arrowText}>‹</Text>
      </Pressable>
      <Text style={[T.tiny, { color: value ? C.muted : C.faint, flex: 1, textAlign: "center" }]}>{shown}</Text>
      <Pressable onPress={() => step(1)} style={st.arrow} hitSlop={8}>
        <Text style={st.arrowText}>›</Text>
      </Pressable>
    </View>
  );
}

function SwatchRow({ name, value, onChange }) {
  return (
    <View style={st.swRow}>
      <Text style={[T.small, { color: C.text, width: 78 }]}>{LABELS[name]}</Text>
      <View style={st.swatches}>
        {SWATCHES[name].map((hex) => {
          const on = value === hex;
          return (
            <Pressable key={hex} onPress={() => onChange(hex)}
              style={[st.sw, { backgroundColor: `#${hex}` }, on && st.swOn]} />
          );
        })}
      </View>
    </View>
  );
}

export default function Creator({ character, setCharacter, onDone }) {
  const [draft, setDraft] = useState(character);
  const svg = useMemo(() => avatarSvg(draft, 168), [draft]);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <View style={st.wrap}>
      <ScrollView contentContainerStyle={st.page} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["rgba(139,92,246,0.26)", "rgba(45,212,191,0.08)", "transparent"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.head}
        >
          <Text style={[T.label, { color: C.faint }]}>Your fighter</Text>
          <Text style={[T.hero, { color: C.white, marginTop: S.xs }]}>Build your fighter</Text>

          <View style={st.plinth}>
            <SvgXml xml={svg} width={168} height={168} />
          </View>

          <Pressable onPress={() => setDraft(randomCharacter())} style={st.shuffle}>
            <Text style={[T.small, { color: C.teal }]}>Shuffle</Text>
          </Pressable>
        </LinearGradient>

        <View style={st.block}>
          {PARTS.map((p) => (
            <PartRow key={p.key} part={p} value={draft[p.key]} onChange={set(p.key)} />
          ))}
        </View>

        <View style={st.block}>
          {Object.keys(SWATCHES).map((k) => (
            <SwatchRow key={k} name={k} value={draft[k]} onChange={set(k)} />
          ))}
        </View>
      </ScrollView>

      <View style={st.footer}>
        <Pressable onPress={onDone} style={st.ghost}>
          <Text style={[T.small, { color: C.muted }]}>Cancel</Text>
        </Pressable>
        <Pressable onPress={() => { setCharacter(draft); onDone(); }} style={st.save}>
          <LinearGradient colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill} />
          <Text style={[T.name, { color: "#0A0712" }]}>Save fighter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, zIndex: 30 },
  page: { paddingBottom: 120, maxWidth: 720, width: "100%", alignSelf: "center" },
  head: { paddingTop: S.xxl + S.lg, paddingHorizontal: S.lg, paddingBottom: S.lg, alignItems: "center" },
  plinth: {
    marginTop: S.lg, width: 196, height: 196, borderRadius: R.lg,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.lineHi,
  },
  shuffle: {
    marginTop: S.md, paddingHorizontal: S.lg, paddingVertical: S.sm,
    borderRadius: R.pill, borderWidth: 1, borderColor: C.teal,
  },

  block: {
    marginHorizontal: S.lg, marginTop: S.md, paddingVertical: S.xs,
    backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.line,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: S.sm, paddingHorizontal: S.md },
  arrow: {
    width: 34, height: 30, borderRadius: R.sm, borderWidth: 1, borderColor: C.lineHi,
    alignItems: "center", justifyContent: "center",
  },
  arrowText: { color: C.text, fontSize: 19, lineHeight: 21, fontWeight: "700" },

  swRow: { flexDirection: "row", alignItems: "center", paddingVertical: S.sm, paddingHorizontal: S.md },
  swatches: { flexDirection: "row", flexWrap: "wrap", flex: 1, gap: S.xs },
  sw: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "transparent" },
  swOn: { borderColor: C.white },

  footer: {
    position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row",
    padding: S.lg, paddingBottom: S.xxl, gap: S.sm, backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.line, maxWidth: 720, width: "100%", alignSelf: "center",
  },
  ghost: {
    paddingHorizontal: S.xl, height: 50, borderRadius: R.pill,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.lineHi,
  },
  save: {
    flex: 1, height: 50, borderRadius: R.pill, alignItems: "center",
    justifyContent: "center", overflow: "hidden",
  },
});
