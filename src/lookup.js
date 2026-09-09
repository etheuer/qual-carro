import {
  ADVICE,
  COMMUTER_AT,
  LINES,
  LINE_ORDER,
  STATION_NAMES,
  getAdvice,
  linesAt,
} from "./data.js";
import { findPath, firstAlighting } from "./router.js";

export function lineColor(id) {
  return LINES[id]?.color ?? "#888";
}

export function lineInk(id) {
  return LINES[id]?.ink ?? "#fff";
}

export function stationTitle(id) {
  return STATION_NAMES[id] ?? id;
}

export function formatCars(cars, any) {
  if (any) return "qualquer carro";
  const sorted = [...new Set(cars)].sort((a, b) => a - b);
  if (sorted.length === 1) return `carro ${sorted[0]}`;
  const runs = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    runs.push(start === prev ? `${start}` : `${start} e ${prev}`);
    start = n;
    prev = n;
  }
  if (runs.length === 1) {
    const s = sorted;
    if (s.length === 2) return `carros ${s[0]} e ${s[1]}`;
    return `carros ${s[0]}–${s[s.length - 1]}`;
  }
  return `carros ${runs.join(", ou ")}`;
}

export function metroLines(stationId) {
  return linesAt(stationId).filter((id) => LINE_ORDER[id]);
}

export function transferOptions(stationId, lineId) {
  const fromAdvice = ADVICE[stationId]?.[lineId]?.transfer
    ? Object.keys(ADVICE[stationId][lineId].transfer)
    : [];
  const present = linesAt(stationId).filter((id) => id !== lineId);
  const ids = [...new Set([...fromAdvice, ...present])];
  return ids.filter((id) => LINES[id]);
}

export function intentPhrase(adv) {
  if (adv.intent === "transfer" && adv.transferTo) {
    return `pra integração com a ${LINES[adv.transferTo].name}`;
  }
  if (adv.intent === "saida") return "pra saída da rua";
  return "pra chegar na escada rolante";
}

export function voteKey(adv) {
  return [adv.stationId, adv.lineId, adv.direction, adv.intent, adv.transferTo || ""].join("|");
}

export function currentAdvice({ destId, originId, lineId, direction, intent, transferTo }) {
  if (!destId) return null;
  const path = originId ? findPath(originId, destId) : null;
  if (path?.error === "same") return { error: "Mesma estação nos dois campos." };
  if (path?.error === "no-path") return { error: "Não achei rota no metrô entre essas duas." };
  if (path?.legs) {
    const alight = firstAlighting(path);
    if (!alight) return { error: "Não achei rota no metrô entre essas duas." };
    const adv = getAdvice(alight.stationId, alight.lineId, alight.intent, alight.transferTo);
    return {
      ...adv,
      lineId: alight.lineId,
      direction: alight.direction,
      stationId: alight.stationId,
      intent: alight.intent,
      transferTo: alight.transferTo,
      boardFromId: alight.boardFromId,
      routed: true,
      path,
    };
  }
  if (!lineId || !direction) return { need: "dir" };
  const adv = getAdvice(destId, lineId, intent, intent === "transfer" ? transferTo : null);
  return {
    ...adv,
    lineId,
    direction,
    stationId: destId,
    intent,
    transferTo,
    routed: false,
  };
}

export { COMMUTER_AT, LINES, LINE_ORDER };
