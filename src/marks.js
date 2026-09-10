export const MARKS_KEY = "qual-carro-marks";
export const PUBLISH_MIN = 5;
export const PUBLISH_RATIO = 0.7;

const EMPTY = { frente: 0, meio: 0, fundo: 0, qualquer: 0 };

export function addMark(store, key, zone) {
  const list = [...(store[key] || []), { zone, at: Date.now() }];
  return { ...store, [key]: list };
}

export function tally(marks) {
  const counts = { ...EMPTY };
  for (const m of marks || []) {
    if (counts[m.zone] != null) counts[m.zone] += 1;
  }
  const n = (marks || []).length;
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

export function splitPhrase(t) {
  if (!t?.n) return null;
  const parts = [];
  if (t.counts.frente) parts.push(`${t.counts.frente} na ponta da frente`);
  if (t.counts.meio) parts.push(`${t.counts.meio} no meio`);
  if (t.counts.fundo) parts.push(`${t.counts.fundo} na ponta de trás`);
  if (t.counts.qualquer) parts.push(`${t.counts.qualquer} qualquer`);
  const noun = t.n === 1 ? "marca" : "marcas";
  return `${t.n} ${noun}: ${parts.join(", ")}.`;
}

export function lastZone(marks) {
  if (!marks?.length) return null;
  return marks[marks.length - 1].zone;
}
