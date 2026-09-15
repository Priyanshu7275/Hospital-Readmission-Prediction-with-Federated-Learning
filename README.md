<h1 align="center">🏥 Sammy</h1>

<h3 align="center">Privacy-preserving <b>federated learning</b> for 30-day hospital readmission prediction</h3>

<p align="center">
  The trained model lives <i>inside</i> the database — and patient data never leaves the hospital.
</p>

###

<p align="center">
  <img src="https://img.shields.io/badge/H0%20Hackathon-Hack%20the%20Zero%20Stack-0d9488?style=for-the-badge" alt="hackathon" />
  <img src="https://img.shields.io/badge/status-live-10b981?style=for-the-badge" alt="status" />
  <img src="https://img.shields.io/badge/privacy-federated-232f3e?style=for-the-badge" alt="privacy" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="nextjs" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="react" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="ts" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="vercel" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="fastapi" />
  <img src="https://img.shields.io/badge/XGBoost-EB5E28?style=for-the-badge" alt="xgboost" />
  <img src="https://img.shields.io/badge/SHAP-7b3fe4?style=for-the-badge" alt="shap" />
  <img src="https://img.shields.io/badge/Flower-3454D1?style=for-the-badge" alt="flower" />
  <img src="https://img.shields.io/badge/Amazon%20Aurora-2E73B8?style=for-the-badge&logo=amazonrds&logoColor=white" alt="aurora" />
  <img src="https://img.shields.io/badge/Amazon%20EC2-ED7100?style=for-the-badge&logo=amazonec2&logoColor=white" alt="ec2" />
  <img src="https://img.shields.io/badge/AWS%20Cognito-DD344C?style=for-the-badge&logo=amazoncognito&logoColor=white" alt="cognito" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="postgres" />
</p>

###

## 🔗 Live demo

**App:** [hospital-readmission-prediction-wit.vercel.app](https://hospital-readmission-prediction-wit.vercel.app)

Sammy is gated behind a realistic 3-step hospital login. Use these demo credentials to explore the full experience:

| Field | Value |
|---|---|
| Hospital access code | `HX-7729` |
| Email | `clinician@hospital-x.org` |
| Password | `sammy-demo` |
| One-time passcode | `424242` |

> The demo login shows representative synthetic data. With real clinician credentials and the backend connected, the app switches to live AWS Aurora data automatically. The live AWS backend may be paused outside judging to stay within credit limits — the app gracefully falls back to demo data, so testing is never blocked.

###

## 🧠 What is Sammy?

Hospital readmissions cost billions, and AI could help predict them — but the data that would train that AI **legally cannot leave the hospital** (HIPAA, PhysioNet DUA). So the most valuable healthcare-AI problems stay unsolved.

Sammy predicts a patient's risk of **30-day readmission** using **federated learning**: each hospital trains the model on its *own* data, and only the **model's math** (never the data) is combined on a central server. Every prediction comes with a **SHAP explanation**, so clinicians see *why* — and the explanation can't leak private records.

###

## 💡 The big idea — the model lives *inside* the database

Most ML systems keep the model in an S3 bucket and ship patient data *to* it. We did the opposite.

The trained model is stored **inside Amazon Aurora**, in a `model_store` table (`BYTEA` for the model bytes, `JSONB` for its metadata — PostgreSQL's `TOAST` keeps the whole model in a single row). A small **EC2 node attached inside the same VPC** reads the model and the patient over the private network, runs the prediction + SHAP, and writes the result straight back.

The data, the model, the predictions, and an immutable audit log all live in **one secure place**. Aurora isn't a passive store behind a server — it's the **secure core of the system**.

###

## 🏗️ Architecture

```
Clinician ──HTTPS──► Vercel (Next.js + AWS Cognito email-OTP)
                        │
                        ▼  https://<backend-domain>
        ┌──────────── Hospital · VPC ─────────────┐
        │  EC2 (FastAPI + SHAP)  ◄──►  Amazon Aurora │
        │      "prediction unit"      model + data   │
        └────────────────────────────▲──────────────┘
                                      │ global model
        Hospital A ─┐                 │
        Hospital B ─┼─► EC2 (central aggregator, federated bagging)
        Hospital C ─┘     only models combined — never data
```

###

## 🔒 How the federated learning works

1. The dataset is split across **3 simulated hospitals** (50% / 30% / 20%).
2. Each hospital trains its **own XGBoost model** on its **own data** — the data never moves.
3. A central **EC2 server** ([Flower](https://flower.ai)) collects only the **models** and merges their trees (**bagging**) into one global model.
4. The global model is pushed **into each hospital's Aurora**, where it serves live predictions.

> Models are serialized as JSON (`save_raw("json")`) for portability across machines and into the database.

###

## ✨ Features

- 🔐 **Real authentication** — AWS Cognito 3-step login with **email OTP** (via Amazon SES)
- 🧠 **Live predictions** — 200 patients scored in real time by the in-Aurora model
- 📊 **Explainable AI** — per-patient SHAP factors (what raises vs. lowers risk)
- 🩺 **Clinician workflow** — risk gauge, plain-English summary, Confirm / Override
- 🗄️ **Model-in-database** — a novel use of Amazon Aurora as the secure core
- 🛡️ **Privacy by design** — federated training; patient data never leaves the hospital
- ☁️ **Production-shaped** — HTTPS, fixed Elastic IP, auto-starting service, immutable audit log

###

## 🧰 Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Framer Motion, deployed on **Vercel** |
| **Auth** | AWS Cognito (email-OTP MFA), Amazon SES, AWS Amplify |
| **Backend / API** | FastAPI, Uvicorn, psycopg2 (on Amazon EC2) |
| **ML** | XGBoost, SHAP, scikit-learn, pandas, NumPy, Flower (federated learning) |
| **Database** | Amazon Aurora PostgreSQL (BYTEA, JSONB, immutable audit log) |
| **Infra** | Amazon VPC, Elastic IP, Caddy (auto-HTTPS), systemd |
| **Data** | MIMIC-IV (PhysioNet) — used locally only; public demo uses synthetic data |

###

## 🖥️ The frontend

The clinician-facing dashboard is a **Next.js (App Router)** app written in **React + TypeScript**, styled with **Tailwind CSS**, animated with **Framer Motion**, and featuring a 3D guide rendered with **react-three-fiber / Three.js**. It was scaffolded and refined with **Vercel v0** and deployed on **Vercel's global edge network**.

**Screens**
- **3-step login** — hospital access code → clinician credentials → email OTP (AWS Cognito via AWS Amplify).
- **Patient cohort** — searchable, filterable by risk tier (High / Medium / Low), with grid and table views; counts are always derived from data, never hard-coded.
- **Patient detail** — a radial risk gauge, the SHAP explanation chart (factors that raise vs. lower risk), a plain-English summary, and a clinician **Confirm / Override** action.

**Design notes**
- The front end is a *thin client*: it only ever calls the backend API and renders the result — it never touches the model or the database directly.
- A built-in **synthetic demo dataset** means the UI always looks complete, even with the backend offline. Real clinician credentials + a connected backend switch it to **live Aurora data** automatically.
- Configured entirely through environment variables — no secrets in the code:
  - `NEXT_PUBLIC_API_URL` — the backend (prediction) endpoint
  - `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
  - `NEXT_PUBLIC_COGNITO_CLIENT_ID`

###

## ⚙️ How it works

**Training (occasional):** ETL → split into 3 hospitals → federated bagging on the central EC2 → `global_model.json` → uploaded into Aurora `model_store`.

**Inference (always on):** clinician → Vercel → HTTPS → EC2 reads model + patient from Aurora → XGBoost + SHAP → writes prediction back → dashboard renders risk + explanation.

###

## 📁 Repository structure

```
.
├── src/                     # Next.js frontend (Vercel)
│   ├── app/                 # pages: login, patients, patient detail
│   ├── components/          # dashboard UI, risk gauges, SHAP charts
│   └── lib/                 # auth (Cognito), API client, types, demo data
└── backend/                 # Python ML + API
    ├── api.py               # FastAPI inference server (loads model from Aurora)
    ├── model.py             # HospitalReadmissionModel (XGBoost + SHAP)
    ├── server.py            # federated aggregator (bagging)
    ├── client.py            # one hospital node (Flower client)
    ├── federated_nodes.py   # splits data across the 3 hospitals
    ├── schema.sql           # Aurora schema (model_store, patients, audit log…)
    ├── score_all.py         # batch-score every patient
    └── upload_model.py      # push the trained model into Aurora
```

###

## 🚀 Run it locally

**Frontend (Next.js):**
```bash
npm install
# create .env.local with:
#   NEXT_PUBLIC_API_URL=https://<your-backend-domain>
#   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
#   NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxx
npm run dev          # http://localhost:3000
```

**Backend (FastAPI):**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn psycopg2-binary xgboost shap pandas numpy scikit-learn
export AURORA_PASSWORD="your-db-password"   # never hard-code secrets
uvicorn api:app --host 0.0.0.0 --port 8000
```

**Federated training (optional):** start `python backend/server.py` (central aggregator), then run three hospital clients: `python backend/client.py --node 0 --server <server-ip>:8080` (and `--node 1`, `--node 2`).

> Tip: with no `.env.local` / backend, the frontend still runs — it falls back to the built-in synthetic demo data, so you can develop the UI offline.

###

## 🛡️ Privacy & data note

Real **MIMIC-IV** data is governed by the PhysioNet DUA and is **never** committed to this repo or shown on the public site. The deployed demo uses **synthetic** patients. In the federated design, raw patient data never leaves its hospital — only model weights are shared.

###

## 📜 Built for

The **H0: Hack the Zero Stack** hackathon with Vercel v0 and AWS Databases. `#H0Hackathon`

<p align="center">
  <br>
  Built with ❤️ by <b>Priyanshu Verma</b>
  <br><br>
  <a href="https://hospital-readmission-prediction-wit.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-0d9488?style=for-the-badge&logo=vercel&logoColor=white" alt="demo" /></a>
  <!-- Add your links: -->
  <!-- <a href="https://linkedin.com/in/your-handle"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" /></a> -->
  <!-- <a href="mailto:you@example.com"><img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" /></a> -->
</p>
