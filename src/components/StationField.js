import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LINES } from "../data.js";
import { COMMUTER_AT, LINE_ORDER, lineColor, lineInk } from "../lookup.js";
import { searchStations } from "../data.js";
import { colors } from "../theme.js";

export function StationField({
  label,
  placeholder,
  query,
  onChangeQuery,
  onPick,
  onFocus,
  open,
  excludeId,
  showClear,
  onClear,
}) {
  let hits =
    open && query.trim()
      ? searchStations(query).slice(0, 8)
      : [];
  if (excludeId) hits = hits.filter((s) => s.id !== excludeId);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="none"
          accessibilityLabel={label}
          style={styles.input}
        />
        {showClear ? (
          <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
            <Text style={styles.clear}>limpar</Text>
          </Pressable>
        ) : null}
      </View>
      {open && hits.length > 0 ? (
        <View style={styles.list}>
          {hits.map((st) => {
            const chips = st.lines
              .filter((lid) => LINE_ORDER[lid] || (COMMUTER_AT[st.id] || []).includes(lid))
              .slice(0, 4);
            return (
              <Pressable
                key={st.id}
                onPress={() => onPick(st.id)}
                style={styles.suggest}
                accessibilityRole="button"
                accessibilityLabel={st.name}
              >
                <Text style={styles.suggestName}>{st.name}</Text>
                <View style={styles.chips}>
                  {chips.map((lid) => (
                    <View
                      key={lid}
                      style={[styles.chip, { backgroundColor: lineColor(lid) }]}
                    >
                      <Text style={[styles.chipText, { color: lineInk(lid) }]}>
                        {LINES[lid].short}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
  },
  label: {
    color: colors.dust,
    fontSize: 15,
    fontFamily: "Archivo",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "rgba(243,234,220,0.28)",
  },
  input: {
    flex: 1,
    color: colors.enamel,
    fontSize: 20,
    fontFamily: "Archivo_600SemiBold",
    paddingVertical: 8,
    paddingRight: 8,
  },
  clear: {
    color: colors.dust,
    fontSize: 14,
    fontFamily: "Archivo",
    padding: 6,
  },
  list: {
    backgroundColor: colors.asphalt2,
    borderWidth: 1,
    borderColor: "rgba(243,234,220,0.12)",
    marginTop: 4,
  },
  suggest: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  suggestName: {
    color: colors.enamel,
    fontSize: 16,
    fontFamily: "Archivo",
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    gap: 4,
  },
  chip: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    fontSize: 11,
    fontFamily: "Archivo_700Bold",
  },
});
