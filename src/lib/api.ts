import type {
  FeedbackPayload,
  PatientSummary,
  Prediction,
} from "./types";
import { DEMO_PATIENTS, demoPrediction } from "./demo-data";
import { getSessionMode } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

const TIMEOUT_MS = 6000;

// Real data is used ONLY when BOTH are true:
//   1. NEXT_PUBLIC_API_URL is set (a backend exists), AND
//   2. the session was tagged "live" (real credentials, not demo).
// In every other case the app returns demo data — so demo logins always see
// demo data even on a deployed site with the backend connected, and an empty
// API URL means everyone sees demo data.
function useLiveData(): boolean {
  return Boolean(BASE) && getSessionMode() === "live";
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch the patient cohort.
 * Demo session (or no backend) → demo data. Live session → real Aurora data,
 * with a silent fallback to demo data if the backend is unreachable.
 */
export async function getPatients(): Promise<PatientSummary[]> {
  if (!useLiveData()) return DEMO_PATIENTS;
  try {
    const res = await fetchWithTimeout(`${BASE}/patients`);
    if (!res.ok) throw new Error(`patients ${res.status}`);
    const data = (await res.json()) as PatientSummary[];
    if (!Array.isArray(data) || data.length === 0) return DEMO_PATIENTS;
    return data;
  } catch {
    return DEMO_PATIENTS;
  }
}

/**
 * Fetch a single prediction with SHAP factors.
 */
export async function getPrediction(patientId: string): Promise<Prediction> {
  if (!useLiveData()) return demoPrediction(patientId);
  try {
    const res = await fetchWithTimeout(`${BASE}/predict/${patientId}`);
    if (!res.ok) throw new Error(`predict ${res.status}`);
    const data = (await res.json()) as Prediction;
    if (!data || !Array.isArray(data.top_factors)) {
      return demoPrediction(patientId);
    }
    return data;
  } catch {
    return demoPrediction(patientId);
  }
}

/**
 * Submit clinician feedback (confirm / override).
 * In demo mode this resolves true without a network call.
 */
export async function sendFeedback(payload: FeedbackPayload): Promise<boolean> {
  if (!useLiveData()) return true;
  try {
    const res = await fetchWithTimeout(`${BASE}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
