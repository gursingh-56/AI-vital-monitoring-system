# 🏥 AI Vital Signs Monitoring System

**An AI-powered vital signs monitoring dashboard, built for hackathon submission.**

A live vitals dashboard, ECG waveform display, AI analysis of the readings, and a
printable health report — all running in the browser.

> ### ⚠️ The vital signs are simulated
>
> **No patient is measured and no sensor is read.** Heart rate, blood pressure,
> blood sugar, SpO2, temperature and the ECG waveform are all generated in the
> browser by `MonitoringPage.tsx` and `constants.ts`. Everything downstream — the
> AI analysis, the report — is an analysis of that synthetic input. This is a
> demonstration of the pipeline, not a medical device, and nothing it produces is
> a diagnosis.

> ### 📦 The whole project is here; only the frontend is deployed
>
> The repo contains the React frontend, the Express backend, the Flask
> HuBERT-ECG service and the Bluetooth-mesh simulation. **Vercel deploys the
> frontend only** — `.vercelignore` keeps the server-side folders out of the
> deployment. Run those locally if you want the full stack. See
> [What works on the deployed site](#-what-works-on-the-deployed-site).

## ✨ Features

*   **Starts disconnected** — the app opens with no device attached. Nothing is
    generated and no session can start until you press **Connect Device**.
*   **Live vitals dashboard** — Heart Rate, Blood Pressure, Blood Sugar, SpO2 and
    Temperature, each with its own generator behaviour (the thermometer warms up,
    SpO2 fluctuates more than the rest).
*   **ECG waveform** — a synthetic P-QRS-T trace across three leads (I, II, III)
    with per-lead morphology, plus occasional premature ventricular contractions.
*   **AI analysis** — Gemini reviews the readings and returns a structured
    assessment, per-vital status, a cautious interpretation and recommendations.
*   **Health report** — rendered on screen, printable, and exportable to PDF.
*   **Authentication** — Firebase (Google sign-in or email/password).
*   **Hindi voice announcements** via the browser's speech synthesis.

## 🛠️ Tech Stack

React 19 · TypeScript · Vite 6 · Tailwind CSS · React Router · Recharts ·
Firebase Auth · Google Gemini · jsPDF

## 📂 Project Structure

```
├── api/
│   └── gemini.ts               # Vercel Function: server-side Gemini call
├── components/            # UI components
│   ├── DeviceStatusBadge.tsx   # connected / connecting / disconnected
│   ├── EcgChart.tsx            # Recharts ECG trace
│   ├── ReportPage.tsx          # analysis report, print + PDF
│   └── ...
├── contexts/
│   ├── AuthContext.tsx         # auth state
│   └── DeviceContext.tsx       # device connection, shared across routes
├── services/
│   ├── apiConfig.ts            # service URLs (single source of truth)
│   ├── firebase.ts             # Firebase auth wrapper
│   ├── geminiService.ts        # calls /api/gemini (holds no key)
│   └── ttsService.ts           # Hindi text-to-speech
├── backend/               # Express API — not deployed, run locally
├── ECG/                   # Flask HuBERT-ECG service + vendored research repo
├── mesh_messenger/        # standalone Bluetooth-mesh simulation
├── tools/                 # source-stripping utility
├── .vercelignore          # keeps the above out of the Vercel deployment
├── App.tsx                # routes
├── MonitoringPage.tsx     # simulation + session flow
├── constants.ts           # vital ranges, ECG waveforms, timers
└── vercel.json            # SPA rewrites for React Router
```

## 🏁 Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

This serves the frontend **and** the `/api/gemini` function: `vite.config.ts`
registers a dev-only middleware that runs the same handler Vercel runs in
production, so local behaviour matches the deployment. Put `GEMINI_API_KEY` in
`.env` and it is picked up automatically.

Create a `.env` in the project root:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

# Server-side only. Read by api/gemini.ts at request time and never inlined
# into the browser bundle.
GEMINI_API_KEY=...

# Optional — only if you are running the companion services locally
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_ECG_SERVICE_URL=http://127.0.0.1:5001
```

> Every `process.env.*` value the frontend reads must also be listed in the
> `define` block of `vite.config.ts`. Vite substitutes only the names listed
> there; anything omitted silently compiles to `undefined`.

## 🔌 What works on the deployed site

| Feature | Deployed (frontend only) |
|---|---|
| Firebase sign-in / sign-up | ✅ works |
| Connect device, live vitals, ECG trace | ✅ works (all simulated in-browser) |
| Gemini analysis of the vitals | ✅ works (via the bundled `/api/gemini` function) |
| Report page, print, PDF export | ✅ works |
| Hindi voice announcements | ✅ works (browser speech synthesis) |
| HuBERT-ECG analysis section | ❌ shows "ECG Analysis Failed" — run `ECG/api.py` locally |
| Emailing the report | ❌ needs `backend/` running |
| Dashboard body-age calculation | ❌ "Save Failed" — needs `backend/` running |
| Device status badge | ✅ shown on both the monitoring and report pages |

All backend failures are handled — the app degrades rather than crashing.

### Running the rest locally

```bash
cd backend && npm install && npm start          # Express API on :3001
cd ECG    && pip install -r requirements.txt && python api.py   # ECG service on :5001
python -m mesh_messenger.api_server             # mesh simulation on :5000
```

Point the frontend at them with `REACT_APP_BACKEND_URL` and
`REACT_APP_ECG_SERVICE_URL` in `.env`. The mesh simulation is standalone and is
not called by the frontend.

## ▲ Deploying to Vercel

```bash
vercel login
vercel link
vercel --prod
```

`vercel.json` sets the framework to Vite, the output to `dist`, and adds an SPA
rewrite — without it, refreshing on `/monitoring` or `/report` would 404, because
the app uses `BrowserRouter`.

Then, in **Project → Settings → Environment Variables**, add:

| Variable | Where it is used |
|---|---|
| `GEMINI_API_KEY` | server-side only, by `api/gemini.ts` |
| `REACT_APP_FIREBASE_API_KEY` and the other five `REACT_APP_FIREBASE_*` | inlined into the client bundle at build time |

**Redeploy after adding them.** The `REACT_APP_*` values are inlined at *build*
time, so adding them to an existing deployment has no effect until you rebuild.

Finally add your `*.vercel.app` domain in **Firebase Console → Authentication →
Settings → Authorized domains**, or sign-in will be rejected.

### 🔑 Where the Gemini key lives

**It never reaches the browser.** `api/gemini.ts` runs as a Vercel Function and
reads `GEMINI_API_KEY` from the server environment at request time. The browser
posts vital signs to `/api/gemini` and gets the analysis back; it never sees a key.

Two details that keep it that way:

*   `GEMINI_API_KEY` is **not** listed in the `define` block of `vite.config.ts`.
    Anything listed there is substituted into the bundle as a readable string.
    Note the `REACT_APP_` prefix is only a naming convention here — what actually
    exposes a value is being named in `define`, so never add the key there.
*   The prompt is built on the server. If the endpoint accepted a prompt from the
    client, anyone could spend your Gemini quota on arbitrary text; it accepts only
    the vital-sign numbers, and rejects anything else.

Verified: building with `GEMINI_API_KEY` set produces a bundle that does not
contain the key, and calls `/api/gemini` instead.

For comparison, the Firebase web config **is** inlined, and that is fine — it is
designed to be public. Firebase security comes from auth rules and the authorized
domain list, not from hiding those values.

## 🧹 Stripping the source before publishing

`tools/strip-source.mjs` rewrites the source in place as minified, comment-free
code that still builds and deploys identically.

```bash
npm run strip           # back up originals, then strip the tree
npm run strip:restore   # put the readable originals back
npm run strip:status    # is the tree currently stripped?
```

Comments and JSDoc are removed, TypeScript types erased, local variables and
parameters renamed to 1–2 characters, and whitespace collapsed.

**Limits worth knowing:**

*   Files are minified **individually, not bundled**, so exported components,
    hooks and constants keep their names — renaming them would break the imports
    that reference them. Everything internal to a file is mangled.
*   Stripping is **one-way**. `restore` works only because `strip` saved a copy to
    `.source-backup/` first, and that folder is gitignored — it is not pushed, and
    will not exist in a fresh clone.
*   The stripped tree **builds** but will not **typecheck**: `types.ts` is
    declarations-only and erases to an empty module. That is expected.

## 📜 License

[MIT](LICENSE).
