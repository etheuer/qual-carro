import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LINES, searchStations } from "../data.js";
import { COMMUTER_AT, LINE_ORDER } from "../lookup.js";
import { Icon } from "./Icon.js";
import { LineBullet } from "./LineBullet.js";
import { colors, font, radius } from "../theme.js";

function stationLines(st) {
  return st.lines
    .filter((lid) => LINE_ORDER[lid] || (COMMUTER_AT[st.id] || []).includes(lid))
    .slice(0, 4);
}

export function StationField({
  label,
  placeholder,
  optional = false,
  query,
  onChangeQuery,
  onPick,
  onFocus,
  onClear,
  focusOnClear = false,
  open,
  excludeId,
}) {
  const input = useRef(null);
  const [focused, setFocused] = useState(false);
  const typed = query.trim();
  let hits = open && typed ? searchStations(query).slice(0, 8) : [];
  if (excludeId) hits = hits.filter((s) => s.id !== excludeId);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}>opcional</Text> : null}
      </View>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          ref={input}
          value={query}
          onChangeText={onChangeQuery}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          onSubmitEditing={() => {
            if (hits[0]) onPick(hits[0].id);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          selectionColor={colors.enamel}
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          returnKeyType="search"
          accessibilityLabel={optional ? `${label}, opcional` : label}
          style={styles.input}
        />
        {query ? (
          <Pressable
            onPress={() => {
              onClear();
              if (focusOnClear) input.current?.focus();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Limpar ${label.toLowerCase()}`}
            style={styles.clear}
          >
            <Icon name="clear" size={20} color={colors.idleLine} />
          </Pressable>
        ) : null}
      </View>
      {open && typed ? (
        <View style={styles.list}>
          {hits.length ? (
            hits.map((st, i) => {
              const lines = stationLines(st);
              return (
                <Pressable
                  key={st.id}
                  onPress={() => onPick(st.id)}
                  style={({ pressed }) => [
                    styles.row,
                    i > 0 && styles.rowRule,
                    pressed && styles.rowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${st.name}, ${lines
                    .map((lid) => `linha ${LINES[lid].name}`)
                    .join(", ")}`}
                >
                  <Text style={styles.rowName}>{st.name}</Text>
                  <View style={styles.bullets}>
                    {lines.map((lid) => (
                      <LineBullet key={lid} lineId={lid} size={22} />
                    ))}
                  </View>
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.empty}>
              Nenhuma estação do metrô com “{typed}”.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  label: {
    color: colors.dust,
    fontFamily: font.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  optional: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  field: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.asphalt2,
  },
  fieldFocused: {
    borderColor: colors.focus,
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.enamel,
    fontFamily: font.semibold,
    fontSize: 20,
  },
  clear: {
    width: 48,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    overflow: "hidden",
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.asphalt2,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowRule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.asphalt3,
  },
  rowName: {
    flex: 1,
    color: colors.enamel,
    fontFamily: font.regular,
    fontSize: 17,
    lineHeight: 22,
  },
  bullets: {
    flexDirection: "row",
    gap: 4,
  },
  empty: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 20,
  },
});
