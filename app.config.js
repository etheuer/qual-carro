import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const app = require("./app.json");
const root = dirname(fileURLToPath(import.meta.url));

function reportsUrl() {
  const env = process.env.EXPO_PUBLIC_REPORTS_URL;
  if (env && env.trim()) return env.trim();
  const file = join(root, ".reports-url");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  return "";
}

export default {
  expo: {
    ...app.expo,
    extra: {
      ...(app.expo.extra || {}),
      reportsUrl: reportsUrl(),
    },
  },
};
