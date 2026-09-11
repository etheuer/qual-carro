import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
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
  metroLines,
  transferOptions,
} from "./src/lookup.js";
import { shouldAsk, zoneLabel, zoneToCars } from "./src/cells.js";
import {
  MARKS_KEY,
  PUBLISHED_KEY,
  SNAP_KEY,
  UNSENT_KEY,
  lastZone,
  normalizeStore,
  publishedFromMarks,
  setMark,
} from "./src/marks.js";
import { fetchReports, postReport } from "./src/sync.js";
import { Train } from "./src/components/Train.js";
import { StationField } from "./src/components/StationField.js";
import { Segmented } from "./src/components/Segmented.js";
import { RouteLine } from "./src/components/RouteLine.js";
import { LineBullet } from "./src/components/LineBullet.js";
import { Icon } from "./src/components/Icon.js";
import { colors, font, gutter, radius } from "./src/theme.js";
import {
  HOME_BOARD,
  HOME_LEDE,
  NEED_DIRECTION,
  ZONE_NAME,
  boardCopy,
} from "./src/copy.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Native splash used to vanish as soon as fonts loaded. Hold the same image so the line is readable. */
const SPLASH_HOLD_MS = 2500;

/** Headline plus train, measured from the board's top edge. */
const BOARD_ANSWER_HEIGHT = 230;

function lineLabel(id) {
  return LINES[id].name.replace(/^\d+-/, "");
}

export default function App() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Archivo: Archivo_400Regular,
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_700Bold,
    Archivo_800ExtraBold,
  });
  const [splashDone, setSplashDone] = useState(false);

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
  const [remoteCells, setRemoteCells] = useState({});
  const [unsent, setUnsent] = useState({});
  const [sending, setSending] = useState(null);
  const unsentReady = useRef(false);

  const scroller = useRef(null);
  const scrollY = useRef(0);
  const viewH = useRef(0);
  const boardY = useRef(0);

  function applySnap(snap) {
    if (!snap) return;
    const published = snap.published || {};
    const cells = snap.cells || {};
    setRemotePublished(published);
    setRemoteCells(cells);
    AsyncStorage.setItem(SNAP_KEY, JSON.stringify({ published, cells }));
    AsyncStorage.setItem(PUBLISHED_KEY, JSON.stringify(published));
  }

  useEffect(() => {
    AsyncStorage.getItem(MARKS_KEY).then((raw) => {
      if (!raw) return;
      const next = normalizeStore(JSON.parse(raw));
      setMarks(next);
      AsyncStorage.setItem(MARKS_KEY, JSON.stringify(next));
    });
    AsyncStorage.getItem(SNAP_KEY).then((raw) => {
      if (!raw) {
        AsyncStorage.getItem(PUBLISHED_KEY).then((old) => {
          if (old) setRemotePublished(JSON.parse(old));
        });
        return;
      }
      const snap = JSON.parse(raw);
      setRemotePublished(snap.published || {});
      setRemoteCells(snap.cells || {});
    });
    AsyncStorage.getItem(UNSENT_KEY).then((raw) => {
      if (raw) setUnsent((prev) => ({ ...JSON.parse(raw), ...prev }));
      unsentReady.current = true;
    });
    fetchReports().then(applySnap);
  }, []);

  useEffect(() => {
    if (unsentReady.current) AsyncStorage.setItem(UNSENT_KEY, JSON.stringify(unsent));
  }, [unsent]);

  useEffect(() => {
    if (!destId) return;
    let live = true;
    fetchReports().then((snap) => {
      if (live) applySnap(snap);
    });
    return () => {
      live = false;
    };
  }, [destId]);

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
  const answered = Boolean(adv && !adv.error && !adv.need);
  const answerKey = answered ? adviceKey(adv) : null;

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

  const manual = Boolean(destId && !originId);
  const lines = manual ? metroLines(destId) : [];
  const transfers = manual && lineId ? transferOptions(destId, lineId) : [];

  useEffect(() => {
    if (intent === "transfer" && transfers.length && !transfers.includes(transferTo)) {
      setTransferTo(transfers[0]);
    }
  }, [intent, transfers, transferTo]);

  // A fresh answer below the fold scrolls up just far enough to show the painted train.
  // Waits out the keyboard's exit so the viewport height is final.
  useEffect(() => {
    if (!answerKey || picking) return;
    const t = setTimeout(() => {
      const need = boardY.current + BOARD_ANSWER_HEIGHT - viewH.current;
      if (viewH.current && need > scrollY.current) {
        scroller.current?.scrollTo({ y: need + 12, animated: true });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [answerKey, picking]);

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
    if (!shouldAsk(adv)) return;
    const key = adviceKey(adv);
    const next = setMark(marks, key, zone);
    setMarks(next);
    setSending(key);
    await AsyncStorage.setItem(MARKS_KEY, JSON.stringify(next));
    const snap = await postReport(key, zone);
    applySnap(snap);
    setSending((cur) => (cur === key ? null : cur));
    setUnsent((prev) => {
      if (Boolean(prev[key]) === !snap) return prev;
      const out = { ...prev };
      if (snap) delete out[key];
      else out[key] = true;
      return out;
    });
  }

  useEffect(() => {
    if (!fontsLoaded) return;
    const t = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      setSplashDone(true);
    }, SPLASH_HOLD_MS);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  if (!fontsLoaded || !splashDone) {
    return (
      <View style={styles.root} accessibilityLabel="Qual carro? Pra não andar a plataforma inteira.">
        {fontsLoaded ? (
          <Image
            source={require("./assets/splash.png")}
            style={styles.launchImg}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null}
      </View>
    );
  }

  const myZone = answered ? lastZone(marks[answerKey]) : null;
  const singleTransfer = transfers.length === 1 ? transfers[0] : null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[hexAlpha(stripe, 0.3), hexAlpha(colors.asphalt, 0)]}
        style={styles.wash}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={[styles.stripe, { backgroundColor: stripe }]} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scroller}
            style={styles.flex}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: Math.max(insets.bottom, 20) + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            onLayout={(e) => {
              viewH.current = e.nativeEvent.layout.height;
            }}
            onScroll={(e) => {
              scrollY.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={32}
          >
            <View style={styles.header}>
              <Text
                style={[styles.title, destId && styles.titleCompact]}
                accessibilityRole="header"
              >
                Qual carro?
              </Text>
              {!destId ? <Text style={styles.lede}>{HOME_LEDE}</Text> : null}
            </View>

            <View style={styles.fields}>
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
                onClear={() => {
                  setDestQuery("");
                  setDestId(null);
                  setDestOpen(true);
                }}
                focusOnClear
              />

              <StationField
                label="Onde você embarca"
                placeholder="Pra achar o sentido"
                optional
                query={originQuery}
                onChangeQuery={(t) => {
                  setOriginQuery(t);
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
                onClear={() => {
                  setOriginId(null);
                  setOriginQuery("");
                  setOriginOpen(false);
                }}
              />
            </View>

            {routed ? (
              <View style={styles.group}>
                <Text style={styles.groupLabel}>Trajeto</Text>
                <RouteLine legs={adv.path.legs} />
              </View>
            ) : null}

            {manual && line ? (
              <>
                {lines.length > 1 ? (
                  <View style={styles.group}>
                    <Text style={styles.groupLabel}>Linha</Text>
                    <Segmented
                      value={lineId}
                      onChange={(id) => {
                        setLineId(id);
                        setDirection(null);
                        setIntent("escada");
                      }}
                      options={lines.map((id) => ({
                        value: id,
                        label: lineLabel(id),
                        lineId: id,
                        a11y: `Linha ${LINES[id].name}`,
                      }))}
                    />
                  </View>
                ) : null}

                <View style={styles.group}>
                  <View style={styles.groupHead}>
                    <Text style={styles.groupLabel}>Sentido</Text>
                    {lines.length === 1 ? (
                      <View style={styles.groupAside}>
                        <LineBullet lineId={line.id} size={18} />
                        <Text style={styles.groupAsideText}>{line.name}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Segmented
                    tall
                    value={direction}
                    onChange={setDirection}
                    options={line.terminals.map((t) => ({
                      value: t,
                      label: t,
                      a11y: `Sentido ${t}`,
                    }))}
                  />
                </View>

                <View style={styles.group}>
                  <Text style={styles.groupLabel}>Ao descer, vai pra</Text>
                  <Segmented
                    value={intent}
                    onChange={setIntent}
                    options={[
                      { value: "escada", label: "Escada" },
                      { value: "saida", label: "Saída", a11y: "Saída pra rua" },
                      ...(transfers.length
                        ? [
                            {
                              value: "transfer",
                              label: "Integração",
                              lineId: singleTransfer,
                              a11y: singleTransfer
                                ? `Integração com a ${LINES[singleTransfer].name}`
                                : "Integração",
                            },
                          ]
                        : []),
                    ]}
                  />
                  {intent === "transfer" && transfers.length > 1 ? (
                    <Segmented
                      value={transferTo}
                      onChange={setTransferTo}
                      options={transfers.map((id) => ({
                        value: id,
                        label: lineLabel(id),
                        lineId: id,
                        a11y: `Integração com a ${LINES[id].name}`,
                      }))}
                    />
                  ) : null}
                </View>
              </>
            ) : null}

            {!picking ? (
              <View
                onLayout={(e) => {
                  boardY.current = e.nativeEvent.layout.y;
                }}
              >
                <ResultBoard
                  destId={destId}
                  adv={adv}
                  lineId={lineId}
                  stripe={stripe}
                  myZone={myZone}
                  cell={answered ? remoteCells[answerKey] || null : null}
                  answerKey={answerKey}
                  send={
                    !answered
                      ? null
                      : sending === answerKey
                        ? "sending"
                        : unsent[answerKey]
                          ? "failed"
                          : null
                  }
                  saveMark={saveMark}
                />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled().then((v) => {
  reduceMotion = v;
});
AccessibilityInfo.addEventListener("reduceMotionChanged", (v) => {
  reduceMotion = v;
});

/** Settle the answer in when it changes, so a tap reads as "updated". */
function useSettle(key) {
  const value = useRef(new Animated.Value(1)).current;
  useLayoutEffect(() => {
    if (!key || reduceMotion) return;
    value.setValue(0);
    Animated.timing(value, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [key, value]);
  return {
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }],
  };
}

function Note({ tone, text }) {
  const failed = tone === "error";
  const icon = failed ? "alert" : tone === "confirmed" || tone === "voted" ? "check" : null;
  return (
    <View style={styles.note} accessibilityLiveRegion="polite">
      {icon ? <Icon name={icon} size={16} color={failed ? colors.danger : colors.ok} /> : null}
      <Text
        style={[
          styles.noteText,
          tone === "confirmed" && styles.noteStrong,
          failed && styles.noteError,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function ResultBoard({ destId, adv, lineId, stripe, myZone, cell, answerKey, send, saveMark }) {
  const settle = useSettle(answerKey ? `${answerKey}|${adv?.zone}` : null);
  const band = <View style={[styles.band, { backgroundColor: stripe }]} />;

  if (!destId) {
    return (
      <View style={styles.board}>
        {band}
        <Train carCount={6} />
        <Text style={styles.boardHint}>{HOME_BOARD}</Text>
      </View>
    );
  }
  if (adv?.error) {
    return (
      <View style={styles.board} accessibilityLiveRegion="polite">
        {band}
        <Text style={styles.err}>{adv.error}</Text>
      </View>
    );
  }
  if (adv?.need === "dir") {
    return (
      <View style={styles.board}>
        {band}
        <Train carCount={LINES[lineId]?.cars ?? 6} lineId={lineId} />
        <Text style={styles.boardHint}>{NEED_DIRECTION}</Text>
      </View>
    );
  }

  const copy = boardCopy(adv, cell, myZone, send);

  return (
    <View style={styles.board}>
      {band}
      <Animated.View style={settle}>
        <Text
          style={[styles.headline, adv.unknown && styles.headlineUnknown]}
          accessibilityRole="header"
        >
          {copy.headline}
        </Text>
        <Text style={styles.context}>{copy.context}</Text>
        <View style={styles.train}>
          <Train
            carCount={adv.carCount}
            active={adv.unknown ? [] : adv.cars}
            any={adv.any}
            lineId={adv.lineId}
            direction={adv.direction}
          />
        </View>
      </Animated.View>
      {copy.source ? <Note {...copy.source} /> : null}
      {copy.ask ? (
        <View style={styles.askBlock}>
          <Text style={styles.ask}>{copy.ask}</Text>
          <View style={styles.voteRow}>
            {["frente", "meio", "fundo"].map((zone) => {
              const on = myZone === zone;
              const mapped = zoneToCars(zone, adv.carCount);
              return (
                <Pressable
                  key={zone}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${zoneLabel(zone)}, ${formatCars(mapped.cars, false)}`}
                  onPress={() => saveMark(zone)}
                  style={({ pressed }) => [
                    styles.zone,
                    pressed && !on && styles.zonePressed,
                    on && styles.zoneOn,
                  ]}
                >
                  <Text style={[styles.zoneName, on && styles.zoneTextOn]}>
                    {ZONE_NAME[zone]}
                  </Text>
                  <Text style={[styles.zoneCars, on && styles.zoneTextOn]}>
                    {formatCars(mapped.cars, false)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {copy.footnote ? <Note {...copy.footnote} /> : null}
        </View>
      ) : null}
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
  launchImg: {
    width: "100%",
    height: "100%",
  },
  flex: {
    flex: 1,
  },
  wash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  safe: {
    flex: 1,
  },
  stripe: {
    height: 6,
  },
  scroll: {
    paddingHorizontal: gutter,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    gap: 10,
  },
  title: {
    color: colors.enamel,
    fontSize: 40,
    lineHeight: 44,
    fontFamily: font.heavy,
    letterSpacing: -0.8,
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  lede: {
    color: colors.dust,
    fontSize: 18,
    lineHeight: 25,
    fontFamily: font.regular,
    maxWidth: 340,
  },
  fields: {
    gap: 16,
  },
  group: {
    marginTop: 24,
    gap: 8,
  },
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  groupLabel: {
    color: colors.dust,
    fontFamily: font.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  groupAside: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupAsideText: {
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  board: {
    marginTop: 28,
    overflow: "hidden",
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.asphalt2,
  },
  band: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  headline: {
    color: colors.enamel,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: font.heavy,
    letterSpacing: -0.7,
  },
  headlineUnknown: {
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  context: {
    marginTop: 6,
    color: colors.enamel,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: font.regular,
  },
  train: {
    marginTop: 18,
  },
  boardHint: {
    marginTop: 14,
    color: colors.enamel,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: font.regular,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  noteText: {
    flex: 1,
    color: colors.dust,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: font.regular,
  },
  noteStrong: {
    color: colors.enamel,
  },
  noteError: {
    color: colors.danger,
  },
  askBlock: {
    marginTop: 20,
  },
  ask: {
    color: colors.enamel,
    fontFamily: font.semibold,
    fontSize: 17,
    lineHeight: 22,
  },
  err: {
    color: colors.danger,
    fontFamily: font.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  voteRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  zone: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zonePressed: {
    backgroundColor: colors.asphalt3,
  },
  zoneOn: {
    backgroundColor: colors.enamel,
    borderColor: colors.enamel,
  },
  zoneName: {
    color: colors.enamel,
    fontFamily: font.semibold,
    fontSize: 16,
    lineHeight: 20,
  },
  zoneCars: {
    marginTop: 2,
    color: colors.dust,
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  zoneTextOn: {
    color: colors.ink,
  },
});
