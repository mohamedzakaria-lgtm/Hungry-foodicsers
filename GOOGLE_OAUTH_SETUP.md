# Google OAuth Setup Guide

This guide will help you set up Google OAuth login for your app. Employees can sign in with their Google accounts, and their profile information (name, email, picture) will be automatically retrieved.

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one:
   - Click "Select a project" → "New Project"
   - Name it: `Hungry Foodicsers` (or any name)
   - Click "Create"

### 1.2 Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and click **"Enable"**

**Note:** Actually, you don't need Google+ API anymore. Google OAuth 2.0 works with just the OAuth consent screen.

### 1.3 Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name:** `Hungry Foodicsers`
   - **User support email:** Your email
   - **Developer contact information:** Your email
4. Click **"Save and Continue"**
5. **Scopes:** Click "Add or Remove Scopes"
   - Add: `email`, `profile`, `openid`
   - Click "Update" → "Save and Continue"
6. **Test users:** (Optional for now)
   - Add test users if your app is in testing mode
   - Click "Save and Continue"
7. **Summary:** Review and click "Back to Dashboard"

### 1.4 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name:** `Hungry Foodicsers Web Client`
   - **Authorized JavaScript origins:**
     - For local development: `http://localhost:3000`
     - For production: `https://your-deployed-url.com` (e.g., `https://hungry-foodicsers--mohamedzakari21.replit.app`)
   - **Authorized redirect URIs:**
     - For local: `http://localhost:3000/api/auth/google/callback`
     - For production: `https://your-deployed-url.com/api/auth/google/callback`
5. Click **"Create"**
6. **Copy your credentials:**
   - **Client ID:** (starts with something like `123456789-abc...`)
   - **Client Secret:** (starts with `GOCSPX-...`)
   - **Save these!** You'll need them for environment variables

---

## Step 2: Update Environment Variables

### 2.1 Local Development (.env file)

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:3000

# Session Secret (for OAuth sessions)
SESSION_SECRET=your-session-secret-here
```

### 2.2 Production (Replit/Deployment Platform)

Add these environment variables in your deployment platform:

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=https://your-deployed-url.com/api/auth/google/callback
FRONTEND_URL=https://your-mobile-app-url.com (or your frontend URL)
SESSION_SECRET=your-session-secret-here
```

**Important:** 
- Replace `your-deployed-url.com` with your actual deployment URL
- Use the same Client ID and Secret for both local and production (or create separate ones)

---

## Step 3: Install Dependencies

```bash
npm install
```

This will install:
- `passport`
- `passport-google-oauth20`
- `express-session`

---

## Step 4: Test Google OAuth

### 4.1 Start Your Server

```bash
npm run dev
```

### 4.2 Test the OAuth Flow

1. **Initiate Google Login:**
   ```
   GET http://localhost:3000/api/auth/google
   ```
   This will redirect to Google's login page.

2. **After Google Login:**
   - Google will redirect to: `/api/auth/google/callback`
   - For new users: Redirects to frontend to select office
   - For existing users: Returns JWT token

### 4.3 For React Native App

In your React Native app, you can:

**Option A: Use WebView**
- Open Google OAuth in a WebView
- Handle the callback URL

**Option B: Use React Native Google Sign-In**
- Use `@react-native-google-signin/google-signin` package
- Get the ID token from Google
- Send it to your backend for verification

**Option C: Use Deep Linking**
- Open browser for Google login
- Handle callback via deep link
- Extract token from URL

---

## Step 5: API Endpoints

### Initiate Google Login
```
GET /api/auth/google
```
Redirects to Google OAuth page.

### Google OAuth Callback
```
GET /api/auth/google/callback
```
Handled automatically by Passport. Redirects to frontend.

### Complete Registration (for new users)
```
POST /api/auth/google/complete
Body: {
  "googleId": "123456789",
  "email": "user@example.com",
  "name": "John Doe",
  "office": "office-id",
  "profilePicture": "https://..."
}
```

---

## Step 6: User Model Updates

The User model now includes:
- `googleId`: Google user ID
- `profilePicture`: User's Google profile picture URL
- `password`: Optional (only required for email/password login)

---

## Step 7: Frontend Integration

### For Web Frontend:

```javascript
// Redirect to Google OAuth
window.location.href = 'https://your-api.com/api/auth/google';

// Handle callback
// After Google redirects, you'll get a token in the URL or need to complete registration
```

### For React Native:

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// Sign in
const { idToken } = await GoogleSignin.signIn();

// Send to backend
const response = await fetch('https://your-api.com/api/auth/google/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});
```

---

## Troubleshooting

### Issue: "redirect_uri_mismatch"

**Solution:**
- Check that the redirect URI in Google Console matches exactly
- Include the full URL: `https://your-domain.com/api/auth/google/callback`
- No trailing slashes

### Issue: "invalid_client"

**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure they're set in environment variables

### Issue: OAuth works but user not created

**Solution:**
- Check MongoDB connection
- Verify office ID is valid when completing registration
- Check server logs for errors

### Issue: "Access blocked: This app's request is invalid"

**Solution:**
- Your app might be in testing mode
- Add test users in OAuth consent screen
- Or publish your app (for production)

---

## Security Notes

1. **Never commit** `GOOGLE_CLIENT_SECRET` to Git
2. **Use environment variables** for all secrets
3. **Restrict OAuth consent screen** to your organization's email domain (optional)
4. **Use HTTPS** in production
5. **Validate tokens** on the backend

---

## Next Steps

1. ✅ Google OAuth credentials created
2. ✅ Environment variables set
3. ✅ Dependencies installed
4. ✅ Test OAuth flow
5. ✅ Integrate with React Native app

---

## Quick Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Secret copied
- [ ] Environment variables set (local and production)
- [ ] Redirect URIs configured correctly
- [ ] Dependencies installed
- [ ] OAuth flow tested
- [ ] Frontend integration complete

---

## Need Help?

- Google OAuth Docs: [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
- Passport Google Strategy: [https://github.com/jaredhanson/passport-google-oauth2](https://github.com/jaredhanson/passport-google-oauth20)
