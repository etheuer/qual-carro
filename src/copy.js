import { PUBLISH_MIN, progressLine } from "./marks.js";
import { formatCars, intentPhrase, stationTitle } from "./lookup.js";

export const SPLASH_TITLE = "Qual carro?";
export const SPLASH_PROMISE = "Pra não andar a plataforma inteira.";
export const SPLASH_NEXT = "Fala onde desce. A gente mostra o carro.";

export const HOME_LEDE = "Entra no carro errado e você anda a plataforma inteira.";
export const HOME_BOARD = "Os carros pintados são onde entrar.";
export const NEED_DIRECTION = "Escolhe o sentido pra ver em qual carro entrar.";

export const UNKNOWN_HEADLINE = "Ainda sem posição";
export const UNKNOWN_CONTRIBUTE =
  "Fala se ficou na frente, no meio ou atrás. Com 5 neste sentido a gente pinta os carros e para de perguntar.";

export const ZONE_NAME = { frente: "Frente", meio: "Meio", fundo: "Trás" };

function sentence(s) {
  const t = String(s || "").trim();
  if (!t) return "";
  const head = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(head) ? head : `${head}.`;
}

export function afterVoteLine(cell, myZone) {
  if (!myZone) return null;
  if (cell?.published) return null;
  const n = cell?.n || 0;
  if (n > 0 && n < PUBLISH_MIN) {
    const left = PUBLISH_MIN - n;
    if (left === 1) return "Já entrou. Falta 1 neste sentido pra pintar.";
    return `Já entrou. Faltam ${left} neste sentido pra pintar.`;
  }
  if (n >= PUBLISH_MIN) {
    return "Já entrou. Assim que fechar neste sentido, pinta e para de perguntar.";
  }
  return "Já entrou. Com 5 neste sentido a gente pinta e para de perguntar.";
}

/** The question under an unsettled board, named for where the rider was heading. */
export function askLine(adv) {
  const place =
    adv.intent === "transfer" ? "a integração" : adv.intent === "saida" ? "a saída" : "a escada";
  return adv.origin === "seed" ? `Confere: onde ficou ${place}?` : `Onde ficou ${place}?`;
}

/** Why the board shows what it shows. tone: confirmed | estimate | info. */
export function sourceLine(adv, cell) {
  if (adv.unknown) return null;
  if (adv.origin === "users") {
    const name = ZONE_NAME[adv.zone];
    const agree = cell?.counts?.[adv.zone];
    if (name && cell?.n && agree) {
      return {
        tone: "confirmed",
        text: `Confirmado: ${agree} de ${cell.n} marcaram ${name} neste sentido.`,
      };
    }
    return { tone: "confirmed", text: "Confirmado neste sentido." };
  }
  if (adv.origin === "seed") {
    if (adv.confident) return { tone: "info", text: sentence(adv.why) };
    return { tone: "estimate", text: `Estimativa: ${adv.why}.` };
  }
  return null;
}

/** The line under Frente/Meio/Trás. */
export function voteFootnote(adv, cell, myZone) {
  const voted = afterVoteLine(cell, myZone);
  if (voted) return { tone: "voted", text: voted };
  const progress = progressLine(cell);
  if (progress) return { tone: "info", text: progress };
  return adv.unknown ? { tone: "info", text: UNKNOWN_CONTRIBUTE } : null;
}

/** Everything the result board says, in reading order. */
export function boardCopy(adv, cell, myZone) {
  const cars = formatCars(adv.cars, adv.any);
  const asking = Boolean(adv.asking);
  return {
    headline: adv.unknown ? UNKNOWN_HEADLINE : cars[0].toUpperCase() + cars.slice(1),
    context: `${adv.routed ? `Embarque em ${stationTitle(adv.boardFromId)}. ` : ""}${intentPhrase(adv)}.`,
    source: sourceLine(adv, cell),
    ask: asking ? askLine(adv) : null,
    footnote: asking ? voteFootnote(adv, cell, myZone) : null,
  };
}
