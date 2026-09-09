import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADVICE,
  LINE_ORDER,
  LINES,
  STATION_NAMES,
  getAdvice,
  linesAt,
  resolveCars,
  searchStations,
} from "../src/data.js";
import { findPath, firstAlighting } from "../src/router.js";
import { currentAdvice, formatCars } from "../src/lookup.js";

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

describe("advice", () => {
  it("puts Sé transfer in the middle cars", () => {
    const a = getAdvice("se", "1", "transfer", "3");
    assert.deepEqual(a.cars, [3, 4]);
  });

  it("uses both ends as the default", () => {
    const a = getAdvice("santana", "1", "escada");
    assert.deepEqual(a.cars, [1, 2, 5, 6]);
    assert.equal(a.confidence, "inferred");
  });

  it("marks Paraíso transfer as any car", () => {
    const a = getAdvice("paraiso", "1", "transfer", "2");
    assert.equal(a.any, true);
    assert.equal(a.cars.length, 6);
  });

  it("resolves tokens inside car count", () => {
    assert.deepEqual(resolveCars("ends", 7), [1, 2, 6, 7]);
    assert.deepEqual(resolveCars("middle", 6), [3, 4]);
  });

  it("only references known stations and lines", () => {
    for (const [stationId, body] of Object.entries(ADVICE)) {
      assert.ok(STATION_NAMES[stationId], stationId);
      for (const [lineId, spec] of Object.entries(body)) {
        if (lineId === "note" || lineId === "source") continue;
        assert.ok(LINES[lineId], `${stationId} ${lineId}`);
        for (const to of Object.keys(spec.transfer || {})) {
          assert.ok(LINES[to], `${stationId} xfer ${to}`);
        }
      }
    }
  });
});

describe("search", () => {
  it("finds Sé without the accent", () => {
    const hits = searchStations("se");
    assert.equal(hits[0].id, "se");
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
    const cars = getAdvice(alight.stationId, alight.lineId, alight.intent, alight.transferTo);
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

  it("routes Jabaquara to Itaquera through Sé cars 3-4", () => {
    const adv = currentAdvice({
      destId: "corinthians-itaquera",
      originId: "jabaquara",
    });
    assert.equal(adv.routed, true);
    assert.deepEqual(adv.cars, [3, 4]);
    assert.equal(adv.transferTo, "3");
  });
});
