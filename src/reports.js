import { tally } from "./marks.js";

const ZONES = new Set(["frente", "meio", "fundo", "qualquer"]);

export function validZone(zone) {
  return ZONES.has(zone);
}

export function applyVote(db, { deviceId, key, zone, at } = {}) {
  if (!deviceId || !key || !validZone(zone)) return db;
  const votes = { ...(db.votes || {}) };
  const mine = { ...(votes[deviceId] || {}) };
  mine[key] = { zone, at: at || Date.now() };
  votes[deviceId] = mine;
  return { votes };
}

export function aggregateVotes(votes) {
  const byKey = {};
  for (const cells of Object.values(votes || {})) {
    for (const [key, entry] of Object.entries(cells || {})) {
      const zone = typeof entry === "string" ? entry : entry?.zone;
      if (!validZone(zone)) continue;
      (byKey[key] ||= []).push({ zone, at: entry?.at });
    }
  }
  const cells = {};
  const published = {};
  for (const [key, list] of Object.entries(byKey)) {
    const t = tally(list);
    cells[key] = {
      counts: t.counts,
      n: t.n,
      published: t.published,
      zone: t.zone,
    };
    if (t.published) {
      published[key] = {
        zone: t.zone,
        n: t.n,
        why: `${t.bestN} de ${t.n} neste sentido apontaram ${t.zone}`,
      };
    }
  }
  return { cells, published };
}
