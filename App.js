import { useState } from "react";
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { Icon } from "./src/icons";
import { C, R, S, T } from "./src/theme";
import Splash from "./src/Splash";
import Onboarding from "./src/Onboarding";
import Creator from "./src/Creator";
import { DEFAULT_CHARACTER } from "./src/avatar";
import { CardScreen, SlipScreen, ProfileScreen } from "./src/screens";
import card from "./data/event.json";

const TABS = [
  { id: "card", label: "Card", icon: "card" },
  { id: "slip", label: "My Slip", icon: "slip" },
  { id: "me", label: "Fighter", icon: "fighter" },
];

export default function App() {
  const [splash, setSplash] = useState(true);
  // Shown once on first open. Once there are accounts this becomes a stored
  // flag rather than component state.
  const [onboard, setOnboard] = useState(true);
  const [creator, setCreator] = useState(false);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [tab, setTab] = useState("card");
  // Picks live here so they survive moving between tabs. Next job is making
  // them survive closing the app, which means accounts and a backend.
  const [picks, setPicks] = useState({});

  return (
    <View style={st.app}>
      <StatusBar barStyle="light-content" />

      {tab === "card" && <CardScreen card={card} picks={picks} setPicks={setPicks} />}
      {tab === "slip" && <SlipScreen card={card} picks={picks} />}
      {tab === "me" && (
        <ProfileScreen card={card} picks={picks} character={character}
          onEdit={() => setCreator(true)} />
      )}

      <View style={st.tabs}>
        <View style={st.tabRow}>
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={st.tab}>
                <Icon name={t.icon} on={on} />
                <Text style={[T.tiny, { color: on ? C.white : C.faint, marginTop: 3 }]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {creator && (
        <Creator character={character} setCharacter={setCharacter}
          onDone={() => setCreator(false)} />
      )}
      {!splash && onboard && <Onboarding onDone={() => setOnboard(false)} />}
      {splash && <Splash onDone={() => setSplash(false)} />}
    </View>
  );
}

const st = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.bg },
  // solid, not a gradient wash: fighters were showing through the bar
  tabs: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: C.bg },
  tabRow: {
    flexDirection: "row", paddingBottom: Platform.OS === "web" ? S.lg : S.xxl,
    paddingTop: S.sm, maxWidth: 720, width: "100%", alignSelf: "center",
    borderTopWidth: 1, borderTopColor: C.line,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: S.xs },
});
