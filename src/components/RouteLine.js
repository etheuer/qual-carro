import { StyleSheet, Text, View } from "react-native";
import { LINES, STATION_NAMES } from "../data.js";
import { LineBullet } from "./LineBullet.js";
import { colors, font } from "../theme.js";

const NAME_LINE = 22;

function Stop({ stationId, above, below, note, last }) {
  const ring = last ? above : below && above ? colors.enamel : below || above;
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        {above ? <View style={[styles.barAbove, { backgroundColor: above }]} /> : null}
        {below ? <View style={[styles.barBelow, { backgroundColor: below }]} /> : null}
        <View style={[styles.node, { borderColor: ring }, last && { backgroundColor: ring }]} />
      </View>
      <View style={styles.stopText}>
        <Text style={styles.station}>{STATION_NAMES[stationId]}</Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
    </View>
  );
}

function Ride({ leg }) {
  const color = LINES[leg.lineId].color;
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.barFull, { backgroundColor: color }]} />
      </View>
      <View style={styles.ride}>
        <LineBullet lineId={leg.lineId} size={18} />
        <Text style={styles.rideText}>sentido {leg.direction}</Text>
      </View>
    </View>
  );
}

/** The trip as a metro-map strip: stops, rides, and where to change. */
export function RouteLine({ legs }) {
  const a11y = legs
    .map((leg, i) => {
      const from = i === 0 ? `De ${STATION_NAMES[leg.fromId]}, ` : "";
      const change = leg.transferTo ? `, troca pra ${LINES[leg.transferTo].name}` : "";
      return `${from}${LINES[leg.lineId].name} sentido ${leg.direction} até ${STATION_NAMES[leg.toId]}${change}`;
    })
    .join(". ");

  return (
    <View accessible accessibilityLabel={`${a11y}.`}>
      <Stop stationId={legs[0].fromId} below={LINES[legs[0].lineId].color} />
      {legs.map((leg, i) => {
        const next = legs[i + 1];
        return (
          <View key={`${leg.lineId}-${i}`}>
            <Ride leg={leg} />
            <Stop
              stationId={leg.toId}
              above={LINES[leg.lineId].color}
              below={next ? LINES[next.lineId].color : null}
              note={next ? `troca pra ${LINES[next.lineId].name}` : null}
              last={!next}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  rail: {
    width: 24,
    marginRight: 10,
  },
  barAbove: {
    position: "absolute",
    top: 0,
    height: NAME_LINE / 2,
    left: 10,
    width: 4,
  },
  barBelow: {
    position: "absolute",
    top: NAME_LINE / 2,
    bottom: 0,
    left: 10,
    width: 4,
  },
  barFull: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 10,
    width: 4,
  },
  node: {
    position: "absolute",
    top: NAME_LINE / 2 - 8,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3.5,
    backgroundColor: colors.asphalt,
  },
  stopText: {
    flex: 1,
  },
  station: {
    color: colors.enamel,
    fontFamily: font.semibold,
    fontSize: 17,
    lineHeight: NAME_LINE,
  },
  note: {
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 19,
  },
  ride: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  rideText: {
    flexShrink: 1,
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 19,
  },
});
