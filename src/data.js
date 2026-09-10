/** São Paulo metro graph.
 *  Train length: Metro SP transparência 2026 (6 cars; Line 15 = 7).
 *  Car positions live in cells.js — seed only what public sources constrain.
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
