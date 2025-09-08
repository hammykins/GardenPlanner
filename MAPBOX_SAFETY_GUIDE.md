# 🚨 Mapbox Setup with Usage Protection

## Quick Setup (5 minutes)

### 1. Get Your Free Mapbox Token
1. Visit https://account.mapbox.com/
2. Sign up (email only, no credit card required initially)
3. Go to your dashboard
4. Copy your "Default public token" (starts with `pk.`)

### 2. Configure Your App
1. Copy `.env.example` to `.env` in your frontend folder:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Edit `.env` and replace `pk.your_mapbox_token_here` with your actual token
3. Restart your dev server:
   ```bash
   npm run dev
   ```

## 🛡️ Built-in Usage Protection

Your garden planner includes **automatic usage monitoring**:

### Browser Console Alerts
- **50% usage**: Warning logged to console
- **75% usage**: Warning logged to console  
- **90% usage**: Browser alert popup + console error

### Daily Usage Tracking
- Resets automatically each day
- Tracks only actual map loads (not API data calls)
- Stores count in browser localStorage

### Check Your Usage
Open browser console (F12) to see:
```
📊 Mapbox Daily Usage: 15/50,000 loads
```

## 🔒 Additional Mapbox Safety Setup

### Account-Level Protection (Recommended)
1. Log into your Mapbox account
2. Go to **Account → Usage**
3. Set up **Email Alerts**:
   - Alert at 75% of monthly limit
   - Alert at 90% of monthly limit
4. **Optional**: Set a spending cap in billing settings

### Usage Limits Breakdown
- **Free Tier**: 50,000 map loads/month
- **What Counts**: Map rendering, zooming, style changes
- **What's Free**: API calls to OpenStreetMap, weather APIs, plant databases
- **Overage Cost**: $5 per 1,000 additional loads (only if you add a credit card)

## 🌱 Smart Usage Tips

### Minimize Map Loads
- Each page refresh = 1 load
- Zooming/panning = no additional loads
- Drawing polygons = no additional loads
- Switching between satellite/street = 1 load per switch

### Development vs Production
- **Development**: Reloads count toward your limit
- **Production**: Only end-user visits count
- **Tip**: Use Leaflet version during heavy development

## 🆘 Emergency Fallback

If you approach your limit, the app can automatically fall back to the free Leaflet version:

```typescript
// In MapboxGardenPlanner.tsx
const currentUsage = parseInt(localStorage.getItem('mapbox-daily-loads') || '0');
if (currentUsage >= 48000) { // 96% of limit
  // Automatically switch to Leaflet mode
  return <LeafletGardenPlanner {...props} />;
}
```

## ✅ You're Protected!

With this setup:
- ❌ **No surprise charges** (requires credit card to exceed free tier)
- ✅ **Multiple warning systems** (console + browser alerts + email)
- ✅ **Daily usage tracking** (automatic reset)
- ✅ **Free fallback option** (Leaflet version available)
- ✅ **Smart usage** (external APIs don't count toward limit)

Your garden planner is now safe to use for learning and development!
