# 🏥 AI Vital Signs Monitoring System 

**An AI-powered vital signs monitoring dashboard, built for hackathon submission.**

A live vitals dashboard, ECG waveform display, AI analysis of the readings, and a
printable health report — all running in the browser.


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
├── tools/                 # source-stripping utility
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

## 🔌 What works without a backend

| Feature | Frontend-only |
|---|---|
| Firebase sign-in / sign-up | ✅ works |
| Connect device, live vitals, ECG trace | ✅ works (all simulated in-browser) |
| Gemini analysis of the vitals | ✅ works (via the bundled `/api/gemini` function) |
| Report page, print, PDF export | ✅ works |
| Hindi voice announcements | ✅ works (browser speech synthesis) |
| HuBERT-ECG analysis section | ❌ shows "ECG Analysis Failed" |
| Emailing the report | ❌ fails — needs the Express backend |
| Dashboard body-age calculation | ❌ "Save Failed" — needs the backend |
| Device status badge | ✅ shown on both the monitoring and report pages |

All backend failures are handled — the app degrades rather than crashing.

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

