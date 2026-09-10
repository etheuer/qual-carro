import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { REPORTS_URL as BAKED_URL } from "./reports-url.js";

const DEVICE_KEY = "qual-carro-device-id";

export function reportsUrl() {
  const extra = Constants.expoConfig?.extra?.reportsUrl;
  const env = process.env.EXPO_PUBLIC_REPORTS_URL;
  const url = [env, extra, BAKED_URL].find((c) => c && String(c).trim());
  return String(url || "").replace(/\/$/, "");
}

function candidateUrls() {
  const primary = reportsUrl();
  const urls = [];
  if (primary) urls.push(primary);
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    const local = "http://127.0.0.1:4132";
    if (!urls.includes(local)) urls.push(local);
  }
  return urls;
}

export async function getDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (id) return id;
  id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_KEY, id);
  return id;
}

async function request(path, opts = {}) {
  const urls = candidateUrls();
  if (!urls.length) return null;
  let lastErr;
  for (const base of urls) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(`${base}${path}`, {
        ...opts,
        signal: ctrl.signal,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(opts.headers || {}),
        },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`reports ${res.status} ${text.slice(0, 80)}`);
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr || new Error("reports unreachable");
}

export async function fetchReports() {
  try {
    return await request("/reports");
  } catch {
    return null;
  }
}

export async function postReport(key, zone) {
  try {
    const deviceId = await getDeviceId();
    return await request("/reports", {
      method: "POST",
      body: JSON.stringify({ deviceId, key, zone, at: Date.now() }),
    });
  } catch {
    return null;
  }
}
