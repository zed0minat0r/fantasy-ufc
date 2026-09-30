import { useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./theme";

/** Shown once, the first time the app opens. Three cards, because the loop is
 *  three things and anything longer does not get read. */
const STEPS = [
  {
    kicker: "Every fight, every card",
    title: "Call the card",
    body: "Pick who wins each fight, and how it ends — knockout, submission or decision. You can pick some fights and leave the rest.",
  },
  {
    kicker: "The odds decide the price",
    title: "Longshots pay more",
    body: "Points come straight off the real betting line. Backing a heavy favourite is worth a couple of points. Backing the underdog and being right is worth a lot more.",
  },
  {
    kicker: "What the points are for",
    title: "Build your fighter",
    body: "Points bank into your fighter. Spend them on who they are and what they can do — and later, put them up against your mates.",
  },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  const go = () => {
    if (last) return onDone();
    Animated.sequence([
      Animated.timing(slide, { toValue: -14, duration: 130, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    setTimeout(() => setI((n) => n + 1), 130);
  };

  return (
    <View style={st.wrap}>
      <View style={st.sheet}>
        <LinearGradient
          colors={["rgba(139,92,246,0.22)", "transparent"]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill}
        />
        <Animated.View style={{ transform: [{ translateX: slide }] }}>
          <Text style={[T.label, { color: C.teal }]}>{step.kicker}</Text>
          <Text style={[T.hero, { color: C.white, marginTop: S.sm }]}>{step.title}</Text>
          <Text style={[T.body, { color: C.muted, marginTop: S.md, lineHeight: 22 }]}>{step.body}</Text>
        </Animated.View>

        <View style={st.dots}>
          {STEPS.map((_, n) => (
            <View key={n} style={[st.dot, n === i && st.dotOn]} />
          ))}
          <View style={{ flex: 1 }} />
          {!last && (
            <Pressable onPress={onDone} hitSlop={10}>
              <Text style={[T.small, { color: C.faint }]}>Skip</Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={go} style={({ pressed }) => [st.cta, pressed && { opacity: 0.85 }]}>
          <LinearGradient colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill} />
          <Text style={[T.name, { color: "#0A0712" }]}>{last ? "Let's go" : "Next"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject, zIndex: 40,
    backgroundColor: "rgba(6,4,12,0.86)", justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    borderTopWidth: 1, borderColor: C.lineHi, padding: S.xl, paddingBottom: S.xxl + S.md,
    overflow: "hidden", maxWidth: 720, width: "100%", alignSelf: "center",
  },
  dots: { flexDirection: "row", alignItems: "center", marginTop: S.xl },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.line, marginRight: S.xs },
  dotOn: { width: 18, backgroundColor: C.teal },
  cta: {
    marginTop: S.lg, height: 52, borderRadius: R.pill,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
});
