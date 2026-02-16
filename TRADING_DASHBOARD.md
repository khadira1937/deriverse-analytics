# TradeAnalytics - Solana Trading Dashboard

Premium fintech trading analytics dashboard built for Solana derivatives traders on the Deriverse platform.

## Features

### Core Pages

1. **Landing Page** (`/`)
   - Hero section with feature overview
   - Stats showcase
   - CTA buttons to dashboard

2. **Dashboard** (`/dashboard`)
   - 12 KPI cards with real-time updates:
     - Total PnL, Win Rate, Trade Count, Total Volume
     - Total Fees, Avg Trade Duration, Long/Short Ratio
     - Largest Gain/Loss, Avg Win/Loss, Risk/Reward ratio
   - Equity Curve chart with drawdown visualization
   - Daily P&L bars with best/worst day highlights
   - Symbol Performance table (winners/losers)

3. **Trades** (`/trades`)
   - Advanced filterable trade table (TanStack React Table)
   - Filters: Symbol, Side (Long/Short), Outcome, Order Type
   - Columns: Time, Symbol, Side, Size, Entry, Exit, PnL, Fees, Duration, Type
   - Pagination & sorting
   - CSV export functionality

4. **Journal** (`/journal`)
   - New entry modal with form
   - Fields: Title, Setup Type, Confidence (1-10), Notes
   - Analytics cards: Total Entries, Avg Confidence, Best Setup, Common Mistakes
   - Entry list with timestamp and preview

5. **Reports** (`/reports`)
   - Report generator with date range filters
   - Performance summary KPI cards
   - Top 5 winning trades showcase
   - Risk metrics dashboard
   - Export as PDF (UI only), JSON, or shareable link

6. **Settings** (`/settings`)
   - Dark theme toggle (always dark)
   - Animated grid background toggle
   - Compact mode toggle
   - Decimal places setting
   - Currency display option
   - Data modes explanation
   - Security & privacy info

### Global Header
- Logo with animated orbit icon
- Navigation links
- Data Mode switch: **Demo | CSV | On-chain**
- Solana address input (with validation)
- Symbol filter dropdown
- Date range picker (UI placeholder)

### Technical Features

- **Animated Grid Background**: Optional 3D perspective grid with cyan/purple gradients (toggleable in settings)
- **Responsive Design**: Mobile-first, optimized for all screen sizes
- **Data Modes**:
  - Demo: Mock dataset with 150+ realistic trades
  - CSV: Placeholder for upload (UI simulation)
  - On-chain: Placeholder for Solana wallet connection (UI simulation)
- **UI States**: Loading skeletons, empty states, error toasts, success notifications
- **Performance**: Optimized charts with Recharts, lightweight animations with Framer Motion

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom dark fintech theme
- **UI Components**: shadcn/ui + custom fintech-styled glass panels
- **Charts**: Recharts (equity curves, daily PnL, symbol performance)
- **Tables**: TanStack React Table (advanced trade history)
- **Animations**: Framer Motion (subtle, performance-optimized)
- **Toasts**: Sonner (dark theme notifications)
- **Icons**: Lucide React

## Color Palette (Dark Fintech)

- **Background**: `#050505` (rgb 5, 5, 5)
- **Primary Accent**: Cyan (`#00ffff` / `#22c55e`)
- **Secondary**: Blue/Purple (`#3b82f6` / `#8b5cf6`)
- **Neutrals**: Grays & whites with proper contrast
- **Success**: Green (`#10b981`)
- **Warning/Error**: Orange/Red

## File Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Landing page
├── dashboard/
│   └── page.tsx           # Dashboard overview
├── trades/
│   └── page.tsx           # Trade history with table
├── journal/
│   └── page.tsx           # Trading journal
├── reports/
│   └── page.tsx           # Report generator
├── settings/
│   └── page.tsx           # Settings & preferences
├── globals.css            # Dark theme + animations
components/
├── layout/
│   ├── header.tsx         # Global header
│   ├── logo.tsx           # Logo component
│   └── grid-background.tsx # Animated grid
├── dashboard/
│   ├── kpi-card.tsx       # KPI card component
│   ├── equity-curve-chart.tsx
│   ├── daily-pnl-chart.tsx
│   └── symbol-performance-card.tsx
├── ui/
│   └── data-table.tsx     # TanStack React Table wrapper
lib/
├── types.ts               # Core types (Trade, Position, JournalEntry, etc)
├── context/
│   └── app-context.tsx    # Global app state (dataMode, settings)
└── mock/
    ├── trades.ts          # Mock trade generator
    ├── kpis.ts            # Mock KPI calculations
    └── journal.ts         # Mock journal entries
```

## Mock Data

- **Trades**: 150 realistic trades with random symbols (SOL, BTC, ETH, JUP, RAY, ORCA)
- **KPIs**: Auto-calculated from trade data
- **Equity Curve**: Cumulative PnL simulation
- **Daily P&L**: Aggregated daily performance
- **Journal Entries**: 30 sample entries with various setups
- **Symbol Performance**: Top winners/losers by PnL

## Usage

1. **Start dev server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. **Access dashboard**: Open http://localhost:3000/dashboard
3. **Try data modes**: Use the header switch to toggle Demo/CSV/On-chain (UI simulation)
4. **Export data**: Use CSV export on trades page or JSON on reports page
5. **Toggle features**: Use settings page to toggle grid background & compact mode

## UI/UX Features

- **Glass panels**: Semi-transparent cards with blur effect
- **Neon accents**: Cyan highlights on hover, interactive elements
- **Smooth animations**: Page transitions, card reveals, chart animations
- **Tooltips**: Info icons on KPI cards with explanations
- **Toast notifications**: Success/error feedback for all actions
- **Loading states**: Skeleton cards, disabled states
- **Responsive grid**: Adapts from 1 column (mobile) → 4 columns (desktop)

## Data Mode Behavior (Stubs)

- **Demo Dataset**: Fully functional with mock data
- **CSV Import**: Shows modal with example format (submit button disabled)
- **On-chain**: Shows connection steps (connect button disabled)

All data mode switches show toast confirmations and update the UI context. No actual API calls or blockchain integration yet.

## Security & Privacy

- No private keys stored or requested
- All data processing client-side (except optional cloud sync)
- Read-only Solana wallet connection model
- Fully documented in settings page

## Future Enhancements

- Real on-chain data integration via Solana RPC
- CSV import parser & validation
- PDF report generation (server-side)
- Cloud sync & backup
- Real-time price feeds
- Alerts & notifications
- Mobile app
- Dark/light theme toggle

---

Built with ❤️ for Solana traders. Privacy first, features second.
