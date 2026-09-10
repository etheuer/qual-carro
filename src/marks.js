export const MARKS_KEY = "qual-carro-marks";
export const PUBLISHED_KEY = "qual-carro-published";
export const SNAP_KEY = "qual-carro-snap";
export const PUBLISH_MIN = 5;
export const PUBLISH_RATIO = 0.7;

const ZONE_WORD = {
  frente: "frente",
  meio: "meio",
  fundo: "trás",
  qualquer: "qualquer",
};

const EMPTY = { frente: 0, meio: 0, fundo: 0, qualquer: 0 };

export function asList(entry) {
  if (!entry) return [];
  if (Array.isArray(entry)) return entry;
  if (entry.zone) return [entry];
  return [];
}

export function normalizeStore(raw) {
  const out = {};
  for (const [key, entry] of Object.entries(raw || {})) {
    const list = asList(entry);
    if (!list.length) continue;
    const last = list[list.length - 1];
    out[key] = { zone: last.zone, at: last.at };
  }
  return out;
}

/** One answer per cell on this phone. A new tap replaces the last. */
export function setMark(store, key, zone) {
  return { ...store, [key]: { zone, at: Date.now() } };
}

export function addMark(store, key, zone) {
  const list = [...asList(store[key]), { zone, at: Date.now() }];
  return { ...store, [key]: list };
}

export function tally(marks) {
  const list = asList(marks);
  const counts = { ...EMPTY };
  for (const m of list) {
    if (counts[m.zone] != null) counts[m.zone] += 1;
  }
  const n = list.length;
  let best = null;
  let bestN = 0;
  for (const [zone, c] of Object.entries(counts)) {
    if (c > bestN) {
      best = zone;
      bestN = c;
    }
  }
  const published = n >= PUBLISH_MIN && bestN / n >= PUBLISH_RATIO;
  return {
    counts,
    n,
    best,
    bestN,
    published,
    zone: published ? best : null,
  };
}

export function publishedFromMarks(store) {
  const out = {};
  for (const [key, list] of Object.entries(store || {})) {
    const t = tally(list);
    if (t.published) {
      out[key] = {
        zone: t.zone,
        n: t.n,
        why: `marcado por ${t.bestN} de ${t.n} neste sentido`,
      };
    }
  }
  return out;
}

export function lastZone(entry) {
  const list = asList(entry);
  if (!list.length) return null;
  return list[list.length - 1].zone;
}

/** In-progress copy while a cell is still short of publish. Null once closed. */
export function progressLine(cell) {
  if (!cell || !cell.n || cell.published) return null;
  if (cell.n < PUBLISH_MIN) {
    const word = cell.n === 1 ? "confirmação" : "confirmações";
    return `${cell.n} de ${PUBLISH_MIN} ${word} neste sentido.`;
  }
  const bits = Object.entries(cell.counts || {})
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([z, c]) => `${c} ${ZONE_WORD[z] || z}`);
  return `Ainda não fechou — ${bits.join(", ")}.`;
}
