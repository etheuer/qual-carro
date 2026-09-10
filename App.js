import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from "@expo-google-fonts/archivo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LINES, STATION_NAMES } from "./src/data.js";
import {
  adviceKey,
  currentAdvice,
  formatCars,
  intentPhrase,
  lineColor,
  lineInk,
  metroLines,
  stationTitle,
  transferOptions,
} from "./src/lookup.js";
import { zoneLabel, zoneToCars } from "./src/cells.js";
import {
  MARKS_KEY,
  lastZone,
  normalizeStore,
  publishedFromMarks,
  setMark,
} from "./src/marks.js";
import { fetchReports, postReport } from "./src/sync.js";
import { Train } from "./src/components/Train.js";
import { StationField } from "./src/components/StationField.js";
import { colors } from "./src/theme.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Archivo: Archivo_400Regular,
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
  });

  const [destId, setDestId] = useState(null);
  const [originId, setOriginId] = useState(null);
  const [destQuery, setDestQuery] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destOpen, setDestOpen] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [lineId, setLineId] = useState(null);
  const [direction, setDirection] = useState(null);
  const [intent, setIntent] = useState("escada");
  const [transferTo, setTransferTo] = useState(null);
  const [marks, setMarks] = useState({});
  const [remotePublished, setRemotePublished] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(MARKS_KEY).then((raw) => {
      if (!raw) return;
      const next = normalizeStore(JSON.parse(raw));
      setMarks(next);
      AsyncStorage.setItem(MARKS_KEY, JSON.stringify(next));
    });
    fetchReports().then((snap) => {
      if (snap?.published) setRemotePublished(snap.published);
    });
  }, []);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      setDestOpen(false);
      setOriginOpen(false);
    });
    return () => sub.remove();
  }, []);

  const published = useMemo(
    () => ({ ...publishedFromMarks(marks), ...remotePublished }),
    [marks, remotePublished]
  );
  const adv = useMemo(
    () =>
      currentAdvice({ destId, originId, lineId, direction, intent, transferTo, published }),
    [destId, originId, lineId, direction, intent, transferTo, published]
  );

  const routed = Boolean(adv?.routed);
  const activeLineId = adv?.lineId || lineId;
  const line = activeLineId ? LINES[activeLineId] : null;
  const stripe = line?.color ?? colors.idleLine;
  const picking = destOpen || originOpen;

  useEffect(() => {
    if (routed && adv?.lineId) {
      setLineId(adv.lineId);
      setDirection(adv.direction);
    }
  }, [routed, adv?.lineId, adv?.direction]);

  useEffect(() => {
    if (!destId || routed) return;
    const next = metroLines(destId);
    if (!next.length) return;
    if (!lineId || !next.includes(lineId)) {
      setLineId(next[0]);
      setDirection(null);
      setIntent("escada");
      setTransferTo(null);
    }
  }, [destId, lineId, routed]);

  const lines = destId && !routed ? metroLines(destId) : [];
  const transfers = destId && lineId && !routed ? transferOptions(destId, lineId) : [];

  useEffect(() => {
    if (intent === "transfer" && transfers.length && !transfers.includes(transferTo)) {
      setTransferTo(transfers[0]);
    }
  }, [intent, transfers, transferTo]);

  function pickDest(id) {
    setDestId(id);
    setDestQuery(STATION_NAMES[id]);
    setDestOpen(false);
    setLineId(null);
    setDirection(null);
    setIntent("escada");
    setTransferTo(null);
    Keyboard.dismiss();
  }

  function pickOrigin(id) {
    setOriginId(id);
    setOriginQuery(STATION_NAMES[id]);
    setOriginOpen(false);
    Keyboard.dismiss();
  }

  async function saveMark(zone) {
    if (!adv || adv.error || adv.need) return;
    const next = setMark(marks, adviceKey(adv), zone);
    setMarks(next);
    await AsyncStorage.setItem(MARKS_KEY, JSON.stringify(next));
    const snap = await postReport(adviceKey(adv), zone);
    if (snap?.published) setRemotePublished(snap.published);
  }

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  const myZone =
    adv && !adv.error && !adv.need ? lastZone(marks[adviceKey(adv)]) : null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[hexAlpha(stripe, 0.35), colors.asphalt]}
        style={styles.wash}
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={[styles.stripe, { backgroundColor: stripe }]} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
          >
            <Text style={[styles.title, destId && styles.titleOn]}>Qual carro?</Text>
            {!destId ? (
              <Text style={styles.lede}>
                Metrô de São Paulo. Entra no carro certo pra não atravessar a plataforma inteira.
              </Text>
            ) : null}

            <StationField
              label="Onde você desce"
              placeholder="Sé, Luz, Paraíso…"
              query={destQuery}
              onChangeQuery={(t) => {
                setDestQuery(t);
                setDestId(null);
                setDestOpen(true);
              }}
              onFocus={() => {
                setDestOpen(true);
                setOriginOpen(false);
              }}
              onPick={pickDest}
              open={destOpen}
              excludeId={originId}
            />

            <StationField
              label="De onde sobe"
              placeholder="opcional"
              query={originQuery}
              onChangeQuery={(t) => {
                setOriginQuery(t);
                if (!t.trim()) {
                  setOriginId(null);
                  setOriginOpen(true);
                  return;
                }
                setOriginId(null);
                setOriginOpen(true);
              }}
              onFocus={() => {
                setOriginOpen(true);
                setDestOpen(false);
              }}
              onPick={pickOrigin}
              open={originOpen}
              excludeId={destId}
              showClear={Boolean(originId || originQuery)}
              onClear={() => {
                setOriginId(null);
                setOriginQuery("");
                setOriginOpen(false);
              }}
            />

            {routed ? (
              <View style={styles.block}>
                {adv.path.legs.map((leg, idx) => {
                  const ln = LINES[leg.lineId];
                  const extra = leg.transferTo
                    ? `  troca pra ${LINES[leg.transferTo].name} em ${stationTitle(leg.transferAt)}`
                    : "";
                  return (
                    <View key={`${leg.lineId}-${idx}`} style={styles.leg}>
                      <View style={[styles.mini, { backgroundColor: ln.color }]}>
                        <Text style={[styles.miniText, { color: ln.ink }]}>{ln.short}</Text>
                      </View>
                      <Text style={styles.legText}>
                        {stationTitle(leg.fromId)} → {stationTitle(leg.toId)}
                        <Text style={styles.muted}>
                          {" "}
                          sentido {leg.direction}
                          {extra}
                        </Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : destId && lines.length ? (
              <View style={styles.block}>
                {lines.length > 1 ? (
                  <View style={styles.wrapRow}>
                    {lines.map((id) => {
                      const on = lineId === id;
                      return (
                        <Pressable
                          key={id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          onPress={() => {
                            setLineId(id);
                            setDirection(null);
                            setIntent("escada");
                          }}
                          style={[
                            styles.chipBtn,
                            on && { backgroundColor: lineColor(id), borderColor: lineColor(id) },
                          ]}
                        >
                          <Text style={[styles.chipBtnText, on && { color: lineInk(id) }]}>
                            {LINES[id].short} {LINES[id].name.replace(/^\d+-/, "")}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : line ? (
                  <View style={styles.leg}>
                    <View style={[styles.mini, { backgroundColor: line.color }]}>
                      <Text style={[styles.miniText, { color: line.ink }]}>{line.short}</Text>
                    </View>
                    <Text style={styles.legText}>{line.name}</Text>
                  </View>
                ) : null}
                {line ? (
                  <View style={styles.dirRow}>
                    {line.terminals.map((t) => {
                      const on = direction === t;
                      return (
                        <Pressable
                          key={t}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          onPress={() => setDirection(t)}
                          style={[styles.dir, on && styles.onLight]}
                        >
                          <Text style={[styles.dirLabel, on && styles.onLightText]}>sentido</Text>
                          <Text style={[styles.dirName, on && styles.onLightText]}>{t}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ) : null}

            {destId && lineId && !routed ? (
              <View style={styles.block}>
                <View style={styles.intentRow}>
                  {[
                    ["escada", "Escada"],
                    ["saida", "Saída"],
                    ...(transfers.length ? [["transfer", "Integração"]] : []),
                  ].map(([id, label]) => {
                    const on = intent === id;
                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        onPress={() => setIntent(id)}
                        style={[styles.intent, on && styles.onLight]}
                      >
                        <Text style={[styles.intentText, on && styles.onLightText]}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {intent === "transfer" && transfers.length ? (
                  <View style={styles.wrapRow}>
                    {transfers.map((id) => {
                      const on = transferTo === id;
                      return (
                        <Pressable
                          key={id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: on }}
                          onPress={() => {
                            setTransferTo(id);
                            setIntent("transfer");
                          }}
                          style={[
                            styles.chipBtn,
                            on && { backgroundColor: lineColor(id), borderColor: lineColor(id) },
                          ]}
                        >
                          <Text style={[styles.chipBtnText, on && { color: lineInk(id) }]}>
                            {LINES[id].name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ) : null}
            {!picking ? (
              <ResultBoard
                destId={destId}
                adv={adv}
                lineId={lineId}
                stripe={stripe}
                myZone={myZone}
                saveMark={saveMark}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ResultBoard({ destId, adv, lineId, stripe, myZone, saveMark }) {
  const rail = <View style={[styles.rail, { backgroundColor: stripe }]} />;

  if (!destId) {
    return (
      <View style={styles.board}>
        {rail}
        <Train carCount={6} active={[]} any={false} direction={null} compact />
        <Text style={styles.sub}>
          Diz onde você desce. Os carros pintados são onde entrar.
        </Text>
      </View>
    );
  }
  if (adv?.error) {
    return (
      <View style={styles.board}>
        {rail}
        <Text style={styles.err}>{adv.error}</Text>
      </View>
    );
  }
  if (adv?.need === "dir") {
    return (
      <View style={styles.board}>
        {rail}
        <Train
          carCount={LINES[lineId]?.cars ?? 6}
          active={[]}
          lineId={lineId}
          direction={null}
          compact
        />
        <Text style={styles.sub}>Escolhe o sentido. Carro 1 é a frente do trem.</Text>
      </View>
    );
  }

  const ask =
    adv.intent === "transfer" ? "Onde ficou a integração?" : "Onde ficou a escada?";
  const source =
    adv.origin === "users"
      ? "Quem já fez essa viagem neste sentido."
      : adv.origin === "seed"
        ? "Pela geometria da estação, sem visita de campo."
        : null;

  return (
    <View style={styles.board}>
      {rail}
      <Train
        carCount={adv.carCount}
        active={adv.unknown ? [] : adv.cars}
        any={adv.any}
        lineId={adv.lineId}
        direction={adv.direction}
        compact
      />
      <Text
        style={[styles.headline, adv.unknown && styles.headlineUnknown]}
        accessibilityLiveRegion="polite"
      >
        {adv.unknown ? "Sem posição ainda" : formatCars(adv.cars, adv.any)}
      </Text>
      <Text style={styles.sub}>
        {adv.routed ? `Embarque em ${stationTitle(adv.boardFromId)}. ` : ""}
        {intentPhrase(adv)}.
      </Text>
      {adv.why && !adv.unknown ? (
        <Text style={styles.why} numberOfLines={2}>
          {adv.why}
        </Text>
      ) : null}
      {source ? <Text style={styles.conf}>{source}</Text> : null}
      <Text style={styles.ask}>{ask}</Text>
      <View style={styles.voteRow}>
        {["frente", "meio", "fundo"].map((zone) => {
          const on = myZone === zone;
          const mapped = zoneToCars(zone, adv.carCount);
          return (
            <Pressable
              key={zone}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={zoneLabel(zone)}
              onPress={() => saveMark(zone)}
              style={[styles.zone, on && styles.onLight]}
            >
              <Text style={[styles.zoneName, on && styles.onLightText]}>
                {zone === "frente" ? "Frente" : zone === "meio" ? "Meio" : "Trás"}
              </Text>
              <Text style={[styles.zoneCars, on && styles.onLightText]}>
                {formatCars(mapped.cars, false)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {myZone ? <Text style={styles.conf}>Você apontou: {zoneLabel(myZone)}.</Text> : null}
    </View>
  );
}

function hexAlpha(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.asphalt,
  },
  flex: {
    flex: 1,
  },
  wash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  safe: {
    flex: 1,
  },
  stripe: {
    height: 8,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  title: {
    marginTop: 18,
    paddingRight: 44,
    color: colors.enamel,
    fontSize: 38,
    lineHeight: 40,
    fontFamily: "Archivo_800ExtraBold",
    letterSpacing: -0.6,
  },
  titleOn: {
    marginTop: 8,
    fontSize: 26,
    lineHeight: 28,
  },
  lede: {
    marginTop: 10,
    color: colors.dust,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Archivo_400Regular",
    maxWidth: 280,
  },
  block: {
    marginTop: 16,
    gap: 10,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipBtn: {
    borderWidth: 1,
    borderColor: "rgba(243,234,220,0.22)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  chipBtnText: {
    color: colors.enamel,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
  },
  mini: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  miniText: {
    fontSize: 11,
    fontFamily: "Archivo_700Bold",
  },
  leg: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  legText: {
    color: colors.enamel,
    fontFamily: "Archivo_400Regular",
    flex: 1,
    fontSize: 15,
  },
  muted: {
    color: colors.dust,
    fontFamily: "Archivo_400Regular",
    fontSize: 15,
  },
  dirRow: {
    flexDirection: "row",
    gap: 8,
  },
  dir: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1,
    borderColor: "rgba(243,234,220,0.22)",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dirLabel: {
    color: colors.dust,
    fontFamily: "Archivo_400Regular",
    fontSize: 13,
  },
  dirName: {
    color: colors.enamel,
    fontFamily: "Archivo_700Bold",
    fontSize: 16,
  },
  onLight: {
    backgroundColor: colors.enamel,
    borderColor: colors.enamel,
  },
  onLightText: {
    color: colors.ink,
  },
  intentRow: {
    flexDirection: "row",
    gap: 8,
  },
  intent: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(243,234,220,0.22)",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  intentText: {
    color: colors.enamel,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    textAlign: "center",
  },
  board: {
    marginTop: 22,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 12,
    marginHorizontal: -12,
    backgroundColor: colors.asphalt2,
  },
  rail: {
    height: 4,
    marginHorizontal: -12,
    marginTop: -12,
    marginBottom: 10,
  },
  headline: {
    color: colors.enamel,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: "Archivo_800ExtraBold",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  headlineUnknown: {
    fontSize: 22,
    lineHeight: 26,
  },
  sub: {
    marginTop: 6,
    color: colors.enamel,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: "Archivo_400Regular",
  },
  why: {
    marginTop: 6,
    color: colors.dust,
    fontSize: 14,
    fontFamily: "Archivo_400Regular",
  },
  conf: {
    marginTop: 6,
    color: colors.dust,
    fontSize: 13,
    fontFamily: "Archivo_400Regular",
  },
  ask: {
    marginTop: 16,
    color: colors.dust,
    fontFamily: "Archivo_400Regular",
    fontSize: 15,
  },
  err: {
    color: colors.danger,
    fontFamily: "Archivo_400Regular",
    fontSize: 16,
    paddingVertical: 8,
  },
  voteRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  zone: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(243,234,220,0.22)",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  zoneName: {
    color: colors.enamel,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 14,
  },
  zoneCars: {
    color: colors.dust,
    fontFamily: "Archivo_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
});
