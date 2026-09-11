import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { LINES } from "../data.js";
import { formatCars } from "../lookup.js";
import { Icon } from "./Icon.js";
import { colors, font } from "../theme.js";

const W = 360;
const H = 72;
const PAD = 2;
const CAB = 18;
const GAP = 4;

function describe(carCount, active, any) {
  if (any) return `Trem de ${carCount} carros. Qualquer carro serve.`;
  if (active.length) {
    const cars = formatCars(active, false);
    return `Trem de ${carCount} carros. Entre ${cars.startsWith("carros") ? "nos" : "no"} ${cars}.`;
  }
  return `Trem de ${carCount} carros. Carro 1 é a frente.`;
}

export function Train({ carCount = 6, active = [], any = false, lineId, direction }) {
  const cars = Array.from({ length: carCount }, (_, i) => i + 1);
  const carW = (W - PAD * 2 - CAB - GAP * carCount) / carCount;
  const line = lineId && LINES[lineId];
  const onFill = line?.color ?? colors.idleLine;
  const onInk = line?.ink ?? colors.enamel;
  const nose = PAD + CAB;
  const top = 6;
  const bottom = H - 6;

  return (
    <View accessible accessibilityLabel={describe(carCount, active, any)}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <Path
          d={`M${nose} ${top} L${nose} ${bottom} L${PAD + 7} ${bottom - 6} Q${PAD} ${bottom - 9} ${PAD} ${bottom - 17} L${PAD} ${top + 17} Q${PAD} ${top + 9} ${PAD + 7} ${top + 6} Z`}
          fill={colors.enamel}
        />
        {cars.map((n, i) => {
          const x = nose + GAP + i * (carW + GAP);
          const on = any || active.includes(n);
          return (
            <Fragment key={n}>
              <Rect
                x={x}
                y={top}
                width={carW}
                height={bottom - top}
                rx={5}
                fill={on ? onFill : colors.carOff}
              />
              <SvgText
                x={x + carW / 2}
                y={H / 2 + 8}
                textAnchor="middle"
                fill={on ? onInk : colors.carOffInk}
                fontSize="22"
                fontFamily={font.bold}
              >
                {String(n)}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>
      <View style={styles.front} importantForAccessibility="no-hide-descendants">
        <Icon name="arrowLeft" size={16} color={colors.dust} />
        <Text style={styles.frontText}>
          {direction ? `Carro 1 é a frente · sentido ${direction}` : "Carro 1 é a frente do trem"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  front: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  frontText: {
    flexShrink: 1,
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 18,
  },
});
