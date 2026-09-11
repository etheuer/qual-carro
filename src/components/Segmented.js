import { Fragment } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LineBullet } from "./LineBullet.js";
import { colors, font, radius } from "../theme.js";

/**
 * One choice out of a few, iOS segmented-control style.
 * options: [{ value, label, lineId?, a11y? }]
 * tall: two-line labels (terminal names) instead of shrinking to one line.
 */
export function Segmented({ options, value, onChange, tall = false }) {
  return (
    <View style={styles.track}>
      {options.map((opt, i) => {
        const on = opt.value === value;
        const divided = i > 0 && !on && options[i - 1].value !== value;
        return (
          <Fragment key={opt.value}>
            {i > 0 ? <View style={[styles.divider, divided && styles.dividerOn]} /> : null}
            <Pressable
              onPress={() => onChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={opt.a11y || opt.label}
              style={({ pressed }) => [
                styles.seg,
                tall && styles.segTall,
                pressed && !on && styles.segPressed,
                on && styles.segOn,
              ]}
            >
              {opt.lineId ? <LineBullet lineId={opt.lineId} size={20} /> : null}
              <Text
                style={[styles.label, on && styles.labelOn]}
                numberOfLines={tall ? 2 : 1}
                adjustsFontSizeToFit={!tall}
                minimumFontScale={0.8}
              >
                {opt.label}
              </Text>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    borderRadius: radius.control,
    backgroundColor: colors.asphalt2,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: 1,
  },
  dividerOn: {
    backgroundColor: colors.border,
  },
  seg: {
    flex: 1,
    alignSelf: "stretch",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: radius.segment,
  },
  segTall: {
    minHeight: 54,
  },
  segPressed: {
    backgroundColor: colors.asphalt3,
  },
  segOn: {
    backgroundColor: colors.enamel,
  },
  label: {
    flexShrink: 1,
    color: colors.enamel,
    fontFamily: font.semibold,
    fontSize: 15,
    lineHeight: 19,
    textAlign: "center",
  },
  labelOn: {
    color: colors.ink,
  },
});
