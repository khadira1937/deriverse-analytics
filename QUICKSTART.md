# Quick Start Guide - TradeAnalytics Dashboard

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. Start Dev Server
```bash
pnpm dev
```
The app will be running at **http://localhost:3000**

### 3. Explore the Dashboard
- **Landing**: http://localhost:3000/
- **Dashboard**: http://localhost:3000/dashboard (main page)
- **Trades**: http://localhost:3000/trades
- **Journal**: http://localhost:3000/journal
- **Reports**: http://localhost:3000/reports
- **Settings**: http://localhost:3000/settings

---

## 📊 What You'll See

### Dashboard (Main Judge Page)
- **12 KPI cards** showing trading metrics (all populated with mock data)
- **Equity curve chart** showing cumulative profit/loss
- **Daily P&L chart** with best/worst day highlights
- **Symbol performance table** showing winners and losers

### Key Features
✅ **Data Mode Switch** (top header) - Switch between Demo/CSV/On-chain
✅ **Solana Address Input** - With validation (no real connection needed)
✅ **Symbol Filter** - Filter trades by symbol
✅ **Animated Grid Background** - Toggle in Settings page
✅ **Export Functionality** - CSV on trades, JSON on reports
✅ **Full Responsiveness** - Works on mobile/tablet/desktop

---

## 🎨 Customization

### Change Colors
Edit `/app/globals.css`:
```css
:root {
  --primary: 180 100% 50%;      /* Cyan accent */
  --background: 0 0% 3%;        /* Almost black */
  /* ... other colors ... */
}
```

### Toggle Grid Background
1. Go to `/settings`
2. Toggle "Animated Grid Background"
3. Effect applies instantly to all pages

### Adjust Data
1. Mock trades in `/lib/mock/trades.ts`
2. KPI calculations in `/lib/mock/kpis.ts`
3. Journal entries in `/lib/mock/journal.ts`

---

## 📱 Mobile Responsive

All pages are fully responsive:
- **Mobile** (< 640px): Single column, compact spacing
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (> 1024px): 3-4 columns with full features

Test with browser DevTools (F12) → Toggle device toolbar

---

## 🧪 Try These Actions

1. **View Dashboard**
   - Click on any KPI to see tooltip
   - Charts are interactive (hover for details)

2. **Filter Trades**
   - Go to `/trades`
   - Filter by Side, Outcome, Order Type
   - Sort by clicking column headers
   - Export as CSV

3. **Create Journal Entry**
   - Go to `/journal`
   - Click "New Entry" button
   - Fill form and submit
   - Entry appears at top of list

4. **Generate Report**
   - Go to `/reports`
   - Click "Download JSON" to get actual report file
   - Click "Copy Public Link" to generate shareable URL

5. **Change Settings**
   - Go to `/settings`
   - Toggle grid background
   - Change decimal places
   - Select currency

---

## 💡 Tips

- **Dark Theme**: Always active (built for dark mode)
- **Animations**: Subtle and performant (can be disabled with prefers-reduced-motion)
- **Data**: All mock data resets on page reload (no persistence yet)
- **Exports**: CSV and JSON exports work fully
- **Responsive**: Resize browser to see adaptive layout

---

## 🔧 Project Structure

```
Key Files:
├── app/layout.tsx          ← Root wrapper (providers, header)
├── app/page.tsx            ← Landing page
├── app/dashboard/page.tsx  ← Main dashboard
├── app/globals.css         ← Dark theme colors
├── lib/types.ts            ← TypeScript interfaces
├── lib/context/app-context.tsx  ← Global state
└── lib/mock/               ← Mock data generators
```

---

## 📚 Documentation

- **Full Feature Docs**: See `TRADING_DASHBOARD.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Type Definitions**: Check `lib/types.ts`

---

## ⚡ Performance

- Built-in code splitting (Next.js)
- Optimized charts (Recharts)
- Smooth animations (Framer Motion)
- Lightweight animations (no third-party JS)

---

## 🛠️ Development

### Add New Page
1. Create folder in `/app`
2. Add `page.tsx` with 'use client' directive
3. Import components and build UI
4. Add link to header navigation

### Add New Component
1. Create in `/components/[category]/`
2. Export from component
3. Import and use in pages

### Modify Mock Data
1. Edit `/lib/mock/trades.ts`
2. Update calculations in `/lib/mock/kpis.ts`
3. Changes reflect instantly on reload

---

## 🚀 Deploy to Vercel

```bash
# Connect GitHub repo and deploy
vercel deploy

# Or install Vercel CLI
npm i -g vercel
vercel
```

One-click deployment with zero config!

---

## ❓ FAQ

**Q: Why is data not persisting?**
A: No database connected yet. Data resets on page reload. Persistence can be added with Supabase/Firebase.

**Q: Can I connect a real Solana wallet?**
A: Not yet - UI is ready, just needs backend integration (Helius/Magic Eden API).

**Q: How do I customize colors?**
A: Edit CSS variables in `/app/globals.css` or Tailwind config.

**Q: Is the grid background performance OK?**
A: Yes - it uses optimized SVG and Framer Motion GPU acceleration.

**Q: Can I export to PDF?**
A: JSON export works. PDF needs server-side library (next on roadmap).

---

## 🎯 What's Working

✅ All 6 pages with mock data
✅ All KPI cards and charts
✅ Trade table with filters and export
✅ Journal with new entry form
✅ Report generator with JSON export
✅ Settings with toggles
✅ Dark fintech theme
✅ Animated grid background
✅ Responsive design
✅ Toast notifications

---

## 📋 Next Steps

1. Read `TRADING_DASHBOARD.md` for full feature list
2. Explore each page to understand the UI
3. Check `/lib/types.ts` to see data structures
4. Modify `/lib/mock/` to customize data
5. Deploy to Vercel when ready

---

**Happy trading! 🚀**

For detailed documentation, see TRADING_DASHBOARD.md
For implementation details, see IMPLEMENTATION_SUMMARY.md
