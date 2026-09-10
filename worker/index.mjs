import { applyVote, aggregateVotes } from "../src/reports.js";

const CORS = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, ngrok-skip-browser-warning",
  "access-control-allow-methods": "GET,POST,OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

export class ReportsStore {
  constructor(state) {
    this.state = state;
  }

  async fetch(req) {
    if (req.method === "GET") {
      const db = (await this.state.storage.get("db")) || { votes: {} };
      return json(aggregateVotes(db.votes || {}));
    }
    if (req.method === "POST") {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: "bad json" }, 400);
      }
      const db = (await this.state.storage.get("db")) || { votes: {} };
      const next = applyVote(db, body);
      await this.state.storage.put("db", next);
      return json(aggregateVotes(next.votes || {}));
    }
    return json({ error: "not found" }, 404);
  }
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    const path = new URL(req.url).pathname;
    if (path === "/reports" && (req.method === "GET" || req.method === "POST")) {
      const id = env.STORE.idFromName("votes");
      return env.STORE.get(id).fetch(req);
    }
    return json({ error: "not found" }, 404);
  },
};
