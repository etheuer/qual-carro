import { LINES } from "./data.js";

/** Cell id: station|line|sentido|intent. Transfer includes the other line. */
export function cellKey({ stationId, lineId, direction, intent, transferTo }) {
  const intentKey =
    intent === "transfer" ? `transfer:${transferTo || ""}` : intent || "escada";
  return [stationId, lineId, direction || "*", intentKey].join("|");
}

export function zoneToCars(zone, carCount) {
  const n = carCount ?? 6;
  if (zone === "qualquer") {
    return { cars: Array.from({ length: n }, (_, i) => i + 1), any: true };
  }
  if (zone === "meio") {
    if (n === 6) return { cars: [3, 4], any: false };
    if (n === 7) return { cars: [3, 4, 5], any: false };
    const a = Math.ceil(n / 2);
    return { cars: [a, a + 1].filter((c) => c >= 1 && c <= n), any: false };
  }
  if (zone === "frente") {
    return { cars: n <= 4 ? [1] : [1, 2], any: false };
  }
  if (zone === "fundo") {
    return { cars: n <= 4 ? [n] : [n - 1, n], any: false };
  }
  return { cars: [], any: false };
}

export function carToZone(n, carCount) {
  const frente = zoneToCars("frente", carCount).cars;
  const meio = zoneToCars("meio", carCount).cars;
  if (frente.includes(n)) return "frente";
  if (meio.includes(n)) return "meio";
  return "fundo";
}

export function zoneLabel(zone) {
  if (zone === "frente") return "ponta da frente";
  if (zone === "meio") return "meio";
  if (zone === "fundo") return "ponta de trás";
  if (zone === "qualquer") return "qualquer carro";
  return "ainda não sabemos";
}

/**
 * Only rows the public record actually constrains.
 * direction omitted = both sentidos.
 */
export const SEED_CELLS = [
  {
    stationId: "se",
    lineId: "1",
    intent: "transfer",
    transferTo: "3",
    zone: "meio",
    why: "transferência vertical no cruzamento das linhas, no centro da plataforma",
    sourceUrl: "https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-1-azul/estacao-se/",
  },
  {
    stationId: "se",
    lineId: "3",
    intent: "transfer",
    transferTo: "1",
    zone: "meio",
    why: "transferência vertical no cruzamento das linhas, no centro da plataforma",
    sourceUrl: "https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-1-azul/estacao-se/",
  },
  {
    stationId: "paraiso",
    lineId: "1",
    intent: "transfer",
    transferTo: "2",
    zone: "qualquer",
    why: "integração paralela ao longo da plataforma — o carro muda pouco a caminhada",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Para%C3%ADso_(Metr%C3%B4_de_S%C3%A3o_Paulo)",
  },
  {
    stationId: "paraiso",
    lineId: "2",
    intent: "transfer",
    transferTo: "1",
    zone: "qualquer",
    why: "integração paralela ao longo da plataforma — o carro muda pouco a caminhada",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Para%C3%ADso_(Metr%C3%B4_de_S%C3%A3o_Paulo)",
  },
  {
    stationId: "ana-rosa",
    lineId: "1",
    intent: "transfer",
    transferTo: "2",
    zone: "qualquer",
    why: "integração paralela — qualquer carro serve",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Ana_Rosa",
  },
  {
    stationId: "ana-rosa",
    lineId: "2",
    intent: "transfer",
    transferTo: "1",
    zone: "qualquer",
    why: "integração paralela — qualquer carro serve",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Ana_Rosa",
  },
  {
    stationId: "consolacao",
    lineId: "2",
    intent: "transfer",
    transferTo: "4",
    zone: "qualquer",
    why: "túnel longo até a 4-Amarela — prepare-se pra andar, o carro quase não muda",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Consola%C3%A7%C3%A3o",
  },
  {
    stationId: "paulista",
    lineId: "4",
    intent: "transfer",
    transferTo: "2",
    zone: "qualquer",
    why: "túnel longo até a 2-Verde — o carro quase não muda a caminhada",
    sourceUrl: "https://pt.wikipedia.org/wiki/Esta%C3%A7%C3%A3o_Paulista",
  },
  {
    stationId: "luz",
    lineId: "1",
    intent: "transfer",
    transferTo: "4",
    zone: "qualquer",
    why: "baldeação L1↔L4 é um corredor entre níveis — o carro ajuda pouco",
    sourceUrl: "https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-1-azul/estacao-luz/",
  },
  {
    stationId: "luz",
    lineId: "4",
    intent: "transfer",
    transferTo: "1",
    zone: "qualquer",
    why: "baldeação L4↔L1 é um corredor entre níveis — o carro ajuda pouco",
    sourceUrl: "https://www.metro.sp.gov.br/sua-viagem/linhas-estacoes/linha-1-azul/estacao-luz/",
  },
];

export function findSeed({ stationId, lineId, intent, transferTo, direction }) {
  const xfer = intent === "transfer" ? transferTo : null;
  return (
    SEED_CELLS.find(
      (c) =>
        c.stationId === stationId &&
        c.lineId === lineId &&
        c.intent === intent &&
        (c.transferTo || null) === (xfer || null) &&
        (!c.direction || c.direction === direction)
    ) || null
  );
}

export function getAdvice({
  stationId,
  lineId,
  intent,
  transferTo,
  direction,
  published,
} = {}) {
  const carCount = LINES[lineId]?.cars ?? 6;
  const xfer = intent === "transfer" ? transferTo : null;
  const exact = cellKey({ stationId, lineId, direction, intent, transferTo: xfer });
  const anyDir = cellKey({ stationId, lineId, direction: null, intent, transferTo: xfer });
  const user = published?.[exact] || published?.[anyDir];
  const seed = findSeed({ stationId, lineId, intent, transferTo: xfer, direction });

  let zone = "unknown";
  let origin = "none";
  let why = null;
  let sourceUrl = null;

  if (user?.zone) {
    zone = user.zone;
    origin = "users";
    why = user.why || null;
  } else if (seed) {
    zone = seed.zone;
    origin = "seed";
    why = seed.why;
    sourceUrl = seed.sourceUrl;
  }

  const mapped = zoneToCars(zone, carCount);
  return {
    cars: mapped.cars,
    any: mapped.any,
    unknown: zone === "unknown",
    zone,
    origin,
    why,
    sourceUrl,
    carCount,
    confidence: origin === "users" ? "users" : origin === "seed" ? "seed" : "unknown",
  };
}
