# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the creator of Next.js and offers the best integration.

### Option 1: GitHub Integration (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Trading analytics dashboard"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Select this repository
   - Keep default settings
   - Click "Deploy"

3. **Done!** Your site is live at `your-project.vercel.app`

### Option 2: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts, accept defaults
```

### Option 3: Direct Git Push

```bash
# If using Vercel Git
git push vercel main
```

---

## Environment Variables

No environment variables required for demo mode.

If adding real features later:

```bash
# .env.local (local development)
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_HELIUS_API_KEY=your_key_here

# .env.production (Vercel)
# Add same variables in Vercel dashboard:
# Settings → Environment Variables
```

---

## Pre-Deployment Checklist

- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts successfully
- [ ] `pnpm build` completes without errors
- [ ] All pages are accessible (`/`, `/dashboard`, etc)
- [ ] Charts display data
- [ ] Filters work
- [ ] Export functions work
- [ ] No console errors

**Run pre-flight check:**
```bash
pnpm install
pnpm build
```

---

## Build Optimization

### Check Bundle Size

```bash
# Install package
npm install --save-dev @next/bundle-analyzer

# Add to next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
  // existing config
})

# Run analysis
ANALYZE=true npm run build
```

### Expected Bundle Size
- **Main JS**: ~200KB (gzipped)
- **CSS**: ~50KB (gzipped)
- **Total**: ~250KB (acceptable)

### Optimization Tips Already Done
✓ Code splitting (per route)
✓ Lazy loading components
✓ Dynamic imports
✓ Image optimization ready
✓ CSS minification
✓ JS minification

---

## Performance Monitoring

### Set Up Vercel Analytics

1. In Vercel Dashboard:
   - Select your project
   - Settings → Analytics
   - Enable Web Analytics
   - Enable Speed Insights

2. Monitor:
   - Page load times
   - Core Web Vitals
   - User interactions
   - Error rates

### Expected Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

---

## Custom Domain

1. Go to Vercel Dashboard
2. Select project → Settings → Domains
3. Add your domain:
   - `vercel.com` → Transfer registrar
   - `namecheap.com` → Add CNAME
   - `godaddy.com` → Add CNAME
4. Point DNS to Vercel nameservers
5. SSL certificate auto-issued

---

## Security Headers

### Add to vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## Environment-Specific Settings

### Development (.env.local)
```
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production (.env.production)
```
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### Staging (Optional)
```
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_API_URL=https://staging.yourdomain.com
```

---

## Database Setup (When Needed)

### For Trade History Persistence

**Option 1: Supabase (Recommended)**
```bash
npm install @supabase/supabase-js

# Set env vars in Vercel
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
```

**Option 2: Firebase**
```bash
npm install firebase

# Set Firebase config in env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

**Option 3: PostgreSQL (Neon)**
```bash
npm install pg

# Set database URL
DATABASE_URL=postgresql://user:pass@host/db
```

---

## Authentication Setup (When Needed)

### NextAuth.js Configuration

```bash
npm install next-auth

# Generate secret
openssl rand -base64 32
```

### Solana Wallet Integration

```bash
npm install @solana/web3.js @solana/wallet-adapter-react

# Set RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

---

## Monitoring & Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs

# Initialize in next.config.js
# Set SENTRY_AUTH_TOKEN in env
```

### LogRocket (User Session Replay)

```bash
npm install logrocket

# Add to app initialization
# Set LOGROCKET_APP_ID in env
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Rollback Strategy

### If Deployment Fails

1. **Vercel Dashboard**:
   - Deployments → Select previous version
   - Click "Promote to Production"

2. **Manual Rollback**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Version Management**:
   - Keep 5-10 recent deployments
   - Tag important versions in Git

---

## Testing Before Production

### Staging Environment

```bash
# Test build locally
npm run build
npm start

# Or deploy to staging branch
git checkout -b staging
git push origin staging
# Configure Vercel to build staging branch
```

### Automated Testing

```bash
# Install testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Create __tests__ folder
# Write tests for components
```

---

## Post-Deployment Checklist

- [ ] Site loads without errors
- [ ] All pages accessible
- [ ] Mobile responsive
- [ ] Forms working
- [ ] Exports functional
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Analytics enabled
- [ ] DNS configured
- [ ] SSL certificate valid

---

## Maintenance Schedule

### Daily
- Monitor error rates (Sentry)
- Check site availability
- Review user feedback

### Weekly
- Analyze performance metrics
- Review analytics
- Check for security updates

### Monthly
- Update dependencies
  ```bash
  npm update
  npm audit fix
  ```
- Review usage patterns
- Plan feature releases

### Quarterly
- Security audit
- Performance optimization
- Backup verification

---

## Cost Estimate (Vercel)

### Free Tier (Good for MVP)
- ✓ 100GB bandwidth/month
- ✓ Unlimited deployments
- ✓ 10 Serverless Functions
- ✓ Automatic HTTPS
- Cost: **$0/month**

### Pro Plan (Recommended)
- ✓ 1TB bandwidth/month
- ✓ Priority support
- ✓ Analytics
- ✓ Monitoring
- Cost: **$20/month** (+ usage)

### Enterprise
- Custom domain support
- Custom limits
- Dedicated support
- Cost: **Custom pricing**

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
pnpm install
pnpm build
```

### Pages Not Loading

1. Check function logs:
   ```bash
   vercel logs
   ```

2. Verify environment variables are set

3. Check for 404 errors:
   ```bash
   # Add vercel.json redirects
   ```

### Performance Issues

1. Check bundle size:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

2. Optimize images:
   - Use Next.js Image component
   - Set proper dimensions
   - Use WebP format

3. Check waterfall in DevTools

---

## Disaster Recovery

### Backup Strategy
- GitHub is primary backup
- Vercel keeps 30-day deploy history
- Export data regularly if using database

### Recovery Steps
1. Pull latest from GitHub
2. Deploy to new Vercel project
3. Update DNS
4. Restore data from backups

---

## Cost Optimization

### Reduce Bandwidth
- Enable image optimization
- Gzip compression (automatic)
- Code splitting (built-in)
- Remove unused dependencies

### Reduce Function Calls
- Cache API responses
- Use client-side rendering where possible
- Batch requests

### Database Optimization
- Use connection pooling
- Index frequently queried columns
- Archive old data

---

## Scaling Strategy

### If Traffic Increases

1. **Monitor**: Set up alerts
   ```
   Vercel Dashboard → Project → Monitor
   ```

2. **Optimize**: Use insights
   - Check Core Web Vitals
   - Identify slow pages
   - Fix bottlenecks

3. **Scale**: Upgrade plan
   - Increase limits
   - Add database replicas
   - Use CDN

4. **Load Test**: Before launch
   ```bash
   npm install -g artillery
   artillery run load-test.yml
   ```

---

## Support & Help

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/help
- **Community**: https://github.com/vercel/next.js/discussions

---

**Ready to deploy! Follow these steps for a production-ready trading analytics dashboard.** 🚀
