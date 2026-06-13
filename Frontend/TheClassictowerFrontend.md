# The Classic Towers Frontend - Complete Documentation

## 1. Project Overview

**Project Name:** The Classic Towers Frontend
**Application Type:** Real-time Sensor Monitoring & Tower/Site Management Dashboard
**Version:** 1.0.0

### Purpose
This application is a **smart tower/communications site monitoring system** that monitors multiple tower locations in real-time. It includes sensor data visualization, alerts, and administrative controls.

**Primary Use Case:** Monitor tower structural integrity, vibration, wind conditions, temperature, and humidity across multiple geographic locations with real-time alerting.

---

## 2. Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 18.0.0 |
| Language | TypeScript | 5.4.2 |
| Build Tool | Vite | 5.1.6 |
| Admin Framework | Refine | 4.57.5 |
| UI Library | Material-UI (MUI) | 5.16.14 |
| Routing | React Router DOM | 6.8.1 |
| Form Management | React Hook Form | 7.43.5 |
| HTTP Client | Axios | 1.7.7 |
| Real-time | Socket.IO Client | 4.8.1 |
| Mapping | Google Maps API | @vis.gl/react-google-maps |
| Charts | Recharts | 2.13.3 |
| Date/Time | date-fns, dayjs | Latest |
| Authentication | JWT (jwt-decode) | 4.0.0 |

---

## 3. Features & Pages

### 3.1 Dashboard Page (`/`)

**Purpose:** Real-time overview of all monitored sites with alerts and health status.

**Key Features:**

#### A. Sites Map (Interactive Google Map)
- Displays all tower locations with markers
- Clustered markers for visual organization
- Draggable info windows showing site details
- Color-coded status indicators:
  - Red/Danger - Critical alert
  - Yellow/Warning - Warning alert
  - Green/Normal - Normal status
- Custom pin markers with status visualization

#### B. System Alerts Table
- Top alert banner displaying critical and warning level alerts
- Latest alerts sorted by severity (danger > warning > normal)
- Last update timestamp
- Archives modal button for historical alerts
- Real-time updates via Socket.IO

#### C. Real-time Data Streaming
- Socket.IO integration for live data updates
- Automatic UI refresh when new data arrives
- WebSocket connection to backend

---

### 3.2 Sites Management (`/sites`)

**List Page (`/sites`):**
- DataGrid table showing all sites
- Columns: IMEI, Site Name, Latitude, Longitude
- Filterable columns
- Actions: Edit (admin only), Show, Delete (admin only)

**Create Page (`/sites/create`):**
- Admin-only site creation
- Fields: Site Name, Display Name, Latitude, Longitude, IMEI

**Show Page (`/sites/show/:id`):**
- Detailed view of a single site
- Display: Name, Display Name, Latitude, Longitude
- Read-only view

**Edit Page (`/sites/edit/:id`):**
- Admin-only site editing
- Editable fields: Site name, display name
- Read-only fields: Latitude, Longitude

**Access Control:**
- All roles can view sites
- Only admins can edit/delete sites

---

### 3.3 Users/Operators Management (`/users`)

**List Page (`/users`):**
- DataGrid of all operators
- Columns: ID, Email, Role (admin/operator), Approval Status
- Actions: Edit, Show, Delete

**Edit Page (`/users/edit/:id`):**
- User profile management
- Editable fields: Name, Email, Role, Approval Status
- Profile picture upload with preview
- Email verification status (read-only)
- Site assignment for team leads

**Role Restrictions:**
- Team leads can only modify operators
- Admins can modify all users

**Show Page (`/users/show/:id`):**
- View user details

---

### 3.4 Sensor Limits Configuration (`/limits`)

**Purpose:** Configure sensor alert thresholds

**List Page (`/limits`):**
- DataGrid of sensor parameter limits
- Columns: Last Updated, Longitude, Latitude, Actions
- Actions: Show, Edit (admin only), Delete (admin only)

**Edit Page (`/limits/edit/:id`):**

**Vibration Parameters:**
- Angle (X/Y/Z axis)
- Displacement (X/Y/Z axis)
- Speed (X/Y/Z axis)
- Frequency (X/Y/Z axis)
- Each has Green/Yellow/Red zones with Min/Max values

**Environmental Parameters:**
- Wind Direction & Speed
- Temperature
- Humidity

**Orientation:**
- Pitch Angle
- Roll Angle

---

### 3.5 Authentication Pages (`/auth`)

| Page | Route | Description |
|------|-------|-------------|
| Sign In | `/login` | Email/password login |
| Sign Up | `/register` | User registration with role selection (Operator/Team Lead) |
| Verify OTP | `/verify-otp` | Email verification using 6-digit OTP |
| Forgot Password | `/forgot-password` | Password reset flow |
| Update Password | `/update-password` | Finalize password reset after OTP verification |

**Features:**
- **Password Policy:** Minimum validation of 2 letters, 2 numbers, and 2 special characters required.
- **Movable Forms:** All auth forms are wrapped in a draggable and resizable `MovableForm` component.
- **Conditional Fields:** Operators ko register karte waqt "Team Lead ID" dena compulsory hai.
- Custom styled forms with validation
- Loading states during authentication

---

### 3.6 System Archives (Modal)

- Paginated historical alert records
- Displays: date, time, site name, alert message
- Color-coded by status
- Real-time updates via Socket.IO
- Manual refresh capability
- Fixed 10-item page size
- Caching mechanism for viewed pages

---

## 4. Role-Based Access Control (RBAC)

### User Roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | Can manage all users, sites, limits |
| **Team Lead** | Operator management | Can view limits, manage operators |
| **Operator** | Basic access | Dashboard and site viewing only |

### Access Matrix:

| Feature | Admin | Team Lead | Operator |
|---------|-------|-----------|----------|
| Dashboard | Yes | Yes | Yes |
| View Sites | Yes | Yes | Yes |
| Edit/Delete Sites | Yes | No | No |
| View Users | Yes | Yes | No |
| Manage Users | Yes | Yes (operators only) | No |
| View Limits | Yes | Yes | No |
| Edit Limits | Yes | No | No |

---

## 5. State Management

**Approach:** React Context API

### Contexts:

#### A. AuthContext (`AuthContext.tsx`)
```
State: role, isAuthenticated
Methods: login(), logout(), setRole()
Storage: localStorage (keys: role, userId)
```

#### B. SiteContext (`SiteContext.tsx`)
```
State: selectedSite (coordinates)
Methods: setSelectedSite()
Purpose: Track selected map marker
```

#### C. ColorModeContext (`ColorModeContext.tsx`)
```
State: mode (light/dark)
Methods: toggleMode()
Storage: localStorage (colorMode)
Default: System preference
```

---

## 6. API Integration

### Data Providers:

#### 1. Auth Provider (`auth.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| login() | POST `/signin` | User authentication |
| register() | POST `/signup` | Create new account |
| logout() | POST `/signout` | Terminate session |
| check() | - | Verify auth status |
| getIdentity() | - | Get current user |

#### 2. Site Provider (`site.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| getList() | GET `/sites` | All tower locations |
| getOne() | GET `/sites/:id` | Single site |
| update() | PATCH `/sites/:id` | Modify site |
| deleteOne() | DELETE `/sites/:id` | Remove site |

#### 3. Sensor Provider (`sensor.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| getList() | GET `/sensors/get-by-imei-and-parameter` | Time-series sensor data |

**Query Params:** imei, parameter, startDateTime, endDateTime

#### 4. User Provider (`user.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| getList() | GET `/users` | All operators |
| getOne() | GET `/users/:id` | Single user |
| update() | PATCH `/users/:id` | Modify user |
| deleteOne() | DELETE `/users/:id` | Remove user |

#### 5. Limits Provider (`limits.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| getList() | GET `/limits` | All sensor configs |
| getOne() | GET `/limits/:id` | Single config |
| update() | PATCH `/limits/:id` | Modify thresholds |
| deleteOne() | DELETE `/limits/delete/:id` | Remove config |

#### 6. Archives Provider (`archives.provider.ts`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| getList() | GET `/archives` | Historical alerts |
| create() | POST `/archives` | Log alert |

---

## 7. Axios Configuration

**Base URL:** `${VITE_API_BASE_URL}/api/v1`

### Request Interceptor:
- Automatic Content-Type setting (FormData vs JSON)
- JWT token expiration check
- Auto-logout on expired token

### Response Interceptor:
- Catches 401 responses and triggers auto-logout
- Redirects to `/login` on auth failure

---

## 8. Real-time Features (Socket.IO)

**Connection:** `io(VITE_API_BASE_URL)`

### Events:
| Event | Usage |
|-------|-------|
| `newData` | Dashboard data refresh |
| `newData` | Archives modal update |

**Implementation:**
- Dashboard component listens for site data updates
- ArchivesModal listens for new archive entries
- Updates reflect immediately in UI
- Cleanup: Disconnects on component unmount

---

## 9. Component Structure

### Dashboard Components:

```
components/dashboard/
├── SitesMap/
│   ├── index.tsx (Main map component)
│   ├── Markers.tsx (All site markers)
│   ├── PinMarker.tsx (Individual marker)
│   └── PointInfoWindow/
│       ├── index.tsx (Info window)
│       ├── SensorDataModal/ (Detailed charts)
│       ├── SensorFilterPanel.tsx (Date filtering)
│       └── SensorParametersList.tsx (Parameter selection)
├── SystemAlertsTable/
│   └── index.tsx (Alert table component)
└── ArchivesModal.tsx (Historical alerts modal)
```

### Chart Component:

**RealTimeLineChart.tsx**
- Line chart using Recharts
- Multi-axis support (X/Y/Z for vibration)
- Brush-based zooming (mouse wheel)
- Toggleable data series
- Color-coded lines:
  - X axis: Light green (#90EE90)
  - Y axis: Sea green (#2E8B57)
  - Z axis: Dark green (#006400)

---

## 10. Routing Structure

```
/
├── / (Dashboard) - Protected
├── /sites - Protected (all roles)
│   ├── /sites/edit/:id - Admin only
│   ├── /sites/create - Admin only
│   └── /sites/show/:id - All roles
├── /limits - Admin/TeamLead only
│   ├── /limits/edit/:id - Admin only
│   └── /limits/show/:id - All
├── /users - Admin/TeamLead only
│   ├── /users/edit/:id - Admin/TeamLead
│   └── /users/show/:id - Admin/TeamLead
├── /login - PUBLIC
├── /register - PUBLIC
├── /verify-otp - PUBLIC
├── /forgot-password - PUBLIC
└── /update-password - PUBLIC
```

---

## 11. Theme & Styling

### MUI Theme System:
- **Base Theme:** RefineThemes.Blue
- **Typography:** responsiveFontSizes()
- **Modes:** Dark/Light with toggle

### Custom Theme Colors:
- Primary: Blue
- Success: Green
- Warning: Yellow
- Error: Red

### Styling Approach:
- `sx` props for inline styles
- @emotion/react for CSS-in-JS
- Theme-aware colors and spacing

---

## 12. Project File Structure

```
src/
├── App.tsx                 # Main app with Refine setup
├── index.tsx               # React entry point
├── routes/
│   └── index.tsx           # Route definitions
├── contexts/
│   ├── AuthContext.tsx     # Authentication state
│   ├── SiteContext.tsx     # Site selection state
│   └── ColorModeContext.tsx # Theme state
├── providers/
│   ├── auth.provider.ts    # Auth API calls
│   ├── site.provider.ts    # Sites API calls
│   ├── sensor.provider.ts  # Sensors API calls
│   ├── user.provider.ts    # Users API calls
│   ├── limits.provider.ts  # Limits API calls
│   └── archives.provider.ts # Archives API calls
├── pages/
│   ├── dashboard/          # Dashboard page
│   ├── sites/              # Sites CRUD pages
│   ├── users/              # Users CRUD pages
│   ├── limits/             # Limits CRUD pages
│   └── auth/               # Auth pages
├── components/
│   ├── movable-form/       # Draggable/Resizable form wrapper for Auth
│   ├── dashboard/          # Dashboard components
│   ├── drawer/             # Navigation sidebar
│   ├── header/             # Top bar
│   └── site-assign/        # Site assignment UI
├── utils/
│   ├── axiosInstance.ts    # Axios configuration
│   └── resources.tsx       # Refine resources
├── interfaces/             # TypeScript types
└── theme.ts                # MUI theme definitions
```

---

## 13. Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API endpoint |
| `VITE_MAP_ID` | Google Maps Map ID |
| `VITE_MAP_API_KEY` | Google Maps API key |

---

## 14. Build & Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Type checking
tsc

# Linting
npm run lint

# Formatting
npm run prettier
```

---

## 15. External Integrations

| Integration | Purpose |
|-------------|---------|
| Google Maps API | Interactive site location mapping |
| Socket.IO Server | Real-time data streaming |
| Custom Backend API | CRUD operations |
| JWT Authentication | Token-based security |

---

## 16. Key Architectural Decisions

### 1. Refine Framework
- Abstracts CRUD operations
- Built-in notification system
- Automatic form handling

### 2. Context API vs Redux
- Lightweight approach
- Suitable for simple state
- Direct localStorage integration

### 3. Real-time Architecture
- Socket.IO for server-to-client notifications
- Selective listening on relevant components
- Graceful cleanup

### 4. Performance Optimizations
- Memoized components
- useCallback hooks
- Pagination for large data
- Caching mechanism

---

## Summary

**The Classic Towers Frontend** is a modern, enterprise-grade tower monitoring Single Page Application (SPA) that:

1. Built with **React + TypeScript**
2. Uses **Material-UI** for beautiful UI components
3. Leverages **Refine** for rapid admin interface development
4. Implements **Socket.IO** for real-time capabilities
5. Integrates **Google Maps** for geographic visualization
6. Uses **Recharts** for data visualization

The main purpose of this application is to monitor tower sites, collect data from sensors, generate alerts, and provide administrative controls for different user roles.
