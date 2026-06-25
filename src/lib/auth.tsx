"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Three-step hospital auth: hospital code → clinician credentials → one-time passcode.
//
// SESSION MODE ("demo" | "live"):
//   - "demo" → the entered credentials matched the built-in demo values.
//              The app always shows DEMO data for this session, even if the
//              real backend (NEXT_PUBLIC_API_URL) is connected.
//   - "live" → the credentials did NOT match demo values, i.e. they were
//              validated against the real backend. The app shows REAL data
//              (only when NEXT_PUBLIC_API_URL is set).
//
// This lets a single deployed site serve safe demo data to demo logins and
// real Aurora data to real clinician logins at the same time.
//
// NOTE: demo gate only — never place real patient credentials in this file.

const DEMO_HOSPITAL_CODE = "HX-7729";
const DEMO_EMAIL = "clinician@hospital-x.org";
const DEMO_PASSWORD = "sammy-demo";
const DEMO_OTP = "424242";
const STORAGE_KEY = "sammy.auth";

export type SessionMode = "demo" | "live";

interface AuthState {
  isAuthed: boolean;
  email: string | null;
  hospital: string | null;
  mode: SessionMode | null;
  ready: boolean;
  // step 1: verify the hospital is enrolled
  verifyHospital: (code: string) => Promise<boolean>;
  // step 2: verify clinician credentials (also decides demo vs live)
  verifyCredentials: (email: string, password: string) => Promise<boolean>;
  // step 3: verify the one-time passcode and complete sign-in
  verifyOtp: (code: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [hospital, setHospital] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [ready, setReady] = useState(false);

  // transient state held between steps (not persisted)
  const [pendingHospital, setPendingHospital] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<SessionMode>("demo");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          email: string;
          hospital: string;
          mode?: SessionMode;
        };
        setEmail(parsed.email);
        setHospital(parsed.hospital);
        setMode(parsed.mode ?? "demo");
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const verifyHospital = async (code: string) => {
    await new Promise((r) => setTimeout(r, 450));
    const trimmed = code.trim().toUpperCase();

    // Demo hospital code is always accepted.
    if (trimmed === DEMO_HOSPITAL_CODE) {
      setPendingHospital("Hospital X");
      return true;
    }

    // ── REAL BACKEND (uncomment when connected) ─────────────────────────
    // Validate the hospital code against the backend. If valid, accept it
    // (the demo/live decision is made at the credentials step below).
    //
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/hospital`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ code: trimmed }),
    // });
    // if (res.ok) {
    //   const data = await res.json();
    //   setPendingHospital(data.hospital_name ?? "Hospital");
    //   return true;
    // }
    // ────────────────────────────────────────────────────────────────────

    return false;
  };

  const verifyCredentials = async (e: string, p: string) => {
    await new Promise((r) => setTimeout(r, 550));
    const email = e.trim().toLowerCase();

    // Demo credentials → tag this session as "demo" (always shows demo data).
    if (email === DEMO_EMAIL && p === DEMO_PASSWORD) {
      setPendingEmail(e.trim());
      setPendingMode("demo");
      return true;
    }

    // ── REAL BACKEND (uncomment when connected) ─────────────────────────
    // Validate real clinician credentials against the backend. If valid,
    // tag the session as "live" so the app loads real Aurora data.
    //
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email: e.trim(), password: p }),
    // });
    // if (res.ok) {
    //   setPendingEmail(e.trim());
    //   setPendingMode("live");   // ← real credentials → real data
    //   return true;
    // }
    // ────────────────────────────────────────────────────────────────────

    return false;
  };

  const verifyOtp = async (code: string) => {
    await new Promise((r) => setTimeout(r, 500));

    let ok = false;

    if (pendingMode === "demo") {
      // Demo session: accept the fixed demo OTP.
      ok = code.trim() === DEMO_OTP;
    } else {
      // ── REAL BACKEND (uncomment when connected) ───────────────────────
      // Verify the real SMS OTP against the backend.
      //
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/otp`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: pendingEmail, otp: code.trim() }),
      // });
      // ok = res.ok;
      // ──────────────────────────────────────────────────────────────────
      ok = false;
    }

    if (ok && pendingEmail && pendingHospital) {
      setEmail(pendingEmail);
      setHospital(pendingHospital);
      setMode(pendingMode);
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: pendingEmail,
            hospital: pendingHospital,
            mode: pendingMode,
          })
        );
      } catch {
        /* ignore */
      }
      setPendingEmail(null);
      setPendingHospital(null);
    }
    return ok;
  };

  const signOut = () => {
    setEmail(null);
    setHospital(null);
    setMode(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthed: !!email,
        email,
        hospital,
        mode,
        ready,
        verifyHospital,
        verifyCredentials,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Read the current session mode from storage (for use outside React, e.g. the
// data layer). Returns "demo" when nothing is stored.
export function getSessionMode(): SessionMode {
  if (typeof window === "undefined") return "demo";
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return "demo";
    const parsed = JSON.parse(stored) as { mode?: SessionMode };
    return parsed.mode ?? "demo";
  } catch {
    return "demo";
  }
}

export const DEMO_CREDENTIALS = {
  hospitalCode: DEMO_HOSPITAL_CODE,
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
  otp: DEMO_OTP,
};
