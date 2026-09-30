import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, S, T } from "./theme";

/** The splash. It is not a loading screen - the card is bundled, there is
 *  nothing to wait for - it is the moment the app introduces itself, so it
 *  holds for a beat and leaves. Tapping anywhere skips it. */
export default function Splash({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const out = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => {
      Animated.timing(out, { toValue: 0, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => finished && onDone());
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[st.wrap, { opacity: out }]} onTouchEnd={onDone}>
      <LinearGradient
        colors={["rgba(139,92,246,0.35)", "rgba(45,212,191,0.10)", "transparent"]}
        start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: "center" }}>
        <View style={st.badge}>
          <LinearGradient colors={[C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill} />
          <Text style={st.badgeText}>FU</Text>
        </View>
        <Text style={[T.hero, { color: C.white, marginTop: S.lg, letterSpacing: 2 }]}>FANTASY UFC</Text>
        <View style={st.rule}>
          <LinearGradient colors={["transparent", C.teal, "transparent"]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </View>
        <Text style={[T.small, { color: C.muted, marginTop: S.md, letterSpacing: 1 }]}>
          Call the card. Back the longshot.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", zIndex: 50 },
  badge: { width: 84, height: 84, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  badgeText: { fontSize: 30, fontWeight: "900", color: "#0A0712", letterSpacing: 1 },
  rule: { width: 160, height: 1, marginTop: S.lg, overflow: "hidden" },
});
