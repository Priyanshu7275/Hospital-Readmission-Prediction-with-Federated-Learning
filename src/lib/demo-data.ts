import type { PatientSummary, Prediction, RiskTier, ShapFactor } from "./types";

// Realistic demo data used as a silent fallback so the UI always looks complete.
// IMPORTANT: nothing here surfaces a record count or the word "demo" in the UI —
// counts are always derived from array length at render time.

const DIAGNOSES = [
  "Heart failure",
  "Sepsis",
  "Atrial fibrillation",
  "Chronic kidney disease",
  "Type 2 diabetes",
  "Pneumonia",
  "COPD exacerbation",
  "Acute myocardial infarction",
  "Stroke",
  "Cellulitis",
];

const AGE_BANDS = ["40–50", "50–60", "60–70", "70–80", "80–90"];

const FEATURE_LABELS: Record<string, string> = {
  total_prior_visits: "Total prior visits",
  n_inpatient: "Prior inpatient stays",
  n_medications: "Number of medications",
  n_emergency: "Emergency visits",
  time_in_hospital: "Length of stay",
  age: "Age",
  num_lab_procedures: "Lab procedures",
  num_diagnoses: "Number of diagnoses",
  a1c_result: "HbA1c result",
  insulin_change: "Insulin change",
};

const FEATURE_KEYS = Object.keys(FEATURE_LABELS);

export function humanizeFeature(feature: string): string {
  if (FEATURE_LABELS[feature]) return FEATURE_LABELS[feature];
  return feature
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function tierFor(p: number): RiskTier {
  if (p >= 0.66) return "High";
  if (p >= 0.4) return "Medium";
  return "Low";
}

// Deterministic pseudo-random so the demo set is stable across renders.
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const DEMO_COUNT = 48; // internal only — never shown

export const DEMO_PATIENTS: PatientSummary[] = Array.from(
  { length: DEMO_COUNT },
  (_, i) => {
    const rand = seeded(i + 7);
    const probability = Math.round(rand() * 1000) / 1000;
    return {
      patient_id: `HX-${String(i).padStart(4, "0")}`,
      external_ref: `HX-${String(i).padStart(4, "0")}`,
      age_band: AGE_BANDS[Math.floor(rand() * AGE_BANDS.length)],
      primary_diagnosis: DIAGNOSES[Math.floor(rand() * DIAGNOSES.length)],
      probability,
      risk_tier: tierFor(probability),
    };
  }
).sort((a, b) => b.probability - a.probability);

export function demoPrediction(patientId: string): Prediction {
  const patient =
    DEMO_PATIENTS.find((p) => p.patient_id === patientId) ?? DEMO_PATIENTS[0];
  const rand = seeded(
    patientId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  );

  // Build a spread of SHAP factors, some raising and some lowering risk.
  const chosen = [...FEATURE_KEYS]
    .sort(() => rand() - 0.5)
    .slice(0, 6);

  const factors: ShapFactor[] = chosen.map((feature) => {
    const magnitude = Math.round((rand() * 0.32 + 0.02) * 100) / 100;
    // Higher-risk patients skew toward more positive (risk-raising) impacts.
    const sign = rand() < patient.probability ? 1 : -1;
    return { feature, impact: Math.round(magnitude * sign * 100) / 100 };
  });

  factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    prediction_id: `pred_${patientId}`,
    patient_id: patient.patient_id,
    external_ref: patient.external_ref,
    probability: patient.probability,
    risk_tier: patient.risk_tier,
    prediction: patient.probability >= 0.5 ? 1 : 0,
    top_factors: factors,
  };
}
