# Derivision — Deriverse Trading Analytics

**A comprehensive trading analytics solution for Deriverse**: professional trading journal + portfolio/performance analytics for active traders.

- Live demo: https://deriverse-analytics-v1tz.vercel.app/
- X (Twitter): https://x.com/KhadiraOussama

---

## Why this submission wins (mapped to judging criteria)

- **Comprehensiveness**: covers the full bounty scope end-to-end (KPIs, charts, filters, fees, time-based metrics, reports, journal, trade history + annotations).
- **Accuracy**: metrics are computed from a normalized trade model; the exported JSON report includes **filter metadata + KPI formulas**.
- **Clarity & readability**: trader-first layout (global filters, KPI grid, explainable tooltips, clean visual hierarchy).
- **Innovation**: “Insights” panel + time-of-day/session edge analysis + fee drag signal.
- **Code quality**: typed domain models, isolated metric engine, composable UI components, tests for key metrics.
- **Security**: **no private keys**, read-only address input, annotations stored locally (localStorage), privacy-first design.

---

## Bounty scope checklist ✅ (1:1 with requirements)

- ✅ **Total PnL tracking** with visual indicators (KPI + equity curve)
- ✅ **Trading volume & fee analysis** (KPIs + fee analytics)
- ✅ **Win rate & trade count** metrics
- ✅ **Average trade duration** calculations
- ✅ **Long/Short ratio** + directional bias tracking
- ✅ **Largest gain/loss** + **avg win/loss** for risk management
- ✅ **Symbol filtering** + **global date range selection** (applies across pages, end-date inclusive)
- ✅ **Historical PnL** charts + **drawdown visualization**
- ✅ **Time-based performance**: daily + **time-of-day** + **session-based** breakdown
- ✅ **Detailed trade history table** (sorting/pagination/filters/search) + **annotation capabilities** (tags/notes/reviewed)
- ✅ **Fee composition breakdown** + **cumulative fee tracking**
- ✅ **Order type performance analysis** (PnL/win rate/duration/fees by order type)
- ✅ **Reports**: JSON export (includes filters + formulas) + PDF via Print → “Save as PDF”

---

## Screenshots (curated)

> All screenshots are from the deployed build and show real interactions (filters, exports, annotations).

### 1) Landing (Deriverse-first)
![Landing](/images/landingpage.png)

### 2) Dashboard overview (KPIs + charts)
![Dashboard overview](/images/dashbordallDemo.png)

### 3) Equity curve + drawdown visualization
![Equity curve + drawdown](/images/Dadhbordequitycurveanddrawdown.png)

### 4) Time-based analytics (time-of-day edge + session performance)
![Time-based analytics](/images/dashbord-Time-of-dayEdge-sessioncards.png)

### 5) Fee analytics (composition + cumulative fees)
![Fee analytics](/images/CumulativeFees.png)

### 6) Order type performance analysis
![Order type performance](/images/orderTypePerformance.png)

### 7) Trade history table
![Trade history](/images/tradeHistory.png)

### 8) Trade annotations (notes/tags/reviewed)
![Trade annotations](/images/tradeAnnotations.png)

### 9) Reports exports (PDF/JSON/share + active filters)
![Reports exports](/images/ReportsExports.png)

---

## Product overview

### Pages
- **Dashboard**: KPI grid + equity curve/drawdown + daily P&L + time-of-day + sessions + fees + order types + symbol performance
- **Trades**: advanced trade table + export + per-trade annotations
- **Journal**: structured entries (setup, confidence, mistake tags) + journal analytics
- **Reports**: filter-aware export (JSON + formulas, PDF via print)
- **Settings**: display preferences + privacy/security notes

### Global filters (applies across pages)
- Data mode: **Demo / CSV / On-chain**
- **Symbol filter**
- **Date range** (inclusive end date)

---

## Architecture (high-level)

```mermaid
flowchart LR
  UI[Next.js App Router UI] --> CTX[Global App Context\n(symbol, date range, data mode)]
  CTX --> HOOK[useTrades()]
  HOOK --> ADP[Adapters\nDemo / CSV / On-chain]
  ADP --> NORM[NormalizedTrade[]]
  NORM --> MET[Metrics Engine\ncomputeMetrics()] 
  MET --> UI

  UI --> ANN[Trade Annotations\nlocalStorage]

  subgraph On-chain (optional)
    RPC[Solana RPC] --> SDK[@deriverse/kit]
    SDK --> ADP
  end
```

**Key idea:** everything runs on a **normalized trade model**, so charts/tables/reports stay consistent across data sources.

---

## Run locally

### Prerequisites
- Node.js 18+ (20+ recommended)

### Install & dev
```bash
npm install
npm run dev
# open http://localhost:3000
```

### Build
```bash
npm run build
npm run start
```

### Tests
```bash
npm test
```

---

## Data modes

### Demo (recommended for judging)
- Fully populated deterministic dataset for consistent screenshots.

### CSV Import
- Paste/import your trade history via CSV to compute the same analytics locally.

### On-chain (Deriverse on Solana)
- Read-only address analysis (no wallet permissions).
- Uses Solana RPC + Deriverse SDK. Configure env vars on Vercel or locally.

---

## Security & privacy

- **No private keys stored or requested**.
- On-chain mode uses a **read-only address** (public key) to fetch/derive analytics.
- Trade annotations are saved locally in the browser (**localStorage**) by design.
- No funds are moved, no transactions are signed.

---

## Short demo video

For the submission page we recommend adding a 30–60s walkthrough (Dashboard → Filters → Trades annotations → Reports export).

- Demo URL: https://deriverse-analytics-v1tz.vercel.app/
- If you record a Loom/MP4, add the link here: **(add link)**

---

## Submission links

- **GitHub repo:** (this repository)
- **Live demo:** https://deriverse-analytics-v1tz.vercel.app/
- **X (Twitter):** https://x.com/KhadiraOussama
