# ClassicTowerLab Backend - Advanced Documentation

## Project Overview

**Project Name:** ClassicTowerLab / The Classic Towers API
**Type:** IoT Sensor Monitoring REST API Backend
**Version:** 1.0.0

---

## 1. Technology Stack

| Category | Technology |
|----------|------------|
| **Language** | JavaScript (Node.js with ES6+ modules) |
| **Framework** | Express.js 4.21.2 |
| **Database** | MongoDB with Mongoose ODM 9.0.0 |
| **Authentication** | JWT (jsonwebtoken 9.0.2) + bcryptjs |
| **Real-time** | Socket.io 4.8.1 (WebSocket) |
| **Task Scheduling** | node-cron 3.0.3 |
| **Email Service** | nodemailer 6.10.0 |
| **Caching** | Redis 4.7.0 |
| **Authorization** | CASL/ability 6.7.3 (Role-based) |
| **Validation** | Joi 17.13.3 |
| **Logging** | Winston 3.17.0 |
| **HTTP Client** | axios 1.7.9 |
| **File Upload** | multer 1.4.5-lts.1 |
| **API Documentation** | Swagger/OpenAPI |
| **AI Integration** | OpenRouter API (LLM) |

---

## 2. Directory Structure

```
smart-tower-lab-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── ai.config.js     # OpenRouter AI configuration
│   │   ├── database.config.js # MongoDB connection
│   │   ├── env.config.js    # Environment variables
│   │   ├── logger.config.js # Winston logger setup
│   │   ├── mail.config.js   # Nodemailer configuration
│   │   ├── redis.config.js  # Redis client setup
│   │   ├── swagger.config.js # API documentation
│   │   └── websocket.config.js # Socket.io setup
│   │
│   ├── constants/           # Application constants
│   │   └── index.js         # ROLES, UPLOAD_DIR, siteApi
│   │
│   ├── data-access/         # Data access layer (CRUD operations)
│   │   ├── archives.js
│   │   ├── blacklisted-token.js
│   │   ├── limits.js
│   │   ├── sensor-status.js
│   │   ├── sensor.js
│   │   ├── site.js
│   │   └── user.js
│   │
│   ├── dtos/                # Data Transfer Objects (Joi schemas)
│   │   ├── auth.dto.js      # Sign up/in validation
│   │   ├── limits.dto.js    # Threshold validation
│   │   └── sensor.dto.js    # Sensor data validation
│   │
│   ├── helpers/             # Helper utilities
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js     # JWT verification
│   │   ├── global.middleware.js   # CORS, logging, etc.
│   │   ├── multer.middleware.js   # File upload
│   │   └── validation.middleware.js # Request validation
│   │
│   ├── models/              # Mongoose database schemas
│   │   ├── archives.model.js
│   │   ├── blacklisted-token.model.js
│   │   ├── pending-user.model.js # For account approval flow
│   │   ├── limits.model.js
│   │   ├── sensor-status.model.js
│   │   ├── sensor.model.js
│   │   ├── site.model.js
│   │   └── user.model.js
│   │
│   ├── modules/             # Feature modules
│   │   ├── archives/        # Historical data
│   │   ├── auth/            # Authentication
│   │   ├── email/           # Email services
│   │   ├── limits/          # Threshold configuration
│   │   ├── sensor/          # Sensor data
│   │   ├── site/            # Site management
│   │   └── user/            # User management
│   │
│   ├── policies/            # Authorization policies (CASL)
│   │   └── user.policy.js
│   │
│   ├── routes/              # Main route aggregation
│   │   └── index.js
│   │
│   ├── schedular/           # Task scheduling and cron jobs
│   │   ├── index.js
│   │   ├── api-client.js
│   │   ├── sensor-config.js
│   │   ├── sensor-constants.js
│   │   ├── sensor-data-generator.js
│   │   ├── sensor-utils.js
│   │   ├── site-processor.js
│   │   └── sites.js
│   │
│   ├── server/              # Server initialization
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── email.utils.js
│   │   ├── file.utils.js
│   │   ├── global.utils.js
│   │   └── token.utils.js
│   │
│   ├── views/               # Email templates
│   │   └── *.html
│   │
│   └── index.js             # Application entry point
│
├── public/uploads/          # File upload directory
├── docs/                    # Documentation and swagger specs
├── package.json             # Dependencies and scripts
├── .env                     # Environment configuration
└── env_defaults.md          # Environment variable documentation
```

---

## 3. Feature Modules

### 3.1 Authentication Module

**Location:** `src/modules/auth/`

**Files:**
- `auth.routes.js` - Route definitions
- `auth.controllers.js` - Request handlers
- `auth.services.js` - Business logic

**Features:**
| Feature | Description |
|---------|-------------|
| User Registration | Sign up with password complexity and email verification |
| Account Approval | Multi-stage approval for Team Leads/Operators by Admins |
| User Login | Authentication with JWT token generation |
| User Logout | Token blacklisting |
| Forgot Password | Password recovery flow |
| Email Verification | Secure OTP-based and link-based verification |

---

### 3.2 User Management Module

**Location:** `src/modules/user/`

**Features:**
| Feature | Description |
|---------|-------------|
| Get All Users | Admin/Team Lead access only |
| UX Customization | Persisted **Map Opening Location** (Lat/Lng/Zoom) and **Dashboard Themes** (Hex) |
| Hierarchical Auth | Organization and Team Lead reference tracking |
| Update User | Profile update with Multer-based file upload |
| Delete User | Admin only |
| Get Assigned Sites | View user's sites |
| Assign Sites | Admin assigns sites to users |

---

### 3.3 Site Management Module

**Location:** `src/modules/site/`

**Features:**
| Feature | Description |
|---------|-------------|
| Create Site | New site with coordinates and IMEI |
| Get All Sites | List all monitoring sites |
| Get Site by ID | Retrieve specific site |
| Update Site | Modify site information |
| Delete Site | Remove site from system |

---

### 3.4 Sensor Data Module

**Location:** `src/modules/sensor/`

**Features:**
| Feature | Description |
|---------|-------------|
| Get by Coordinates | Query sensors by location with data sequencing |
| Get by IMEI | Multi-IMEI support with automated normalization |
| Advanced Filtering | Smart date-range parsing with UTC day fallback logic |
| Vibration Data | X/Y/Z axis sensor readings |
| Wind Data | Speed, direction, humidity, temperature |

---

### 3.5 Limits Configuration Module

**Location:** `src/modules/limits/`

**Features:**
| Feature | Description |
|---------|-------------|
| Get All Limits | View all threshold configurations |
| Get by Coordinates | Location-specific limits |
| Update Limits | Modify threshold values |
| Color-coded Ranges | Green/Yellow/Red status levels |

---

### 3.6 Archives Module

**Location:** `src/modules/archives/`

**Features:**
| Feature | Description |
|---------|-------------|
| Get All Archives | Historical sensor data |
| Get by Coordinates | Location-specific history |
| Status Tracking | Historical status changes |

---

### 3.7 Email Module

**Location:** `src/modules/email/`

**Features:**
| Feature | Description |
|---------|-------------|
| Email Verification | Handle verification links |
| Send Verification | Dispatch verification emails |
| Template Rendering | Dynamic email templates |

---

## 4. API Endpoints

### 4.1 Authentication Routes

**Base URL:** `/api/v1`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration (creates PendingUser) | No |
| POST | `/signin` | User login | No |
| POST | `/signout` | User logout | Yes |
| POST | `/forgot-password/:email` | Password recovery | No |
| POST | `/verify-otp` | Verify 6-digit password reset OTP | No |
| POST | `/reset-password` | Set new password with OTP | No |
| GET | `/approve-account` | Admin/Lead approval/rejection via token | No |
| GET | `/verify-email/:token` | Email verification link | No |
---

### 4.2 Site Routes

**Base URL:** `/api/v1/sites`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new site | Yes |
| GET | `/` | Get all sites | Yes |
| GET | `/:siteId` | Get site details | Yes |
| PATCH | `/:siteId` | Update site | Yes |
| DELETE | `/:siteId` | Delete site | Yes |

---

### 4.3 Sensor Routes

**Base URL:** `/api/v1/sensors`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/get-by-coordinates` | Query by location | Yes |
| GET | `/get-by-imei-and-parameter` | Query by IMEI | Yes |

**Advanced Logic:**
- **Date Normalization:** Automatically converts date strings to ISO start/end boundaries.
- **Intelligent Fallback:** If requested time-range returns no data, system automatically expands search to full UTC days to ensure data availability.
- **IMEI Handling:** Supports single strings, comma-separated values, or arrays.

**Query Parameters:**
- `lat` - Latitude coordinate
- `lon` - Longitude coordinate
- `imei` - Device identifier
- `parameter` - Sensor parameter type
- `startDateTime` - Start of time range
- `endDateTime` - End of time range

---

### 4.4 Limits Routes

**Base URL:** `/api/v1/limits`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all limits | Yes |
| GET | `/get-by-coordinates` | Get by location | Yes |
| GET | `/get-by-coordinates-and-parameter` | Get specific limit | Yes |
| GET | `/:limitId` | Get limit by ID | Yes |
| PATCH | `/:limitId` | Update limit | Yes |

---

### 4.5 Archives Routes

**Base URL:** `/api/v1/archives`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all archives | Yes |
| GET | `/get-by-coordinates-and-parameter` | Get by location/param | Yes |

---

### 4.6 User Routes

**Base URL:** `/api/v1/users`

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all users | Yes | Admin/Team Lead |
| GET | `/:userId` | Get user details | Yes | Any |
| PATCH | `/:userId` | Update user | Yes | Any |
| DELETE | `/:userId` | Delete user | Yes | Admin |
| GET | `/:userId/sites` | Get user's sites | Yes | Any |
| POST | `/:userId/sites` | Assign site to user | Yes | Admin |

---

## 5. Database Models

### 5.1 User Model

**Collection:** `users`

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | User's full name (required, min 2 chars) |
| `email` | String | Lowercase unique email address |
| `password` | String | Hashed password (required) |
| `role` | String | admin, team_lead, or operator (ROLES constant) |
| `isEmailVerified` | Boolean | Email verification status |
| `isApproved` | Boolean | Account approval status |
| `profilePicture` | String | Multer-uploaded image path |
| `teamLeadLimit` | Number | Max team leads allowed (for Organizations) |
| `operatorLimit` | Number | Max operators allowed (for Organizations/Leads) |
| `organization` | ObjectId | Reference to parent organization |
| `teamLead` | ObjectId | Reference to assigned team lead |
| `mapOpeningLocation` | Object | Saved `lat`, `lng`, and `zoom` preferences |
| `dashboardTheme` | Object | Custom `primaryColor`, `backgroundColor`, `textColor` |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Update timestamp |

**Methods:**
- `comparePassword()` - Verify password with bcrypt

---

### 5.2 Site Model

**Collection:** `sites`

| Field | Type | Description |
|-------|------|-------------|
| `lat` | Number | Latitude coordinate (required) |
| `lon` | Number | Longitude coordinate (required) |
| `name` | String | Site name (required) |
| `display_name` | String | Display name (required) |
| `imei` | Array[Number] | Device identifiers (unique) |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Update timestamp |

---

### 5.3 Sensor Model

**Collection:** `sensors`

| Field | Type | Description |
|-------|------|-------------|
| `vibrationSensor` | Object | Vibration sensor data |
| `windSensor` | Object | Wind sensor data |
| `coordinates` | Array[2] | [longitude, latitude] |
| `imei` | Array[Number] | Device identifiers |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Update timestamp |

**Vibration Sensor Structure:**
- Speed (x, y, z axis)
- Displacement (x, y, z axis)
- Frequency (x, y, z axis)
- Angle (x, y, z axis)

**Wind Sensor Structure:**
- Speed
- Direction
- Humidity
- Temperature

---

### 5.4 Limits Model

**Collection:** `limits`

| Field | Type | Description |
|-------|------|-------------|
| `coordinates` | Array | Site coordinates (unique) |
| `imei` | Array | Device identifiers (unique) |
| `vibration` | Object | Vibration thresholds |
| `wind` | Object | Wind thresholds |

**Threshold Structure:**
```javascript
{
  green: { min: Number, max: Number },
  yellow: { min: Number, max: Number },
  red: { min: Number, max: Number }
}
```

---

### 5.5 Archives Model

**Collection:** `archives`

| Field | Type | Description |
|-------|------|-------------|
| `coordinates` | Array | Site coordinates |
| `siteName` | String | Site name |
| `[parameter]Status` | Object | Status for each parameter |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Update timestamp |

**Status Object:**
```javascript
{
  status: "normal" | "warning" | "alert",
  message: String,
  date: String,
  time: String
}
```

---

### 5.6 Blacklisted Token Model

**Collection:** `blacklistedtokens`

| Field | Type | Description |
|-------|------|-------------|
| `token` | String | Invalidated JWT token |
| `expiresAt` | Date | Token expiration date |
| `userId` | ObjectId | Associated user |

### 5.7 Pending User Model
Used for the account approval workflow. Includes `approvalToken`, `expiresAt` (24h auto-expiry), and `createdBy` references to track who initiated the account request.

---

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

```
1. User Registration (POST /signup)
   ↓
2. Email Verification Sent
   ↓
3. User Clicks Verification Link (GET /verify-email/:token)
   ↓
4. User Login (POST /signin)
   ↓
5. JWT Token Generated & Stored in Cookie
   ↓
6. Protected Routes Verify Token
   ↓
7. User Logout (POST /signout) - Token Blacklisted
```

### 6.2 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all resources |
| **Team Lead** | Manage users assigned to them |
| **Operator** | Read/update own profile only |

### 6.3 Password Requirements

- 8-18 characters length
- Minimum 2 letters
- Minimum 2 numbers
- Minimum 2 special characters
- Valid special characters only

### 6.4 Cookie Configuration

| Setting | Value |
|---------|-------|
| HTTP-Only | true (prevents JavaScript access) |
| Secure | true in Production (HTTPS only) |
| SameSite | Lax (CSRF protection) |
| Short Expiry | 5 minutes (300,000ms) |
| Long Expiry | 7 days (604,800,000ms) |
---

## 7. Configuration Files

### 7.1 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URI` | MongoDB connection string | mongodb://localhost:27017/smarttower |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development/production |
| `JWT_SECRET_KEY` | JWT signing key | your-secret-key |
| `JWT_EXPIRY` | Token expiration | 1h |
| `COOKIE_NAME` | Cookie name | token |
| `COOKIE_HTTP_ONLY` | HTTP-only flag | true |
| `COOKIE_SAME_SITE` | SameSite attribute | Lax |
| `COOKIE_EXPIRY` | Cookie expiration (ms) | 3600000 |
| `USER_EMAIL` | Email sender address | noreply@example.com |
| `USER_PASSWORD` | Email service password | *** |
| `EMAIL_HOST` | SMTP host | smtp.hostinger.com |
| `EMAIL_SERVICE` | Email service | hostinger |
| `EMAIL_PORT` | SMTP port | 587 |
| `REDIS_HOST` | Redis server host | localhost |
| `REDIS_PORT` | Redis server port | 6379 |
| `OPENROUTER_API_KEY` | LLM API key | *** |

---

## 8. Middleware

### 8.1 Global Middleware

| Middleware | Purpose |
|------------|---------|
| Morgan | HTTP request logging |
| CORS | Cross-Origin Resource Sharing |
| Cookie Parser | Parse cookies from requests |
| JSON Parser | Parse JSON request bodies |
| Static Files | Serve uploaded files |
| Swagger UI | API documentation at `/api-docs` |
| Error Handler | Global error handling |
| 404 Handler | Not found responses |

### 8.2 Authentication Middleware

**Functions:**
- `verifyAuthToken` - Validates JWT and attaches user to request
- `verifyAuthRole(...roles)` - Enforces role-based access

### 8.3 File Upload Middleware

**Configuration:**
- Storage: Disk storage in `public/uploads/`
- Allowed types: JPEG, JPG, PNG
- Max size: 5MB
- Field name: "profilePicture"

---

## 9. Scheduler / Cron Jobs

**Location:** `src/schedular/`

**Purpose:** Automated sensor data collection and processing

**Features:**
- Cron-based scheduling (configurable)
- Batch processing of multiple sites
- Graceful shutdown handling
- Task overlap prevention
- Execution time logging

**Key Files:**
| File | Purpose |
|------|---------|
| `index.js` | Scheduler initialization |
| `sensor-constants.js` | CRON_SCHEDULE definition |
| `site-processor.js` | Batch processing logic |
| `sensor-data-generator.js` | Data generation |
| `sensor-config.js` | Sensor configurations |
| `api-client.js` | HTTP client for sensors |
| `sites.js` | Coordinate list |

---

## 10. API Response Format

### 10.1 Success Response

```json
{
  "success": true,
  "status": 200,
  "data": { ... },
  "message": "Operation successful"
}
```

### 10.2 Error Response

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

---

## 11. Security Features

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with 10 salt rounds |
| JWT Authentication | HS256 algorithm with configurable expiry |
| Token Blacklisting | Invalidated tokens stored in database |
| Role-Based Access | CASL ability rules |
| CORS | Configured for all origins with credentials |
| Cookie Security | HTTP-Only, SameSite, Secure flags |
| File Upload Security | Type validation, size limits |
| Input Validation | Joi schema validation |

---

## 12. WebSocket (Real-time Communication)

**Configuration:** `src/config/websocket.config.js`

**Features:**
- Socket.io server integration
- CORS enabled for WebSocket
- Connection/disconnection event handling
- Real-time sensor data updates

---

## 13. AI Integration

**Configuration:** `src/config/ai.config.js`

**Provider:** OpenRouter API
**Model:** meta-llama/llama-3.3-70b-instruct:free

**AI Features:**
- `promptAI()` - Single prompt requests
- `chatWithAI()` - Conversation-based requests
- Retry mechanism with exponential backoff (max 3 retries)

---

## 14. Dependencies

### 14.1 Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 4.21.2 | Web framework |
| mongoose | 9.0.0 | MongoDB ODM |
| socket.io | 4.8.1 | WebSocket |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcryptjs | - | Password hashing |
| @casl/ability | 6.7.3 | Authorization |
| joi | 17.13.3 | Validation |
| nodemailer | 6.10.0 | Email service |
| multer | 1.4.5-lts.1 | File upload |
| node-cron | 3.0.3 | Task scheduling |
| redis | 4.7.0 | Caching |
| axios | 1.7.9 | HTTP client |
| winston | 3.17.0 | Logging |
| cors | - | CORS middleware |
| cookie-parser | - | Cookie parsing |
| morgan | - | HTTP logging |
| swagger-jsdoc | - | API docs generation |
| swagger-ui-express | - | Swagger UI |
| dotenv | - | Environment variables |
| date-fns | - | Date utilities |
| date-fns-tz | - | Timezone support |

### 14.2 Development Dependencies

| Package | Purpose |
|---------|---------|
| nodemon | Auto-restart on changes |
| prettier | Code formatting |
| eslint | Code linting |

---

## 15. Running the Application

### 15.1 Development Mode

```bash
npm run dev
```

### 15.2 Production Mode

```bash
npm start
```

### 15.3 API Documentation

Access Swagger UI at: `http://localhost:5000/api-docs`

---

## 16. Project Summary

ClassicTowerLab Backend is a high-performance IoT monitoring ecosystem designed for:

1. **Advanced Data Retrieval** - Intelligent date-range normalization with UTC fallback logic.
2. **Multi-user Support** - Role-based access for Admin, Team Lead, and Operator users
3. **Hierarchical Management** - Organization-level user limits and multi-stage account approval.
4. **Customized UX** - Persisted theme preferences and map coordinates for every user.
5. **Automated Collection** - Cron-based scheduling for processing site data.
6. **Enterprise Security** - OTP verification, token blacklisting, and secure cookie handling.
7. **AI Integration** - LLM capabilities for advanced analysis
8. **Secure Authentication** - JWT-based auth with email verification

---

*Document Updated: April 2026*
*ClassicTowerLab Backend v1.0.0*
