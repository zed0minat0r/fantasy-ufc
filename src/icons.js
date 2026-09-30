import { View } from "react-native";
import { C } from "./theme";

/** Icons drawn from Views, not an icon font.
 *  @expo/vector-icons pulls a .ttf that Expo's web export does not copy into the
 *  bundle - the live build 404'd on it and every tab showed an empty square. A
 *  tab bar is three shapes; it does not need a font. */
export function Icon({ name, on }) {
  const c = on ? C.teal : C.faint;
  const bar = (w, mt = 0) => (
    <View style={{ width: w, height: 2.5, borderRadius: 2, backgroundColor: c, marginTop: mt }} />
  );

  if (name === "card")
    return (
      <View style={{ width: 22, height: 20, alignItems: "center", justifyContent: "center" }}>
        <View style={{
          width: 20, height: 16, borderRadius: 4, borderWidth: 2, borderColor: c,
          alignItems: "center", justifyContent: "center",
        }}>
          <View style={{ width: 9, height: 2, borderRadius: 1, backgroundColor: c }} />
        </View>
      </View>
    );

  if (name === "slip")
    return (
      <View style={{ width: 22, height: 20, justifyContent: "center" }}>
        {bar(18)}{bar(18, 4)}{bar(11, 4)}
      </View>
    );

  // fighter: head and shoulders
  return (
    <View style={{ width: 22, height: 20, alignItems: "center", justifyContent: "flex-end" }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: c, marginBottom: 2 }} />
      <View style={{
        width: 16, height: 9, borderTopLeftRadius: 8, borderTopRightRadius: 8,
        borderWidth: 2, borderBottomWidth: 0, borderColor: c,
      }} />
    </View>
  );
}
