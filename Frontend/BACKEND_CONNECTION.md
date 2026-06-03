# Backend-Frontend Connection Guide

## 🔗 Architecture Overview

### Frontend Configuration
```
Frontend: http://localhost:5173 (Vite)
Backend:  http://localhost:3000 (Node.js + Express)
```

### Environment Variables
```
.env          → Base development config
.env.local    → Local overrides (ignored by git)
.env.production → Production config

Key Variables:
- VITE_API_BASE_URL: Backend API URL
- VITE_MAP_API_KEY: Google Maps API key
- VITE_MAP_ID: Google Maps Map ID
```

---

## 📡 API Connection Flow

### 1. Axios Instance Setup
**File**: `src/utils/axiosInstance.ts`

```typescript
const axiosInstance = axios.create({
  baseURL: `${VITE_API_BASE_URL}/api/v1`,
  withCredentials: true,
});
```

**Endpoints Pattern**:
- Base: `http://localhost:3000/api/v1`
- Example: `GET /api/v1/sites` → Fetch all sites
- Example: `POST /api/v1/signin` → User login

### 2. Request Interceptor
- **Content-Type**: Automatically set based on data (JSON or FormData)
- **JWT Token**: Added to headers from localStorage
- **Token Expiry**: Checks if token is expired, logs out if needed

---

## 🔑 Authentication Flow

### Login Process
**File**: `src/providers/auth.provider.ts`

1. User submits email & password
2. Frontend sends POST to `/api/v1/signin`
3. Backend returns: `{ userId, role, token, dashboardTheme }`
4. Frontend stores in localStorage:
   - `authToken`: JWT token for API calls
   - `userId`: User ID
   - `role`: User role (admin, team_lead, organization)
   - `dashboardTheme`: User's theme preference

### Protected Routes
All API requests automatically include JWT token in headers.

---

## 📊 Data Providers

### Resources & Endpoints

| Resource | Provider | Endpoint | Method |
|----------|----------|----------|--------|
| `sites` | siteProvider | `/sites` | GET/POST/PATCH/DELETE |
| `users` | userProvider | `/users` | GET/POST/PATCH/DELETE |
| `sensors` | sensorProvider | `/sensors/get-by-imei-and-parameter` | GET |
| `limits` | limitsProvider | `/limits` | GET/POST/PATCH |
| `archives` | archivesProvider | `/archives` | GET/POST |

### Example: Fetching Sites
```typescript
const { data: siteData, isLoading } = useList({
  resource: "sites",
  dataProviderName: "default",
});
```

**API Call**: `GET /api/v1/sites`

**Response Format**:
```json
{
  "data": [
    {
      "_id": "site-id",
      "name": "Tower Name",
      "display_name": "Display Name",
      "latitude": 23.98,
      "longitude": 46.50,
      "status": {
        "vibrationAngle": { "message": "...", "status": "normal" },
        "vibrationSpeed": { "message": "...", "status": "warning" }
      },
      "imei": "device-imei"
    }
  ]
}
```

---

## 📈 Sensor Data Flow

### Fetching Sensor Trends
**File**: `src/components/dashboard/SitesMap/PointInfoWindow/index.tsx`

```typescript
const filters = [
  { field: "imei", operator: "eq", value: "device-imei" },
  { field: "parameter", operator: "eq", value: "vibrationDisplacement" },
  { field: "startDateTime", operator: "gte", value: "2026-04-08T00:00:00Z" },
  { field: "endDateTime", operator: "lte", value: "2026-04-08T23:59:59Z" },
];

const { data: sensorData } = useList({
  resource: "sensors",
  dataProviderName: "sensors",
  filters,
});
```

**API Call**:
```
GET /api/v1/sensors/get-by-imei-and-parameter?
    imei=device-imei&
    parameter=vibrationDisplacement&
    startDateTime=2026-04-08T00:00:00Z&
    endDateTime=2026-04-08T23:59:59Z
```

**Response Format**:
```json
{
  "data": [{
    "processedSensorData": [
      { "date": "2026-04-08", "time": "10:30:45", "x": 5.2, "y": 3.1, "z": 2.8 },
      { "date": "2026-04-08", "time": "10:35:45", "x": 5.5, "y": 3.0, "z": 2.9 }
    ],
    "limits": {
      "vibrationDisplacement": {
        "x": { "green": { "min": 0, "max": 3 }, "yellow": {...}, "red": {...} }
      }
    }
  }]
}
```

---

## 🔄 Real-Time Updates (WebSocket)

### Socket.io Connection
**File**: `src/pages/dashboard/index.tsx`

```typescript
const socket = io(VITE_API_BASE_URL);
socket.on("newData", () => {
  // Refetch sites data when new data arrives
  refetchSiteData();
});
```

### Events
- **newData**: Emitted when sensor data is updated
- **Automatically refetches** sites with latest status

---

## 🐛 Common Issues & Solutions

### Issue 1: "NO DATA AVAILABLE IN THE SELECTED TIME SPAN"
**Cause**: 
- Backend returned empty array
- Time range has no data
- IMEI not found in sensors

**Solution**:
- Use preset filters (1h, 6h, 12h, 24h)
- System automatically loads MOCK data if API fails
- Check if sensor is configured on site

### Issue 2: API Returns 401/403
**Cause**: JWT token missing or expired

**Solution**:
- Token expires? Automatic logout triggers
- Check localStorage for `authToken`
- Login again

### Issue 3: CORS Error
**Cause**: Frontend and backend have different origins

**Solution**:
- Backend must have CORS enabled
- Check: `withCredentials: true` in axios

### Issue 4: Map Not Loading
**Cause**: 
- VITE_MAP_API_KEY invalid
- API key disabled in Google Cloud Console

**Solution**:
- Verify API key in `.env.local`
- Check Google Cloud billing/permissions
- Enable Maps JavaScript API

---

## 🚀 Deployment

### Build for Production
```bash
npm run build  # Uses .env.production
```

### .env.production Variables
```
VITE_API_BASE_URL=https://api.theclassictowers.com
VITE_MAP_API_KEY=<production-api-key>
VITE_MAP_ID=<production-map-id>
VITE_ENV=production
```

---

## 📝 Data Model Examples

### Site Object
```typescript
interface Site {
  _id: string;
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  region?: string;
  infrastructure_id?: string;
  status: Record<string, {
    message: string;
    status: "normal" | "warning" | "danger";
  }>;
  imei: string;
  vibrationSensor?: {
    sensorId: string;
  };
}
```

### Sensor Parameter Keys
```
Vibration:
- vibrationAngle
- vibrationDisplacement (x, y, z axes)
- vibrationFrequency (x, y, z axes)
- vibrationSpeed (x, y, z axes)
- vibrationRollAngle
- vibrationPitchAngle

Wind:
- windSpeed
- windTemperature
- windHumidity
- windDirection
```

---

## 🔍 Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] `.env.local` has `VITE_API_BASE_URL=http://localhost:3000`
- [ ] Can login with test credentials
- [ ] Can see sites on map
- [ ] Can view sensor data trends
- [ ] WebSocket connects (check console)
- [ ] Real-time updates work

---

## 📞 API Documentation Reference

See backend README for complete API documentation:
```
theclassictowers-backend/README.md
```

Key endpoints to verify:
- POST `/api/v1/signin` - Login
- GET `/api/v1/sites` - List sites
- GET `/api/v1/sensors/get-by-imei-and-parameter` - Sensor data
- POST `/api/v1/sites` - Create site
- PATCH `/api/v1/sites/:id` - Update site
