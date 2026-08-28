# 🏥 AI Vital Signs Monitoring System — Frontend

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

> ### 📦 This repository is the frontend only
>
> The Express backend, the Flask HuBERT-ECG service and the Bluetooth-mesh
> simulation are **not** part of this repo. See
> [What works without a backend](#-what-works-without-a-backend) for exactly which
> features are live and which are inert.

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
├── components/            # UI components
│   ├── DeviceStatusBadge.tsx   # connected / connecting / disconnected
│   ├── EcgChart.tsx            # Recharts ECG trace
│   ├── ReportPage.tsx          # analysis report, print + PDF
│   └── ...
├── contexts/AuthContext.tsx    # auth state
├── services/
│   ├── apiConfig.ts            # service URLs (single source of truth)
│   ├── firebase.ts             # Firebase auth wrapper
│   ├── geminiService.ts        # Gemini vital-sign analysis
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

Create a `.env` in the project root:

```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
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
| Gemini analysis of the vitals | ✅ works (browser calls Google directly) |
| Report page, print, PDF export | ✅ works |
| Hindi voice announcements | ✅ works (browser speech synthesis) |
| HuBERT-ECG analysis section | ❌ shows "ECG Analysis Failed" |
| Emailing the report | ❌ fails — needs the Express backend |
| Dashboard body-age calculation | ❌ "Save Failed" — needs the backend |
| Backend status indicator | shows **Offline** on the report page |

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

Then, in **Project → Settings → Environment Variables**, add `GEMINI_API_KEY` and
all six `REACT_APP_FIREBASE_*` values, and **redeploy**. Vite inlines these at
*build* time, so adding them after a build has no effect.

Finally add your `*.vercel.app` domain in **Firebase Console → Authentication →
Settings → Authorized domains**, or sign-in will be rejected.

### ⚠️ Your Gemini key ships in the browser bundle

`geminiService.ts` calls Google directly from the browser, so `GEMINI_API_KEY` is
inlined into the JavaScript as a plain string. **Anyone who opens the deployed
site can extract it and spend your quota.** Minifying the source does not hide it.

Before deploying publicly, restrict the key in Google Cloud Console — limit it to
the Generative Language API and to your deployment's HTTP referrer — or move the
Gemini call behind a server you control. The Firebase web config is different: it
is designed to be public and is safe to expose.

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
