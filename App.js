import { useState } from "react";
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, R, S, T } from "./src/theme";
import Splash from "./src/Splash";
import { CardScreen, SlipScreen, ProfileScreen } from "./src/screens";
import card from "./data/event.json";

const TABS = [
  { id: "card", label: "Card", icon: "flame" },
  { id: "slip", label: "My Slip", icon: "list" },
  { id: "me", label: "Fighter", icon: "person" },
];

export default function App() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState("card");
  // Picks live here so they survive moving between tabs. Next job is making
  // them survive closing the app, which means accounts and a backend.
  const [picks, setPicks] = useState({});

  return (
    <View style={st.app}>
      <StatusBar barStyle="light-content" />

      {tab === "card" && <CardScreen card={card} picks={picks} setPicks={setPicks} />}
      {tab === "slip" && <SlipScreen card={card} picks={picks} />}
      {tab === "me" && <ProfileScreen card={card} picks={picks} />}

      <View style={st.tabs}>
        <LinearGradient
          colors={["transparent", "rgba(10,7,18,0.92)", C.bg]}
          style={StyleSheet.absoluteFill} pointerEvents="none"
        />
        <View style={st.tabRow}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={st.tab}>
                <Ionicons name={on ? t.icon : `${t.icon}-outline`} size={21}
                  color={on ? C.teal : C.faint} />
                <Text style={[T.tiny, { color: on ? C.white : C.faint, marginTop: 3 }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {splash && <Splash onDone={() => setSplash(false)} />}
    </View>
  );
}

const st = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg },
  tabs: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: S.xl },
  tabRow: {
    flexDirection: "row", paddingBottom: Platform.OS === "web" ? S.lg : S.xxl,
    paddingTop: S.sm, maxWidth: 720, width: "100%", alignSelf: "center",
    borderTopWidth: 1, borderTopColor: C.line,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: S.xs },
});
