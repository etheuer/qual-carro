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

export async function getDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (id) return id;
  id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_KEY, id);
  return id;
}

async function request(path, opts = {}) {
  const base = reportsUrl();
  if (!base) return null;
  const res = await fetch(`${base}${path}`, {
    ...opts,
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
