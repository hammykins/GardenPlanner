# Mapbox Setup Guide

## Getting Your Free Mapbox API Key

1. **Visit Mapbox**: Go to https://account.mapbox.com/
2. **Sign Up**: Create a free account (no credit card required)
3. **Get Your Token**: 
   - Go to your account dashboard
   - Copy your "Default public token"
   - It starts with `pk.` (public key)

## Configure Your Garden Planner

1. **Add Your Token**: Open `MapboxGardenPlanner.tsx`
2. **Replace the placeholder**:
   ```typescript
   // Replace this line:
   mapboxgl.accessToken = 'pk.your_mapbox_token_here';
   
   // With your actual token:
   mapboxgl.accessToken = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImFiY2RlZmcifQ.1234567890abcdef';
   ```

## Features You Get

✅ **High-Resolution Satellite Imagery** - Perfect for garden planning
✅ **Professional Drawing Tools** - Much better than Leaflet Draw
✅ **Smooth Performance** - Hardware accelerated rendering
✅ **Mobile Optimized** - Touch-friendly controls
✅ **Vector Styling** - Unlimited customization options
✅ **Free Tier** - 50,000 map loads per month

## Mapbox vs Leaflet Advantages

| Feature | Mapbox | Leaflet |
|---------|---------|---------|
| Drawing Tools | ⭐⭐⭐⭐⭐ Professional | ⭐⭐⭐ Basic |
| Performance | ⭐⭐⭐⭐⭐ Hardware accelerated | ⭐⭐⭐ Software rendering |
| Satellite Quality | ⭐⭐⭐⭐⭐ High resolution | ⭐⭐⭐ Standard |
| Mobile Experience | ⭐⭐⭐⭐⭐ Optimized | ⭐⭐⭐ Basic |
| Customization | ⭐⭐⭐⭐⭐ Unlimited | ⭐⭐⭐⭐ Good |
| 3D Support | ⭐⭐⭐⭐⭐ Native | ❌ None |

## Next Steps

1. Get your Mapbox token
2. Update `MapboxGardenPlanner.tsx` with your token
3. Update `App.tsx` to use the new component
4. Test your garden planner with professional mapping tools!
