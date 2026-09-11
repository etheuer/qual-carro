import { PUBLISH_MIN } from "./marks.js";

export const SPLASH_TITLE = "Qual carro?";
export const SPLASH_PROMISE = "Pra não andar a plataforma inteira.";
export const SPLASH_NEXT = "Fala onde desce. A gente mostra o carro.";

export const HOME_LEDE = "Entra no carro errado e você anda a plataforma inteira.";
export const HOME_NEXT = "Fala onde desce. A gente mostra em qual entrar.";
export const HOME_BOARD = "Os carros pintados são onde entrar. Carro 1 é a frente.";

export const UNKNOWN_HEADLINE = "Ainda sem posição";
export const UNKNOWN_CONTRIBUTE =
  "Fala se ficou na frente, no meio ou atrás. Com 5 neste sentido a gente pinta os carros e para de perguntar.";
export const SEED_CONFERE = "Estimativa. Bateu? Se apontar, ajuda a fechar aqui.";

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
