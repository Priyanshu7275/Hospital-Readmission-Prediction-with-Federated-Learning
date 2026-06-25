# Sammy — Federated Hospital Readmission Prediction (Frontend)

Privacy-preserving readmission-risk dashboard. Light theme, multi-page, 3D seagull
guide, gated login, built strictly against the FastAPI backend contract.

## Run locally
    npm install
    npm run dev        # http://localhost:3000

## Connect the backend
Set the API base URL in `.env.local`:
    NEXT_PUBLIC_API_URL=https://your-fastapi-url
Leave it blank to use the built-in demo data (the UI never reveals it's demo data).

Endpoints used:
- GET  /patients
- GET  /predict/{patient_id}
- POST /feedback

## Demo login
    clinician@hospital-x.org  /  sammy-demo
Swap `src/lib/auth.tsx` for real auth before production; remove the demo hint on the login page.

## Deploy to Vercel
1. Push to GitHub.
2. Import the repo in Vercel.
3. Add env var `NEXT_PUBLIC_API_URL`.
4. Deploy. Keep the published link + Vercel Team ID for submission.

## Pages
- `/`              landing + 3D seagull guide
- `/login`         gated access
- `/patients`      cohort list (search, tier filters, grid/table)
- `/patients/[id]` patient detail (gauge, SHAP diverging chart, confirm/override)

## Notes
- Patient counts are derived from data length at runtime — never hard-coded.
- Replace the inline logo in `src/components/SammyLogo.tsx` with your asset if preferred.
- React 19 + Next 15 + react-three-fiber v9 + drei v10 (versions are aligned; install as-is).
