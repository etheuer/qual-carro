import http from "node:http";
import fs from "node:fs";
import { applyVote, aggregateVotes } from "../src/reports.js";

const FILE = new URL("./data.json", import.meta.url);

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { votes: {} };
  }
}

function save(db) {
  fs.writeFileSync(FILE, JSON.stringify(db));
}

function send(res, code, body) {
  const json = body == null ? "" : JSON.stringify(body);
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, ngrok-skip-browser-warning",
    "access-control-allow-methods": "GET,POST,OPTIONS",
  });
  res.end(json);
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    send(res, 204, null);
    return;
  }
  const path = new URL(req.url || "/", "http://qual-carro.local").pathname;
  if (req.method === "GET" && path === "/reports") {
    send(res, 200, aggregateVotes(load().votes));
    return;
  }
  if (req.method === "POST" && path === "/reports") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
        const db = applyVote(load(), body);
        save(db);
        send(res, 200, aggregateVotes(db.votes));
      } catch {
        send(res, 400, { error: "bad json" });
      }
    });
    return;
  }
  send(res, 404, { error: "not found" });
});

const port = Number(process.env.PORT || 4132);
server.listen(port, "0.0.0.0", () => {
  console.log(`qual-carro reports on :${port}`);
});
