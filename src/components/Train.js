import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Polygon, Rect, Text as SvgText } from "react-native-svg";
import { LINES } from "../data.js";
import { colors } from "../theme.js";

export function Train({ carCount = 6, active = [], any = false, lineId, direction }) {
  const cars = Array.from({ length: carCount }, (_, i) => i + 1);
  const cabW = 16;
  const gap = 4;
  const pad = 8;
  const inner = 360 - pad * 2;
  const carW = (inner - cabW - gap * carCount) / carCount;
  const h = 72;
  const line = lineId && LINES[lineId];
  const onFill = line?.color ?? colors.idleLine;
  const onInk = line?.ink ?? colors.enamel;

  return (
    <View>
      <Svg viewBox={`0 0 360 ${h}`} width="100%" height={72} accessibilityLabel={`Trem de ${carCount} carros`}>
        <Polygon
          points={`${pad},20 ${pad + cabW},8 ${pad + cabW},${h - 8} ${pad},52`}
          fill={colors.enamel}
        />
        {cars.map((n, i) => {
          const x = pad + cabW + gap + i * (carW + gap);
          const on = any || active.includes(n);
          return (
            <Fragment key={n}>
              <Rect
                x={x}
                y={8}
                width={carW}
                height={h - 16}
                fill={on ? onFill : colors.carOff}
              />
              <SvgText
                x={x + carW / 2}
                y={52}
                textAnchor="middle"
                fill={on ? onInk : colors.carOffInk}
                fontSize="22"
                fontWeight="700"
                fontFamily="Archivo"
              >
                {String(n)}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>
      <View style={styles.front}>
        <View style={styles.nose} />
        <Text style={styles.frontText}>frente do trem · sentido {direction ?? "—"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  front: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  nose: {
    width: 22,
    height: 3,
    backgroundColor: colors.dust,
  },
  frontText: {
    color: colors.dust,
    fontSize: 14,
    fontFamily: "Archivo",
  },
});
