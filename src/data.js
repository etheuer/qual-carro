/** São Paulo metro graph + inferred car advice.
 *  Platform types: Wikipedia / Metro SP station pages.
 *  Train length: Metro SP transparência 2026 (6 cars; Line 15 = 7).
 *  Car positions are inferred until surveyed — never claimed as official.
 */

export const LINES = {
  "1": {
    id: "1",
    short: "1",
    name: "1-Azul",
    color: "#0B5BD3",
    ink: "#ffffff",
    cars: 6,
    terminals: ["Tucuruvi", "Jabaquara"],
  },
  "2": {
    id: "2",
    short: "2",
    name: "2-Verde",
    color: "#0A7A38",
    ink: "#ffffff",
    cars: 6,
    terminals: ["Vila Madalena", "Vila Prudente"],
  },
  "3": {
    id: "3",
    short: "3",
    name: "3-Vermelha",
    color: "#D01212",
    ink: "#ffffff",
    cars: 6,
    terminals: ["Palmeiras-Barra Funda", "Corinthians-Itaquera"],
  },
  "4": {
    id: "4",
    short: "4",
    name: "4-Amarela",
    color: "#E2B400",
    ink: "#1A1714",
    cars: 6,
    terminals: ["Luz", "Vila Sônia"],
  },
  "5": {
    id: "5",
    short: "5",
    name: "5-Lilás",
    color: "#8A3488",
    ink: "#ffffff",
    cars: 6,
    terminals: ["Capão Redondo", "Chácara Klabin"],
  },
  "15": {
    id: "15",
    short: "15",
    name: "15-Prata",
    color: "#7A7D80",
    ink: "#ffffff",
    cars: 7,
    terminals: ["Vila Prudente", "Jardim Colonial"],
  },
  "7": {
    id: "7",
    short: "7",
    name: "7-Rubi",
    color: "#A5142A",
    ink: "#ffffff",
    cars: 8,
    terminals: ["Luz", "Jundiaí"],
    commuter: true,
  },
  "8": {
    id: "8",
    short: "8",
    name: "8-Diamante",
    color: "#9A9084",
    ink: "#1A1714",
    cars: 8,
    terminals: ["Júlio Prestes", "Itapevi"],
    commuter: true,
  },
  "9": {
    id: "9",
    short: "9",
    name: "9-Esmeralda",
    color: "#00A07A",
    ink: "#ffffff",
    cars: 8,
    terminals: ["Osasco", "Varginha"],
    commuter: true,
  },
  "10": {
    id: "10",
    short: "10",
    name: "10-Turquesa",
    color: "#007C78",
    ink: "#ffffff",
    cars: 8,
    terminals: ["Brás", "Rio Grande da Serra"],
    commuter: true,
  },
  "11": {
    id: "11",
    short: "11",
    name: "11-Coral",
    color: "#E24A16",
    ink: "#ffffff",
    cars: 8,
    terminals: ["Luz", "Estudantes"],
    commuter: true,
  },
  "12": {
    id: "12",
    short: "12",
    name: "12-Safira",
    color: "#1A6BA8",
    ink: "#ffffff",
    cars: 8,
    terminals: ["Brás", "Calmon Viana"],
    commuter: true,
  },
};

/** Station order toward terminals[1] (south/east-ish). Reverse for the other terminal. */
export const LINE_ORDER = {
  "1": [
    "tucuruvi",
    "parada-inglesa",
    "jardim-sao-paulo",
    "santana",
    "carandiru",
    "portuguesa-tiete",
    "armenia",
    "tiradentes",
    "luz",
    "sao-bento",
    "se",
    "japao-liberdade",
    "sao-joaquim",
    "vergueiro",
    "paraiso",
    "ana-rosa",
    "vila-mariana",
    "santa-cruz",
    "praca-da-arvore",
    "saude",
    "sao-judas",
    "conceicao",
    "jabaquara",
  ],
  "2": [
    "vila-madalena",
    "sumare",
    "clinicas",
    "consolacao",
    "trianon-masp",
    "brigadeiro",
    "paraiso",
    "ana-rosa",
    "chacara-klabin",
    "santos-imigrantes",
    "alto-do-ipiranga",
    "sacoma",
    "tamanduatei",
    "vila-prudente",
  ],
  "3": [
    "barra-funda",
    "marechal-deodoro",
    "santa-cecilia",
    "republica",
    "anhangabau",
    "se",
    "pedro-ii",
    "bras",
    "bresser-mooca",
    "belem",
    "tatuape",
    "carrao",
    "penha",
    "vila-matilde",
    "guilhermina-esperanca",
    "patriarca",
    "artur-alvim",
    "corinthians-itaquera",
  ],
  "4": [
    "luz",
    "republica",
    "higienopolis-mackenzie",
    "paulista",
    "oscar-freire",
    "fradique-coutinho",
    "faria-lima",
    "pinheiros",
    "butanta",
    "sao-paulo-morumbi",
    "vila-sonia",
  ],
  "5": [
    "capao-redondo",
    "campo-limpo",
    "vila-das-belezas",
    "giovanni-gronchi",
    "santo-amaro",
    "largo-treze",
    "adolfo-pinheiro",
    "alto-da-boa-vista",
    "borba-gato",
    "brooklin",
    "campo-belo",
    "eucaliptos",
    "moema",
    "aacd-servidor",
    "hospital-sao-paulo",
    "santa-cruz",
    "chacara-klabin",
  ],
  "15": [
    "vila-prudente",
    "oratorio",
    "sao-lucas",
    "camilo-haddad",
    "vila-tolstoi",
    "vila-uniao",
    "jardim-planalto",
    "sapopemba",
    "fazenda-da-juta",
    "sao-mateus",
    "jardim-colonial",
  ],
};

export const STATION_NAMES = {
  tucuruvi: "Tucuruvi",
  "parada-inglesa": "Parada Inglesa",
  "jardim-sao-paulo": "Jardim São Paulo-Ayrton Senna",
  santana: "Santana",
  carandiru: "Carandiru",
  "portuguesa-tiete": "Portuguesa-Tietê",
  armenia: "Armênia",
  tiradentes: "Tiradentes",
  luz: "Luz",
  "sao-bento": "São Bento",
  se: "Sé",
  "japao-liberdade": "Japão-Liberdade",
  "sao-joaquim": "São Joaquim",
  vergueiro: "Vergueiro-Sebrae",
  paraiso: "Paraíso",
  "ana-rosa": "Ana Rosa",
  "vila-mariana": "Vila Mariana",
  "santa-cruz": "Santa Cruz",
  "praca-da-arvore": "Praça da Árvore",
  saude: "Saúde-Ultrafarma",
  "sao-judas": "São Judas",
  conceicao: "Conceição",
  jabaquara: "Jabaquara",
  "vila-madalena": "Vila Madalena",
  sumare: "Santuário N.S. de Fátima-Sumaré",
  clinicas: "Clínicas",
  consolacao: "Consolação",
  "trianon-masp": "Trianon-Masp",
  brigadeiro: "Brigadeiro",
  "chacara-klabin": "Chácara Klabin",
  "santos-imigrantes": "Santos-Imigrantes",
  "alto-do-ipiranga": "Alto do Ipiranga",
  sacoma: "Sacomã",
  tamanduatei: "Tamanduateí",
  "vila-prudente": "Vila Prudente",
  "barra-funda": "Palmeiras-Barra Funda",
  "marechal-deodoro": "Marechal Deodoro",
  "santa-cecilia": "Santa Cecília",
  republica: "República",
  anhangabau: "Anhangabaú",
  "pedro-ii": "Pedro II",
  bras: "Brás",
  "bresser-mooca": "Bresser-Moóca",
  belem: "Belém",
  tatuape: "Tatuapé",
  carrao: "Carrão-Assaí Atacadista",
  penha: "Penha-Lojas Besni",
  "vila-matilde": "Vila Matilde",
  "guilhermina-esperanca": "Guilhermina-Esperança",
  patriarca: "Patriarca-Vila Ré",
  "artur-alvim": "Artur Alvim",
  "corinthians-itaquera": "Corinthians-Itaquera",
  "higienopolis-mackenzie": "Higienópolis-Mackenzie",
  paulista: "Paulista",
  "oscar-freire": "Oscar Freire",
  "fradique-coutinho": "Fradique Coutinho",
  "faria-lima": "Faria Lima",
  pinheiros: "Pinheiros",
  butanta: "Butantã",
  "sao-paulo-morumbi": "São Paulo-Morumbi",
  "vila-sonia": "Vila Sônia",
  "capao-redondo": "Capão Redondo",
  "campo-limpo": "Campo Limpo",
  "vila-das-belezas": "Vila das Belezas",
  "giovanni-gronchi": "Giovanni Gronchi",
  "santo-amaro": "Santo Amaro",
  "largo-treze": "Largo Treze",
  "adolfo-pinheiro": "Adolfo Pinheiro",
  "alto-da-boa-vista": "Alto da Boa Vista",
  "borba-gato": "Borba Gato",
  brooklin: "Brooklin",
  "campo-belo": "Campo Belo",
  eucaliptos: "Eucaliptos",
  moema: "Moema",
  "aacd-servidor": "AACD-Servidor",
  "hospital-sao-paulo": "Hospital São Paulo",
  oratorio: "Oratório",
  "sao-lucas": "São Lucas",
  "camilo-haddad": "Camilo Haddad",
  "vila-tolstoi": "Vila Tolstói",
  "vila-uniao": "Vila União",
  "jardim-planalto": "Jardim Planalto",
  sapopemba: "Sapopemba",
  "fazenda-da-juta": "Fazenda da Juta",
  "sao-mateus": "São Mateus",
  "jardim-colonial": "Jardim Colonial",
};

/** Extra commuter lines that only appear as transfer targets at metro stations. */
export const COMMUTER_AT = {
  luz: ["7", "11"],
  "barra-funda": ["7", "8"],
  bras: ["10", "11", "12"],
  tatuape: ["11", "12"],
  tamanduatei: ["10"],
  pinheiros: ["9"],
  "corinthians-itaquera": ["11"],
  "santo-amaro": ["9"],
};

const ENDS_WHY =
  "circulação vertical (escada rolante / fixa) costuma ficar nas pontas da plataforma";

function ends(n) {
  return n <= 4 ? [1, n] : [1, 2, n - 1, n];
}

function middle(n) {
  if (n === 6) return [3, 4];
  if (n === 7) return [3, 4, 5];
  const a = Math.ceil(n / 2);
  return [a, a + 1].filter((c) => c >= 1 && c <= n);
}

/**
 * Per-station overrides. Missing keys fall back to ends of the platform.
 * confidence is always inferred in this MVP unless noted.
 */
export const ADVICE = {
  se: {
    note: "Linhas 1 e 3 se cruzam no centro, sob a claraboia. Plataforma espanhola (central + laterais) em cada nível.",
    source: "Metro SP + Wikipedia: plataformas central e laterais; claraboia no eixo do cruzamento",
    "1": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: {
        cars: "ends",
        why: "acessos norte e sul da Praça da Sé nas pontas do mezanino",
      },
      transfer: {
        "3": {
          cars: "middle",
          why: "transferência vertical no cruzamento das linhas, no centro da plataforma",
        },
      },
    },
    "3": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: {
        cars: "ends",
        why: "acessos da Praça da Sé nas pontas do mezanino",
      },
      transfer: {
        "1": {
          cars: "middle",
          why: "transferência vertical no cruzamento das linhas, no centro da plataforma",
        },
      },
    },
  },
  paraiso: {
    note: "L1 e L2 correm em paralelo. Integração é curta, em vários pontos da plataforma.",
    source: "geometria paralela clássica L1/L2",
    "1": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "2": {
          cars: "any",
          why: "integração paralela ao longo da plataforma — o carro muda pouco a caminhada",
        },
      },
    },
    "2": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "1": {
          cars: "any",
          why: "integração paralela ao longo da plataforma — o carro muda pouco a caminhada",
        },
      },
    },
  },
  "ana-rosa": {
    note: "Mesmo padrão de Paraíso: L1 e L2 em paralelo.",
    source: "geometria paralela clássica L1/L2",
    "1": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "2": {
          cars: "any",
          why: "integração paralela — qualquer carro serve",
        },
      },
    },
    "2": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "1": {
          cars: "any",
          why: "integração paralela — qualquer carro serve",
        },
      },
    },
  },
  consolacao: {
    note: "Túnel de ~300 m até Paulista (L4). Carro quase não muda o tempo de caminhada.",
    source: "comprimento publicado da ligação Consolação–Paulista",
    "2": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "4": {
          cars: "any",
          why: "túnel longo até a 4-Amarela — prepare-se pra andar, o carro quase não muda",
        },
      },
    },
  },
  paulista: {
    note: "Ligação longa com Consolação (L2).",
    source: "comprimento publicado da ligação Consolação–Paulista",
    "4": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "2": {
          cars: "any",
          why: "túnel longo até a 2-Verde — o carro quase não muda a caminhada",
        },
      },
    },
  },
  luz: {
    note: "Caixa de integração L1, L4 e trens metropolitanos. Caminhadas longas entre níveis.",
    source: "estação de integração oficial Metro/CPTM",
    "1": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "4": {
          cars: "any",
          why: "baldeação L1↔L4 é um corredor entre níveis — o carro ajuda pouco",
        },
        "7": { cars: "ends", why: "saídas para o hall da CPTM nas pontas" },
        "11": { cars: "ends", why: "saídas para o hall da CPTM nas pontas" },
      },
    },
    "4": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "1": {
          cars: "any",
          why: "baldeação L4↔L1 é um corredor entre níveis — o carro ajuda pouco",
        },
        "7": { cars: "ends", why: "hall compartilhado com a CPTM" },
        "11": { cars: "ends", why: "hall compartilhado com a CPTM" },
      },
    },
  },
  republica: {
    note: "L3 no nível superior (plataforma espanhola), L4 abaixo.",
    source: "Wikipedia: República com plataformas laterais e central na L3",
    "3": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "4": {
          cars: "ends",
          why: "descida para a 4-Amarela pelas pontas do mezanino",
        },
      },
    },
    "4": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "3": {
          cars: "ends",
          why: "subida para a 3-Vermelha pelas pontas da plataforma",
        },
      },
    },
  },
  "santa-cruz": {
    note: "Integração L1 e L5 em níveis diferentes.",
    source: "estação de integração oficial L1/L5",
    "1": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "5": { cars: "ends", why: "ligação com a 5-Lilás nas pontas / blocos de escada" },
      },
    },
    "5": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "1": { cars: "ends", why: "ligação com a 1-Azul nas pontas / blocos de escada" },
      },
    },
  },
  "chacara-klabin": {
    note: "Integração L2 e L5.",
    source: "estação de integração oficial L2/L5",
    "2": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "5": { cars: "ends", why: "blocos de escada da integração nas pontas" },
      },
    },
    "5": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "2": { cars: "ends", why: "blocos de escada da integração nas pontas" },
      },
    },
  },
  "vila-prudente": {
    note: "Complexo L2 + monotrilho L15. Integração em um extremo da L2.",
    source: "Metro SP: obras de integração Vila Prudente L2/L15",
    "2": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "15": {
          cars: "ends",
          why: "passagem para o monotrilho nas pontas do complexo",
        },
      },
    },
    "15": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "2": {
          cars: "ends",
          why: "passagem para a 2-Verde nas pontas do complexo",
        },
      },
    },
  },
  tamanduatei: {
    note: "L2 elevada com plataformas laterais, mezanino comum com a L10.",
    source: "Metro SP: plataformas laterais, mezanino compartilhado com a CPTM",
    "2": {
      escada: { cars: "ends", why: "dois conjuntos de escadas perpendiculares às plataformas" },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "10": {
          cars: "ends",
          why: "mezanino comum com a 10-Turquesa — escadas nas pontas",
        },
      },
    },
  },
  pinheiros: {
    note: "L4 com integração à L9 no hall.",
    source: "estação de integração oficial L4/L9",
    "4": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "9": { cars: "ends", why: "saída para a 9-Esmeralda pelo hall nas pontas" },
      },
    },
  },
  "barra-funda": {
    note: "Plataforma espanhola na L3; integração com trens no mesmo complexo.",
    source: "Wikipedia: Barra Funda com plataformas laterais e central",
    "3": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "7": { cars: "ends", why: "ligação com a CPTM pelo hall nas pontas" },
        "8": { cars: "ends", why: "ligação com a CPTM pelo hall nas pontas" },
      },
    },
  },
  bras: {
    note: "L3 elevada, integração CPTM (L10/L11/L12) no mesmo complexo.",
    source: "estação de integração oficial L3/CPTM",
    "3": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "10": { cars: "ends", why: "passagem para os trens nas pontas do complexo" },
        "11": { cars: "ends", why: "passagem para os trens nas pontas do complexo" },
        "12": { cars: "ends", why: "passagem para os trens nas pontas do complexo" },
      },
    },
  },
  tatuape: {
    note: "L3 com plataformas laterais e central; CPTM L11/L12 no mesmo complexo.",
    source: "Wikipedia: Tatuapé com plataformas laterais e central",
    "3": {
      escada: { cars: "ends", why: ENDS_WHY },
      saida: { cars: "ends", why: ENDS_WHY },
      transfer: {
        "11": { cars: "ends", why: "passagem para os trens nas pontas do complexo" },
        "12": { cars: "ends", why: "passagem para os trens nas pontas do complexo" },
      },
    },
  },
  "sao-bento": {
    note: "Uma das mais profundas da L1. Escadas longas nas pontas.",
    source: "profundidade conhecida da estação São Bento",
    "1": {
      escada: { cars: "ends", why: "escadas rolantes longas nas pontas — evita o meio" },
      saida: { cars: "ends", why: ENDS_WHY },
    },
  },
  "alto-do-ipiranga": {
    note: "Plataformas laterais, 24 m de profundidade, 10 escadas rolantes.",
    source: "página oficial da estação Alto do Ipiranga",
    "2": {
      escada: { cars: "ends", why: "plataformas laterais com circulação vertical nas pontas" },
      saida: { cars: "ends", why: ENDS_WHY },
    },
  },
};

export function linesAt(stationId) {
  const lines = [];
  for (const [lineId, order] of Object.entries(LINE_ORDER)) {
    if (order.includes(stationId)) lines.push(lineId);
  }
  for (const extra of COMMUTER_AT[stationId] || []) {
    if (!lines.includes(extra)) lines.push(extra);
  }
  return lines;
}

export function allStations() {
  return Object.keys(STATION_NAMES)
    .map((id) => ({
      id,
      name: STATION_NAMES[id],
      lines: linesAt(id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function resolveCars(token, carCount) {
  if (token === "ends") return ends(carCount);
  if (token === "middle") return middle(carCount);
  if (token === "any") return Array.from({ length: carCount }, (_, i) => i + 1);
  if (Array.isArray(token)) return token;
  return ends(carCount);
}

export function getAdvice(stationId, lineId, intent, transferTo) {
  const carCount = LINES[lineId]?.cars ?? 6;
  const station = ADVICE[stationId];
  const lineAdv = station?.[lineId];
  let spec;
  if (intent === "transfer" && transferTo) {
    spec = lineAdv?.transfer?.[transferTo];
  } else if (intent === "saida") {
    spec = lineAdv?.saida;
  } else {
    spec = lineAdv?.escada;
  }
  if (!spec) {
    spec = { cars: "ends", why: ENDS_WHY };
  }
  return {
    cars: resolveCars(spec.cars, carCount),
    why: spec.why,
    any: spec.cars === "any",
    confidence: "inferred",
    note: station?.note ?? null,
    source: station?.source ?? "padrão das pontas da plataforma (ainda sem visita de campo)",
    carCount,
  };
}

export function fold(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokens(s) {
  return s.split(/[\s\-–—/]+/).filter(Boolean);
}

export function searchStations(query) {
  const q = fold(query);
  if (!q) return allStations();
  return allStations()
    .map((st) => {
      const name = fold(st.name);
      const id = fold(st.id);
      let score = 0;
      if (name.startsWith(q) || id.startsWith(q)) score = 4;
      else if (tokens(name).some((t) => t.startsWith(q)) || tokens(id).some((t) => t.startsWith(q))) {
        score = q.length >= 3 ? 3 : 0;
      } else if (q.length >= 3 && (name.includes(q) || id.includes(q))) score = 2;
      else if (q.length >= 3 && q.split(/\s+/).every((p) => name.includes(p))) score = 1;
      return { ...st, score };
    })
    .filter((st) => st.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "pt-BR"));
}
