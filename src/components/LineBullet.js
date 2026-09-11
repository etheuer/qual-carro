import { StyleSheet, Text, View } from "react-native";
import { LINES } from "../data.js";
import { font } from "../theme.js";

/** Transit-style line bullet. Fixed size: it is a mark, not reading text. */
export function LineBullet({ lineId, size = 22 }) {
  const line = LINES[lineId];
  if (!line) return null;
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: line.color },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.num, { color: line.ink, fontSize: Math.round(size * 0.5) }]}
      >
        {line.short}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: "center",
    justifyContent: "center",
  },
  num: {
    fontFamily: font.bold,
    letterSpacing: -0.3,
  },
});
