import { LINE_ORDER, LINES, linesAt, STATION_NAMES } from "./data.js";

function neighbors(stationId, lineId) {
  const order = LINE_ORDER[lineId];
  if (!order) return [];
  const i = order.indexOf(stationId);
  if (i < 0) return [];
  const out = [];
  if (i > 0) out.push({ stationId: order[i - 1], lineId, via: "ride" });
  if (i < order.length - 1) out.push({ stationId: order[i + 1], lineId, via: "ride" });
  for (const other of linesAt(stationId)) {
    if (other === lineId) continue;
    if (!LINE_ORDER[other]) continue;
    out.push({ stationId, lineId: other, via: "transfer" });
  }
  return out;
}

function directionOnLine(lineId, fromId, toId) {
  const order = LINE_ORDER[lineId];
  const a = order.indexOf(fromId);
  const b = order.indexOf(toId);
  if (a < 0 || b < 0) return null;
  const towardEnd = b > a;
  const terminals = LINES[lineId].terminals;
  return towardEnd ? terminals[1] : terminals[0];
}

/**
 * Shortest path origin → dest as a list of ride/transfer steps.
 * Prefers fewer transfers, then fewer hops.
 */
export function findPath(originId, destId) {
  if (originId === destId) return { error: "same" };
  if (!STATION_NAMES[originId] || !STATION_NAMES[destId]) return { error: "unknown" };

  const starts = linesAt(originId).filter((id) => LINE_ORDER[id]);
  if (!starts.length) return { error: "no-line" };

  const destLines = new Set(linesAt(destId).filter((id) => LINE_ORDER[id]));
  if (!destLines.size) return { error: "no-line" };

  const queue = [];
  const seen = new Set();
  for (const lineId of starts) {
    const key = `${originId}|${lineId}`;
    seen.add(key);
    queue.push({ stationId: originId, lineId, hops: 0, transfers: 0, prev: null });
  }

  let best = null;
  while (queue.length) {
    const cur = queue.shift();
    if (cur.stationId === destId && destLines.has(cur.lineId)) {
      best = cur;
      break;
    }
    for (const n of neighbors(cur.stationId, cur.lineId)) {
      const key = `${n.stationId}|${n.lineId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({
        stationId: n.stationId,
        lineId: n.lineId,
        hops: cur.hops + 1,
        transfers: cur.transfers + (n.via === "transfer" ? 1 : 0),
        via: n.via,
        prev: cur,
      });
    }
  }

  if (!best) return { error: "no-path" };

  const nodes = [];
  for (let n = best; n; n = n.prev) nodes.push(n);
  nodes.reverse();

  const legs = [];
  let i = 0;
  while (i < nodes.length - 1) {
    const a = nodes[i];
    if (nodes[i + 1].via === "transfer" || nodes[i + 1].lineId !== a.lineId) {
      i += 1;
      continue;
    }
    let j = i + 1;
    while (
      j < nodes.length &&
      nodes[j].lineId === a.lineId &&
      nodes[j].via !== "transfer"
    ) {
      j += 1;
    }
    const last = nodes[j - 1];
    const next = nodes[j];
    const dir = directionOnLine(a.lineId, a.stationId, last.stationId);
    legs.push({
      lineId: a.lineId,
      fromId: a.stationId,
      toId: last.stationId,
      direction: dir,
      transferTo: next && next.via === "transfer" ? next.lineId : null,
      transferAt: next && next.via === "transfer" ? next.stationId : null,
    });
    i = next && next.via === "transfer" ? j : j - 1;
    if (!next) break;
    if (next.via === "transfer") {
      /* continue from transferred node */
    }
  }

  if (!legs.length) {
    const a = nodes[0];
    const last = nodes[nodes.length - 1];
    legs.push({
      lineId: a.lineId,
      fromId: originId,
      toId: destId,
      direction: directionOnLine(a.lineId, originId, destId),
      transferTo: null,
      transferAt: null,
    });
    void last;
  }

  return { legs, transfers: best.transfers, hops: best.hops };
}

export function firstAlighting(path) {
  if (!path?.legs?.length) return null;
  const leg = path.legs[0];
  if (leg.transferTo) {
    return {
      stationId: leg.transferAt || leg.toId,
      lineId: leg.lineId,
      direction: leg.direction,
      intent: "transfer",
      transferTo: leg.transferTo,
      boardLineId: leg.lineId,
      boardFromId: leg.fromId,
    };
  }
  return {
    stationId: leg.toId,
    lineId: leg.lineId,
    direction: leg.direction,
    intent: "escada",
    transferTo: null,
    boardLineId: leg.lineId,
    boardFromId: leg.fromId,
  };
}
