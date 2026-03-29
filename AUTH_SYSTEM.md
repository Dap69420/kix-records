# KIX RECORDS - Authorization System Implementation

## Overview
A complete user authentication system has been added to the KIX RECORDS platform, allowing users to create accounts and login before submitting demos. The system uses:
- **PostgreSQL** (Neon database) for user storage
- **JWT** (JSON Web Tokens) for session management
- **bcryptjs** for secure password hashing
- **Express.js** middleware for route protection

## What's Been Implemented

### 1. Database Schema
**Users Table** (`users`)
- `id` - Primary key (auto-increment)
- `email` - Unique email address (login identifier)
- `password_hash` - Securely hashed password (bcrypt)
- `legal_name` - Optional artist/legal name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

Automatically created on server startup if it doesn't exist.

### 2. Backend - Express Server (`server.js`)

#### Authentication Endpoints
- **POST `/api/register`** - Create new user account
  ```
  Request body: { email, password, confirmPassword, legalName? }
  Response: { ok: true, token, user }
  ```

- **POST `/api/login`** - Authenticate user
  ```
  Request body: { email, password }
  Response: { ok: true, token, user }
  ```

#### Auth Middleware
- `authenticateToken` middleware verifies JWT tokens from `Authorization: Bearer <token>` header
- Automatically applied to `/api/submit` and `/submit` endpoints
- Returns 401 error if no token provided
- Returns 403 error if token is invalid/expired

#### Protected Routes
- **POST `/api/submit`** - Demo submission (now requires authentication)
  - Token is extracted from header and passed to the submit function
  - User's email from token can be used as fallback

### 3. Frontend - Auth System

#### Auth Modal (`submit-demo.html`)
- Two-tab interface: "Sign In" and "Create Account"
- Clean, glassmorphic design matching site aesthetic
- Shows automatically if user is not logged in

#### Auth Manager (`public/auth.js`)
JavaScript class handling all auth operations:
- `register(email, password, confirmPassword, legalName)` - Create account
- `login(email, password)` - Sign in
- `logout()` - Clear stored credentials
- `isLoggedIn()` - Check authentication status
- `getAuthHeader()` - Get Bearer token for API requests

#### Form Integration
Demo submission form now:
1. Shows auth modal if user isn't logged in
2. Prevents form access without login
3. Includes auth token in submission request headers
4. Pre-fills user's email from account (optional override in form)

### 4. Session Management
- Tokens stored in browser's `localStorage`:
  - `authToken` - JWT token (7-day expiration)
  - `authUser` - User object (JSON stringified)
- Persists across page refreshes
- Logout clears both values

## Configuration Files

### `.env` File
```env
DATABASE_URL=postgresql://neondb_owner:npg_sL9qZnQHNiv3@ep-hidden-base-am44gqcz-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DISCORD_WEBHOOK_URL=<your-webhook-url>
SAMBANOVA_API_KEY=<your-api-key>
PORT=3000
```

⚠️ **IMPORTANT:** Change `JWT_SECRET` to a secure random string in production!

### `package.json` Dependencies
```json
{
  "bcryptjs": "^2.4.3",
  "pg": "^8.11.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "node-fetch": "^3.3.2"
}
```

## API Files for Vercel Deployment

Both `/api/register.js` and `/api/login.js` include database initialization and are fully functional serverless functions, making the system compatible with Vercel's serverless environment.

## User Flow

1. **New User:**
   - Visits `/submit-demo.html`
   - Auth modal appears automatically
   - Clicks "Create Account"
   - Fills in email, legal name (optional), password
   - Account created, token received, modal closes
   - Demo form now accessible

2. **Existing User:**
   - Visits `/submit-demo.html`
   - Auth modal appears
   - Enters email and password
   - Successfully logged in
   - Demo form now accessible

3. **Demo Submission:**
   - Fills out 5-step form with demo details
   - Clicks "Submit"
   - Token automatically included in request
   - Discord notification sent with user's email

## Security Considerations

✅ **Implemented:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens expire after 7 days
- Authentication middleware validates all submissions
- Passwords compared securely (no plaintext storage)
- SSL connection to database (sslmode=require)

⚠️ **To-Do for Production:**
- Use environment variable for JWT_SECRET (secure, random value)
- Enable HTTPS on production server
- Add rate limiting to auth endpoints
- Add email verification for new accounts
- Add password reset functionality
- Consider adding CORS configuration if API is called from different origin

## Testing

Server starts successfully:
```
$ npm start
Server running on http://localhost:3000
✓ Database initialized successfully
```

Test endpoints:
```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","confirmPassword":"password123","legalName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Submit Demo (with token)
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"legalName":"Artist","releaseTitle":"Track","email":"artist@example.com","artists":[],"links":"https://...","bio":""}'
```

## Next Steps

1. ✅ Database initialized
2. ✅ Auth endpoints working
3. ✅ Frontend auth modal ready
4. Next: Test registration/login in browser
5. Next: Test demo submission with authentication
6. Next: Deploy to production with secure JWT_SECRET

