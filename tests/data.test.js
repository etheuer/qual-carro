import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LINE_ORDER, LINES, STATION_NAMES, linesAt, searchStations } from "../src/data.js";
import { findPath, firstAlighting } from "../src/router.js";
import { currentAdvice, formatCars } from "../src/lookup.js";
import { SEED_CELLS, getAdvice, shouldAsk, zoneToCars } from "../src/cells.js";
import {
  addMark,
  publishedFromMarks,
  progressLine,
  setMark,
  lastZone,
  tally,
  PUBLISH_MIN,
} from "../src/marks.js";
import { applyVote, aggregateVotes } from "../src/reports.js";
import {
  HOME_LEDE,
  UNKNOWN_CONTRIBUTE,
  UNKNOWN_HEADLINE,
  afterVoteLine,
} from "../src/copy.js";

describe("station graph", () => {
  it("names every id in LINE_ORDER", () => {
    for (const [line, order] of Object.entries(LINE_ORDER)) {
      assert.ok(LINES[line], line);
      for (const id of order) {
        assert.ok(STATION_NAMES[id], `missing name for ${id} on ${line}`);
      }
    }
  });

  it("keeps unique ids per line", () => {
    for (const order of Object.values(LINE_ORDER)) {
      assert.equal(new Set(order).size, order.length);
    }
  });

  it("lists both lines at Sé", () => {
    assert.deepEqual(linesAt("se").sort(), ["1", "3"]);
  });
});

describe("cells", () => {
  it("puts Sé transfer in the middle cars", () => {
    const a = getAdvice({ stationId: "se", lineId: "1", intent: "transfer", transferTo: "3" });
    assert.equal(a.unknown, false);
    assert.equal(a.zone, "meio");
    assert.deepEqual(a.cars, [3, 4]);
    assert.equal(a.origin, "seed");
    assert.equal(a.confident, false);
    assert.equal(shouldAsk(a), true);
  });

  it("does not invent ends for an unsurveyed station", () => {
    const a = getAdvice({ stationId: "santana", lineId: "1", intent: "escada", direction: "Tucuruvi" });
    assert.equal(a.unknown, true);
    assert.deepEqual(a.cars, []);
    assert.equal(a.confidence, "unknown");
  });

  it("does not invent ends for Sé escada", () => {
    const a = getAdvice({ stationId: "se", lineId: "1", intent: "escada", direction: "Tucuruvi" });
    assert.equal(a.unknown, true);
    assert.equal(shouldAsk(a), true);
    assert.equal(a.confident, false);
  });

  it("marks Paraíso transfer as any car", () => {
    const a = getAdvice({ stationId: "paraiso", lineId: "1", intent: "transfer", transferTo: "2" });
    assert.equal(a.any, true);
    assert.equal(a.cars.length, 6);
    assert.equal(a.zone, "qualquer");
    assert.equal(a.confident, true);
    assert.equal(shouldAsk(a), false);
  });

  it("maps thirds onto 6- and 7-car trains", () => {
    assert.deepEqual(zoneToCars("frente", 6).cars, [1, 2]);
    assert.deepEqual(zoneToCars("meio", 6).cars, [3, 4]);
    assert.deepEqual(zoneToCars("fundo", 6).cars, [5, 6]);
    assert.deepEqual(zoneToCars("meio", 7).cars, [3, 4, 5]);
    assert.deepEqual(zoneToCars("fundo", 7).cars, [6, 7]);
  });

  it("only seeds known stations and lines", () => {
    for (const cell of SEED_CELLS) {
      assert.ok(STATION_NAMES[cell.stationId], cell.stationId);
      assert.ok(LINES[cell.lineId], `${cell.stationId} ${cell.lineId}`);
      if (cell.transferTo) assert.ok(LINES[cell.transferTo], `${cell.stationId} xfer ${cell.transferTo}`);
    }
  });
});

describe("marks", () => {
  it("does not publish before five agreeing marks", () => {
    let store = {};
    const key = "se|1|Tucuruvi|escada";
    for (let i = 0; i < 4; i++) store = addMark(store, key, "frente");
    const t = tally(store[key]);
    assert.equal(t.published, false);
    assert.equal(Object.keys(publishedFromMarks(store)).length, 0);
  });

  it("publishes when five of five agree", () => {
    let store = {};
    const key = "se|1|Tucuruvi|escada";
    for (let i = 0; i < PUBLISH_MIN; i++) store = addMark(store, key, "frente");
    const pub = publishedFromMarks(store);
    assert.equal(pub[key].zone, "frente");
  });

  it("keeps a single answer per cell on this phone", () => {
    let store = {};
    store = setMark(store, "se|1|Tucuruvi|escada", "frente");
    store = setMark(store, "se|1|Tucuruvi|escada", "meio");
    assert.equal(lastZone(store["se|1|Tucuruvi|escada"]), "meio");
    assert.equal(tally(store["se|1|Tucuruvi|escada"]).n, 1);
  });

  it("lets published user marks override a seed", () => {
    let store = {};
    const key = "se|1|Tucuruvi|transfer:3";
    for (let i = 0; i < PUBLISH_MIN; i++) store = addMark(store, key, "frente");
    const a = getAdvice({
      stationId: "se",
      lineId: "1",
      intent: "transfer",
      transferTo: "3",
      direction: "Tucuruvi",
      published: publishedFromMarks(store),
    });
    assert.equal(a.zone, "frente");
    assert.equal(a.origin, "users");
    assert.deepEqual(a.cars, [1, 2]);
    assert.equal(a.confident, true);
    assert.equal(shouldAsk(a), false);
  });
});

describe("shared reports", () => {
  it("counts one vote per device per cell", () => {
    let db = { votes: {} };
    db = applyVote(db, { deviceId: "a", key: "se|1|Tucuruvi|escada", zone: "frente" });
    db = applyVote(db, { deviceId: "a", key: "se|1|Tucuruvi|escada", zone: "meio" });
    db = applyVote(db, { deviceId: "b", key: "se|1|Tucuruvi|escada", zone: "frente" });
    const snap = aggregateVotes(db.votes);
    assert.equal(snap.cells["se|1|Tucuruvi|escada"].n, 2);
    assert.equal(snap.cells["se|1|Tucuruvi|escada"].counts.meio, 1);
    assert.equal(snap.cells["se|1|Tucuruvi|escada"].counts.frente, 1);
    assert.equal(snap.published["se|1|Tucuruvi|escada"], undefined);
  });

  it("publishes when five devices agree", () => {
    let db = { votes: {} };
    for (let i = 0; i < 5; i++) {
      db = applyVote(db, {
        deviceId: `d${i}`,
        key: "se|1|Tucuruvi|escada",
        zone: "fundo",
      });
    }
    const snap = aggregateVotes(db.votes);
    assert.equal(snap.published["se|1|Tucuruvi|escada"].zone, "fundo");
    assert.equal(progressLine(snap.cells["se|1|Tucuruvi|escada"]), null);
  });

  it("does not publish a split even after five votes", () => {
    let db = { votes: {} };
    for (let i = 0; i < 3; i++) {
      db = applyVote(db, {
        deviceId: `a${i}`,
        key: "se|1|Jabaquara|escada",
        zone: "frente",
      });
    }
    for (let i = 0; i < 2; i++) {
      db = applyVote(db, {
        deviceId: `b${i}`,
        key: "se|1|Jabaquara|escada",
        zone: "meio",
      });
    }
    const snap = aggregateVotes(db.votes);
    const cell = snap.cells["se|1|Jabaquara|escada"];
    assert.equal(cell.published, false);
    assert.equal(snap.published["se|1|Jabaquara|escada"], undefined);
    assert.equal(progressLine(cell), "Ainda não fechou — 3 frente, 2 meio.");
  });
});

describe("progress", () => {
  it("stays quiet with no votes", () => {
    assert.equal(progressLine(null), null);
    assert.equal(progressLine({ n: 0, counts: {}, published: false }), null);
  });

  it("counts toward the publish bar", () => {
    assert.equal(
      progressLine({ n: 1, counts: { frente: 1 }, published: false }),
      "1 de 5 confirmação neste sentido."
    );
    assert.equal(
      progressLine({ n: 2, counts: { frente: 1, meio: 1 }, published: false }),
      "2 de 5 confirmações neste sentido."
    );
  });
});

describe("copy", () => {
  it("states the platform-walk problem on home", () => {
    assert.match(HOME_LEDE, /anda a plataforma inteira/);
  });

  it("tells unknown riders that five answers paint the cars", () => {
    assert.equal(UNKNOWN_HEADLINE, "Ainda sem posição");
    assert.match(UNKNOWN_CONTRIBUTE, /Com 5 neste sentido/);
    assert.match(UNKNOWN_CONTRIBUTE, /pinta os carros/);
  });

  it("counts remaining answers after a vote", () => {
    assert.equal(
      afterVoteLine({ n: 1, published: false }, "meio"),
      "Já entrou. Faltam 4 neste sentido pra pintar."
    );
    assert.equal(
      afterVoteLine({ n: 4, published: false }, "frente"),
      "Já entrou. Falta 1 neste sentido pra pintar."
    );
    assert.equal(afterVoteLine({ n: 5, published: true }, "meio"), null);
    assert.match(afterVoteLine({ n: 5, published: false }, "meio"), /fechar neste sentido/);
    assert.match(afterVoteLine(null, "meio"), /Com 5 neste sentido/);
    assert.equal(afterVoteLine({ n: 1 }, null), null);
  });
});

describe("search", () => {
  it("finds Sé without the accent", () => {
    const hits = searchStations("se");
    assert.equal(hits[0].id, "se");
  });

  it("does not match mid-word on two letters", () => {
    const ids = searchStations("se").map((h) => h.id);
    assert.equal(ids.includes("aacd-servidor"), false);
    assert.equal(ids.includes("bresser-mooca"), false);
  });

  it("still finds Itaquera from a later token", () => {
    const hits = searchStations("itaquera");
    assert.equal(hits[0].id, "corinthians-itaquera");
  });
});

describe("router", () => {
  it("rides Line 1 without a transfer", () => {
    const path = findPath("jabaquara", "sao-bento");
    assert.equal(path.error, undefined);
    assert.equal(path.legs.length, 1);
    assert.equal(path.legs[0].lineId, "1");
    assert.equal(path.legs[0].direction, "Tucuruvi");
    const alight = firstAlighting(path);
    assert.equal(alight.intent, "escada");
    assert.equal(alight.stationId, "sao-bento");
  });

  it("transfers at Sé from Jabaquara to Itaquera", () => {
    const path = findPath("jabaquara", "corinthians-itaquera");
    assert.equal(path.error, undefined);
    assert.ok(path.legs.length >= 2);
    assert.equal(path.legs[0].lineId, "1");
    assert.equal(path.legs[0].transferTo, "3");
    assert.equal(path.legs[0].transferAt, "se");
    const alight = firstAlighting(path);
    assert.equal(alight.intent, "transfer");
    assert.equal(alight.transferTo, "3");
    const cars = getAdvice({
      stationId: alight.stationId,
      lineId: alight.lineId,
      intent: alight.intent,
      transferTo: alight.transferTo,
      direction: alight.direction,
    });
    assert.deepEqual(cars.cars, [3, 4]);
  });

  it("uses the parallel transfer at Paraíso", () => {
    const path = findPath("vila-madalena", "jabaquara");
    assert.equal(path.legs[0].lineId, "2");
    assert.ok(["paraiso", "ana-rosa"].includes(path.legs[0].transferAt));
  });

  it("rejects the same station", () => {
    assert.equal(findPath("se", "se").error, "same");
  });
});

describe("lookup", () => {
  it("formats end cars", () => {
    assert.equal(formatCars([1, 2, 5, 6], false), "carros 1 e 2, ou 5 e 6");
  });

  it("formats unknown as silence", () => {
    assert.equal(formatCars([], false), "ainda não sabemos");
  });

  it("routes Jabaquara to Itaquera through Sé cars 3-4", () => {
    const adv = currentAdvice({
      destId: "corinthians-itaquera",
      originId: "jabaquara",
    });
    assert.equal(adv.routed, true);
    assert.deepEqual(adv.cars, [3, 4]);
    assert.equal(adv.transferTo, "3");
    assert.equal(adv.unknown, false);
  });

  it("leaves a one-line ride unknown until marked", () => {
    const adv = currentAdvice({
      destId: "sao-bento",
      originId: "jabaquara",
    });
    assert.equal(adv.routed, true);
    assert.equal(adv.unknown, true);
    assert.equal(shouldAsk(adv), true);
  });

  it("stops asking once riders publish a cell", () => {
    const adv = currentAdvice({
      destId: "se",
      lineId: "1",
      direction: "Tucuruvi",
      intent: "escada",
      published: {
        "se|1|Tucuruvi|escada": {
          zone: "frente",
          n: 5,
          why: "5 de 5 neste sentido apontaram frente",
        },
      },
    });
    assert.equal(adv.origin, "users");
    assert.equal(adv.confident, true);
    assert.equal(shouldAsk(adv), false);
    assert.deepEqual(adv.cars, [1, 2]);
  });
});
