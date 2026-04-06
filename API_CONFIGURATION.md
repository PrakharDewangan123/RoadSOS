# API Configuration Guide

## 🗺️ Map Routing Configuration

### Current Setup (Default - No API Key Needed)

The app currently uses **OSRM (Open Source Routing Machine)** which is:
- ✅ **Completely FREE**
- ✅ **No API Key Required**
- ✅ **No Rate Limits for Reasonable Use**
- ✅ **Perfect for Development & Demo**
- ✅ **Production-ready for small/medium apps**

**Location to change**: `/src/app/components/SafeMap.tsx` (Line ~200)

**Current implementation**:
```javascript
const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination[1]},${selectedDestination[0]}?overview=full&geometries=geojson`;
```

---

## 🔑 Option 1: OpenRouteService (Recommended for Production)

### Why Upgrade?
- Better rate limits
- More routing profiles (walking, cycling, wheelchair)
- Advanced options (avoid highways, prefer green areas)
- Elevation data
- Isochrones (reachability analysis)

### How to Get API Key
1. Visit: [https://openrouteservice.org/dev/#/signup](https://openrouteservice.org/dev/#/signup)
2. Create free account
3. Verify email
4. Go to dashboard and generate API key
5. **Free tier**: 2,000 requests/day

### Implementation

**File**: `/src/app/components/SafeMap.tsx`  
**Function**: `fetchRoute` (around line 200)

**Replace this**:
```javascript
const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedDestination[1]},${selectedDestination[0]}?overview=full&geometries=geojson`;
```

**With this**:
```javascript
const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=YOUR_API_KEY_HERE&start=${userLocation[1]},${userLocation[0]}&end=${selectedDestination[1]},${selectedDestination[0]}`;
```

**Then update response parsing**:
```javascript
// Change from:
const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

// To:
const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
// Response format is similar, but verify in OpenRouteService docs
```

### Routing Profiles Available
- `foot-walking` - Pedestrian routes (recommended for safety)
- `driving-car` - Car routes
- `cycling-regular` - Bicycle routes
- `wheelchair` - Accessible routes

---

## 🔑 Option 2: Mapbox Directions API

### Why Use Mapbox?
- Beautiful map tiles
- Traffic-aware routing
- Offline capability
- Advanced customization
- Turn-by-turn navigation

### How to Get API Key
1. Visit: [https://account.mapbox.com/auth/signup/](https://account.mapbox.com/auth/signup/)
2. Create free account
3. Get access token from dashboard
4. **Free tier**: 100,000 requests/month

### Implementation

**File**: `/src/app/components/SafeMap.tsx`

**Replace fetchRoute function with**:
```javascript
const fetchRoute = async () => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[1]},${userLocation[0]};${selectedDestination[1]},${selectedDestination[0]}?geometries=geojson&access_token=YOUR_MAPBOX_TOKEN`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      
      // Remove old polyline
      if (routePolylineRef.current) {
        mapRef.current!.removeLayer(routePolylineRef.current);
      }

      // Add new polyline
      const polyline = L.polyline(coordinates, {
        color: "#8B5CF6",
        weight: 6,
        opacity: 0.8,
      }).addTo(mapRef.current!);

      routePolylineRef.current = polyline;

      // Fit bounds
      const bounds = L.latLngBounds([userLocation, selectedDestination]);
      mapRef.current!.fitBounds(bounds, { padding: [50, 50] });

      // Update route info
      const distance = route.distance; // in meters
      const duration = route.duration; // in seconds
      setRouteInfo({ distance, duration });

      if (onRouteCalculated) {
        onRouteCalculated(distance, duration);
      }

      toast.success("✓ Safe route calculated", {
        description: `Distance: ${(distance / 1000).toFixed(2)}km, Time: ${Math.round(duration / 60)}min`,
      });
    }
  } catch (error) {
    console.error("Error fetching route:", error);
    toast.error("Failed to calculate route");
  }
};
```

---

## 🔑 Option 3: Google Maps Directions API

### Why Use Google Maps?
- Most accurate data
- Best global coverage
- Real-time traffic
- Extensive POI database
- Street view integration

### How to Get API Key
1. Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create project
3. Enable "Directions API"
4. Create credentials (API key)
5. Restrict key to Directions API only
6. **Pricing**: $5 per 1,000 requests (includes $200 free credit/month)

### Implementation

**Note**: Google Maps requires different approach since it doesn't return GeoJSON directly.

**File**: `/src/app/components/SafeMap.tsx`

**Replace fetchRoute with**:
```javascript
const fetchRoute = async () => {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation[0]},${userLocation[1]}&destination=${selectedDestination[0]},${selectedDestination[1]}&mode=walking&key=YOUR_GOOGLE_API_KEY`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Decode polyline
      const coordinates = decodePolyline(route.overview_polyline.points);
      
      // Remove old polyline
      if (routePolylineRef.current) {
        mapRef.current!.removeLayer(routePolylineRef.current);
      }

      // Add new polyline
      const polyline = L.polyline(coordinates, {
        color: "#8B5CF6",
        weight: 6,
        opacity: 0.8,
      }).addTo(mapRef.current!);

      routePolylineRef.current = polyline;

      // Fit bounds
      const bounds = L.latLngBounds([userLocation, selectedDestination]);
      mapRef.current!.fitBounds(bounds, { padding: [50, 50] });

      // Get distance and duration from first leg
      const leg = route.legs[0];
      const distance = leg.distance.value; // meters
      const duration = leg.duration.value; // seconds
      
      setRouteInfo({ distance, duration });

      if (onRouteCalculated) {
        onRouteCalculated(distance, duration);
      }

      toast.success("✓ Safe route calculated", {
        description: `Distance: ${(distance / 1000).toFixed(2)}km, Time: ${Math.round(duration / 60)}min`,
      });
    }
  } catch (error) {
    console.error("Error fetching route:", error);
    toast.error("Failed to calculate route");
  }
};

// Helper function to decode Google's polyline format
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
}
```

---

## 📊 API Comparison

| Feature | OSRM (Current) | OpenRouteService | Mapbox | Google Maps |
|---------|---------------|------------------|---------|-------------|
| **Cost** | Free | Free (2k/day) | Free (100k/month) | $5/1k requests |
| **API Key** | ❌ Not needed | ✅ Required | ✅ Required | ✅ Required |
| **Setup Time** | 0 minutes | 5 minutes | 5 minutes | 10 minutes |
| **Routing Profiles** | Basic | Extensive | Good | Excellent |
| **Global Coverage** | Good | Good | Excellent | Best |
| **Real-time Traffic** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Safety Features** | Basic | Good | Good | Best |
| **Rate Limits** | Reasonable use | 2,000/day | 100,000/month | 200k free/month |

---

## 🎯 Recommendation by Use Case

### Development & Testing
**Use**: OSRM (current setup)  
**Why**: No setup, works immediately

### Small Production App (<2000 routes/day)
**Use**: OpenRouteService  
**Why**: Free, good features, easy upgrade from OSRM

### Medium Production App
**Use**: Mapbox  
**Why**: Great free tier, excellent features

### Large Production App / Enterprise
**Use**: Google Maps  
**Why**: Best accuracy, unlimited features, pay-per-use

---

## 🔐 API Key Security Best Practices

### ⚠️ NEVER commit API keys to Git!

1. **Use Environment Variables**
   ```bash
   # Create .env file
   VITE_OPENROUTE_API_KEY=your_key_here
   VITE_MAPBOX_TOKEN=your_token_here
   ```

2. **Access in Code**
   ```typescript
   const apiKey = import.meta.env.VITE_OPENROUTE_API_KEY;
   const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&...`;
   ```

3. **Add .env to .gitignore**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

4. **Use Key Restrictions**
   - Restrict by HTTP referrer (domain)
   - Restrict by API service
   - Set up usage alerts

---

## 📝 Summary

**Current Status**: ✅ **Fully Functional - No API Key Needed**

**The app works perfectly out of the box!** The OSRM integration requires no configuration and provides:
- ✅ Route calculation
- ✅ Distance and duration
- ✅ Visual route display
- ✅ No rate limits for normal use

**Only upgrade if you need**:
- Higher rate limits
- Traffic-aware routing
- Advanced safety features
- Commercial support

---

**Questions?** Check the inline comments in `/src/app/components/SafeMap.tsx` around line 200 for the exact location to modify!
