import {
  ADVICE,
  COMMUTER_AT,
  LINES,
  LINE_ORDER,
  STATION_NAMES,
  getAdvice,
  linesAt,
  searchStations,
} from "./data.js";
import { findPath, firstAlighting } from "./router.js";

const $ = (sel, root = document) => root.querySelector(sel);

const state = {
  destId: null,
  originId: null,
  lineId: null,
  direction: null,
  intent: "escada",
  transferTo: null,
  destOpen: false,
  originOpen: false,
};

const FEEDBACK_KEY = "qual-carro-feedback";

function lineColor(id) {
  return LINES[id]?.color ?? "#888";
}

function lineInk(id) {
  return LINES[id]?.ink ?? "#fff";
}

function stationTitle(id) {
  return STATION_NAMES[id] ?? id;
}

function formatCars(cars, any) {
  if (any) return "qualquer carro";
  const sorted = [...new Set(cars)].sort((a, b) => a - b);
  if (sorted.length === 1) return `carro ${sorted[0]}`;
  const runs = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    runs.push(start === prev ? `${start}` : `${start} e ${prev}`);
    start = n;
    prev = n;
  }
  if (runs.length === 1) {
    const s = sorted;
    if (s.length === 2) return `carros ${s[0]} e ${s[1]}`;
    return `carros ${s[0]}–${s[s.length - 1]}`;
  }
  return `carros ${runs.join(", ou ")}`;
}

function metroLines(stationId) {
  return linesAt(stationId).filter((id) => LINE_ORDER[id]);
}

function transferOptions(stationId, lineId) {
  const fromAdvice = ADVICE[stationId]?.[lineId]?.transfer
    ? Object.keys(ADVICE[stationId][lineId].transfer)
    : [];
  const present = linesAt(stationId).filter((id) => id !== lineId);
  const ids = [...new Set([...fromAdvice, ...present])];
  return ids.filter((id) => LINES[id]);
}

function paintChrome() {
  const line = state.lineId && LINES[state.lineId];
  document.documentElement.style.setProperty("--line", line ? line.color : "#8d7f72");
  document.documentElement.style.setProperty("--line-ink", line ? line.ink : "#f3eadc");
  document.body.dataset.line = state.lineId || "";
}

function render() {
  renderField("dest");
  renderField("origin");
  renderLineDir();
  paintChrome();
  renderIntent();
  renderResult();
  writeQuery();
  const clear = $("#clear-origin");
  clear.hidden = !state.originId && !$("#origin-input").value;
}

function renderField(kind) {
  const isDest = kind === "dest";
  const id = isDest ? state.destId : state.originId;
  const open = isDest ? state.destOpen : state.originOpen;
  const input = $(isDest ? "#dest-input" : "#origin-input");
  const list = $(isDest ? "#dest-list" : "#origin-list");
  if (id && document.activeElement !== input) {
    input.value = stationTitle(id);
  }
  input.setAttribute("aria-expanded", open ? "true" : "false");
  if (!open) {
    list.hidden = true;
    list.innerHTML = "";
    return;
  }
  const q = input.value;
  let hits = searchStations(q);
  if (!isDest && state.destId) {
    hits = hits.filter((s) => s.id !== state.destId);
  }
  if (isDest && state.originId) {
    hits = hits.filter((s) => s.id !== state.originId);
  }
  hits = hits.slice(0, 12);
  list.hidden = hits.length === 0;
  list.innerHTML = hits
    .map((st) => {
      const chips = st.lines
        .filter((lid) => LINE_ORDER[lid] || (COMMUTER_AT[st.id] || []).includes(lid))
        .slice(0, 4)
        .map(
          (lid) =>
            `<i class="mini-line" style="background:${lineColor(lid)};color:${lineInk(lid)}">${LINES[lid].short}</i>`
        )
        .join("");
      return `<button type="button" class="suggest" role="option" data-id="${st.id}">
        <span>${st.name}</span>
        <span class="chips">${chips}</span>
      </button>`;
    })
    .join("");
}

function renderLineDir() {
  const box = $("#ride");
  if (!state.destId) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }

  const path =
    state.originId && state.destId ? findPath(state.originId, state.destId) : null;
  const routed = path && path.legs;

  if (routed) {
    box.hidden = false;
    const first = path.legs[0];
    state.lineId = first.lineId;
    state.direction = first.direction;
    const steps = path.legs
      .map((leg, idx) => {
        const line = LINES[leg.lineId];
        const extra = leg.transferTo
          ? ` → ${LINES[leg.transferTo].name} em ${stationTitle(leg.transferAt)}`
          : "";
        return `<li>
          <i class="mini-line" style="background:${line.color};color:${line.ink}">${line.short}</i>
          ${stationTitle(leg.fromId)} até ${stationTitle(leg.toId)}
          <em>sentido ${leg.direction}</em>${extra}
        </li>`;
      })
      .join("");
    box.innerHTML = `
      <p class="ride-kicker">Rota</p>
      <ol class="legs">${steps}</ol>
    `;
    void first;
    return;
  }

  const lines = metroLines(state.destId);
  if (!lines.length) {
    box.hidden = true;
    return;
  }
  if (!state.lineId || !lines.includes(state.lineId)) {
    state.lineId = lines[0];
    state.direction = null;
  }
  const line = LINES[state.lineId];
  const dirs = line.terminals;
  box.hidden = false;
  box.innerHTML = `
    ${
      lines.length > 1
        ? `<div class="line-row" role="radiogroup" aria-label="Linha">
            ${lines
              .map(
                (id) => `<button type="button" class="line-chip ${state.lineId === id ? "is-on" : ""}" data-line="${id}" style="--c:${lineColor(id)};--ink:${lineInk(id)}">
                  <b>${LINES[id].short}</b> ${LINES[id].name.replace(/^\d+-/, "")}
                </button>`
              )
              .join("")}
          </div>`
        : `<p class="one-line"><i class="mini-line" style="background:${line.color};color:${line.ink}">${line.short}</i> ${line.name}</p>`
    }
    <div class="dir-row" role="radiogroup" aria-label="Sentido">
      ${dirs
        .map(
          (t) => `<button type="button" class="dir ${state.direction === t ? "is-on" : ""}" data-dir="${t}">
            sentido <strong>${t}</strong>
          </button>`
        )
        .join("")}
    </div>
  `;
}

function renderIntent() {
  const box = $("#intent");
  const routed = state.originId && state.destId && findPath(state.originId, state.destId).legs;
  if (!state.destId || !state.lineId || routed) {
    box.hidden = true;
    box.innerHTML = "";
    return;
  }
  const transfers = transferOptions(state.destId, state.lineId);
  if (state.intent === "transfer" && !transfers.includes(state.transferTo)) {
    state.transferTo = transfers[0] || null;
    if (!state.transferTo) state.intent = "escada";
  }
  const items = [
    ["escada", "Escada"],
    ["saida", "Saída da rua"],
  ];
  box.hidden = false;
  box.innerHTML = `
    <div class="intent-row" role="radiogroup" aria-label="O que você quer alcançar">
      ${items
        .map(
          ([id, label]) =>
            `<button type="button" class="intent ${state.intent === id ? "is-on" : ""}" data-intent="${id}">${label}</button>`
        )
        .join("")}
      ${
        transfers.length
          ? `<button type="button" class="intent ${state.intent === "transfer" ? "is-on" : ""}" data-intent="transfer">Integração</button>`
          : ""
      }
    </div>
    ${
      state.intent === "transfer" && transfers.length
        ? `<div class="xfer-row">${transfers
            .map(
              (id) =>
                `<button type="button" class="xfer ${state.transferTo === id ? "is-on" : ""}" data-xfer="${id}" style="--c:${lineColor(id)};--ink:${lineInk(id)}">${LINES[id].name}</button>`
            )
            .join("")}</div>`
        : ""
    }
  `;
}

function currentAdvice() {
  if (!state.destId) return null;
  const path = state.originId ? findPath(state.originId, state.destId) : null;
  if (path?.error === "same") return { error: "Mesma estação nos dois campos." };
  if (path?.error === "no-path") return { error: "Não achei rota no metrô entre essas duas." };
  if (path?.legs) {
    const alight = firstAlighting(path);
    if (!alight) return { error: "Não achei rota no metrô entre essas duas." };
    const adv = getAdvice(alight.stationId, alight.lineId, alight.intent, alight.transferTo);
    return {
      ...adv,
      lineId: alight.lineId,
      direction: alight.direction,
      stationId: alight.stationId,
      intent: alight.intent,
      transferTo: alight.transferTo,
      boardFromId: alight.boardFromId,
      routed: true,
      path,
    };
  }
  if (!state.lineId || !state.direction) return { need: "dir" };
  const adv = getAdvice(
    state.destId,
    state.lineId,
    state.intent,
    state.intent === "transfer" ? state.transferTo : null
  );
  return {
    ...adv,
    lineId: state.lineId,
    direction: state.direction,
    stationId: state.destId,
    intent: state.intent,
    transferTo: state.transferTo,
    routed: false,
  };
}

function renderTrain(carCount, active, any) {
  const cars = Array.from({ length: carCount }, (_, i) => i + 1);
  const cabW = 16;
  const gap = 4;
  const pad = 8;
  const inner = 360 - pad * 2;
  const carW = (inner - cabW - gap * carCount) / carCount;
  const h = 72;
  const line = state.lineId && LINES[state.lineId];
  const onFill = line?.color ?? "#8d7f72";
  const onInk = line?.ink ?? "#f3eadc";
  const offFill = "#3a342e";
  const offInk = "#8f8378";
  const carRects = cars
    .map((n, i) => {
      const x = pad + cabW + gap + i * (carW + gap);
      const on = any || active.includes(n);
      return `<g>
        <rect x="${x.toFixed(1)}" y="8" width="${carW.toFixed(1)}" height="${h - 16}" fill="${on ? onFill : offFill}"/>
        <text x="${(x + carW / 2).toFixed(1)}" y="52" text-anchor="middle" fill="${on ? onInk : offInk}" font-size="22" font-weight="700" font-stretch="condensed">${n}</text>
      </g>`;
    })
    .join("");
  return `
    <svg class="train-svg" viewBox="0 0 360 ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Trem de ${carCount} carros">
      <polygon points="${pad},20 ${pad + cabW},8 ${pad + cabW},${h - 8} ${pad},52" fill="#f3eadc"/>
      ${carRects}
    </svg>
    <p class="front-label"><span class="nose"></span> frente do trem · sentido ${state.direction ?? "—"}</p>
  `;
}

function intentPhrase(adv) {
  if (adv.intent === "transfer" && adv.transferTo) {
    return `pra integração com a ${LINES[adv.transferTo].name}`;
  }
  if (adv.intent === "saida") return "pra saída da rua";
  return "pra chegar na escada rolante";
}

function renderResult() {
  const el = $("#result");
  const adv = currentAdvice();
  if (!state.destId) {
    el.innerHTML = `
      <div class="empty">
        ${renderTrain(6, [], false)}
        <p>Escolhe onde você desce. O desenho do trem diz em qual carro entrar.</p>
      </div>`;
    return;
  }
  if (adv?.error) {
    el.innerHTML = `<p class="err">${adv.error}</p>`;
    return;
  }
  if (adv?.need === "dir") {
    el.innerHTML = `
      <div class="empty">
        ${renderTrain(LINES[state.lineId]?.cars ?? 6, [], false)}
        <p>Agora o sentido. Carro 1 é sempre a frente do trem.</p>
      </div>`;
    return;
  }

  const label = formatCars(adv.cars, adv.any);
  const vote = readVote(adv);
  el.innerHTML = `
    <div class="answer">
      ${renderTrain(adv.carCount, adv.cars, adv.any)}
      <p class="headline" aria-live="polite">${label}</p>
      <p class="sub">${intentPhrase(adv)}${
        adv.routed
          ? ` · entra em ${stationTitle(adv.boardFromId)}`
          : ` · desce em ${stationTitle(adv.stationId)}`
      }</p>
      <p class="why">${adv.why}</p>
      <p class="conf">Estimado — ainda não conferimos essa plataforma no campo.</p>
      <div class="feedback">
        <p>Isso bateu com a plataforma?</p>
        <div class="vote">
          <button type="button" class="vote-btn ${vote === "yes" ? "is-on" : ""}" data-vote="yes">Bateu</button>
          <button type="button" class="vote-btn ${vote === "no" ? "is-on" : ""}" data-vote="no">Não bateu</button>
        </div>
        ${vote ? `<p class="thanks">Ficou salvo neste celular. Ajuda na próxima visita de campo.</p>` : ""}
      </div>
    </div>
  `;
}

function voteKey(adv) {
  return [adv.stationId, adv.lineId, adv.direction, adv.intent, adv.transferTo || ""].join("|");
}

function readVote(adv) {
  try {
    const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
    return all[voteKey(adv)]?.vote || null;
  } catch {
    return null;
  }
}

function saveVote(adv, vote) {
  const all = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  all[voteKey(adv)] = {
    vote,
    cars: adv.cars,
    at: Date.now(),
    station: stationTitle(adv.stationId),
    line: adv.lineId,
  };
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
}

function pickStation(kind, id) {
  if (kind === "dest") {
    state.destId = id;
    state.destOpen = false;
    state.lineId = null;
    state.direction = null;
    state.intent = "escada";
    state.transferTo = null;
    $("#dest-input").value = stationTitle(id);
    $("#dest-input").blur();
  } else {
    state.originId = id;
    state.originOpen = false;
    $("#origin-input").value = stationTitle(id);
    $("#origin-input").blur();
  }
  render();
}

function clearOrigin() {
  state.originId = null;
  $("#origin-input").value = "";
  render();
}

function bind() {
  const dest = $("#dest-input");
  const origin = $("#origin-input");

  dest.addEventListener("focus", () => {
    state.destOpen = true;
    renderField("dest");
  });
  origin.addEventListener("focus", () => {
    state.originOpen = true;
    renderField("origin");
  });
  dest.addEventListener("input", () => {
    state.destId = null;
    state.destOpen = true;
    render();
  });
  origin.addEventListener("input", () => {
    if (!origin.value.trim()) {
      clearOrigin();
      state.originOpen = true;
      renderField("origin");
      return;
    }
    state.originId = null;
    state.originOpen = true;
    render();
  });

  document.addEventListener("click", (e) => {
    const suggest = e.target.closest(".suggest");
    if (suggest) {
      const list = suggest.parentElement;
      const kind = list.id === "dest-list" ? "dest" : "origin";
      pickStation(kind, suggest.dataset.id);
      return;
    }
    const line = e.target.closest("[data-line]");
    if (line) {
      state.lineId = line.dataset.line;
      state.direction = null;
      state.intent = "escada";
      render();
      return;
    }
    const dir = e.target.closest("[data-dir]");
    if (dir) {
      state.direction = dir.dataset.dir;
      render();
      return;
    }
    const intent = e.target.closest("[data-intent]");
    if (intent) {
      state.intent = intent.dataset.intent;
      render();
      return;
    }
    const xfer = e.target.closest("[data-xfer]");
    if (xfer) {
      state.transferTo = xfer.dataset.xfer;
      state.intent = "transfer";
      render();
      return;
    }
    const vote = e.target.closest("[data-vote]");
    if (vote) {
      const adv = currentAdvice();
      if (adv && !adv.error && !adv.need) {
        saveVote(adv, vote.dataset.vote);
        renderResult();
      }
      return;
    }
    if (!e.target.closest(".field")) {
      state.destOpen = false;
      state.originOpen = false;
      renderField("dest");
      renderField("origin");
    }
  });

  $("#clear-origin").addEventListener("click", () => {
    clearOrigin();
    $("#origin-input").focus();
  });
}

function readQuery() {
  const q = new URLSearchParams(location.search);
  const dest = q.get("dest");
  const origin = q.get("origem");
  if (dest && STATION_NAMES[dest]) state.destId = dest;
  if (origin && STATION_NAMES[origin]) state.originId = origin;
  const line = q.get("linha");
  if (line && LINES[line]) state.lineId = line;
  const dir = q.get("sentido");
  if (dir) state.direction = dir;
  const intent = q.get("pra");
  if (intent === "escada" || intent === "saida" || intent === "transfer") state.intent = intent;
  const to = q.get("com");
  if (to && LINES[to]) state.transferTo = to;
}

function writeQuery() {
  const q = new URLSearchParams();
  if (state.destId) q.set("dest", state.destId);
  if (state.originId) q.set("origem", state.originId);
  if (state.lineId) q.set("linha", state.lineId);
  if (state.direction) q.set("sentido", state.direction);
  if (state.intent && state.intent !== "escada") q.set("pra", state.intent);
  if (state.transferTo) q.set("com", state.transferTo);
  const next = q.toString();
  const url = next ? `?${next}` : location.pathname;
  if (`${location.search}` !== (next ? `?${next}` : "")) {
    history.replaceState(null, "", url);
  }
}

bind();
readQuery();
render();
