# Google OAuth Implementation Summary

✅ **Google OAuth login has been successfully added to your backend!**

---

## What's New

### 1. **User Model Updates**
- ✅ Added `googleId` field (for Google user ID)
- ✅ Added `profilePicture` field (for Google profile picture URL)
- ✅ Made `password` optional (only required for email/password login)

### 2. **New Dependencies**
- ✅ `passport` - Authentication middleware
- ✅ `passport-google-oauth20` - Google OAuth strategy
- ✅ `express-session` - Session management for OAuth

### 3. **New API Endpoints**

#### Initiate Google Login
```
GET /api/auth/google
```
Redirects user to Google OAuth page.

#### Google OAuth Callback
```
GET /api/auth/google/callback
```
Handles Google's redirect after authentication.

#### Complete Registration (for new users)
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

### 4. **Updated Responses**
All user responses now include:
- `profilePicture` - User's Google profile picture URL

---

## Next Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Google OAuth Credentials

Follow the detailed guide: **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

Quick steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Get Client ID and Client Secret
4. Add to environment variables

### Step 3: Update Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your-session-secret
```

For production (Replit):
- Add the same variables in Replit's Secrets
- Update `GOOGLE_CALLBACK_URL` to your Replit URL
- Update `FRONTEND_URL` to your mobile app URL

### Step 4: Test

1. Start server: `npm run dev`
2. Visit: `http://localhost:3000/api/auth/google`
3. You'll be redirected to Google login
4. After login, you'll be redirected back

---

## How It Works

### For Existing Users (with Google account linked):
1. User clicks "Sign in with Google"
2. Redirected to Google
3. User authorizes
4. Google redirects back with user info
5. Backend finds user by `googleId` or `email`
6. Returns JWT token
7. User is logged in ✅

### For New Users:
1. User clicks "Sign in with Google"
2. Redirected to Google
3. User authorizes
4. Google redirects back with user info
5. Backend detects new user
6. Redirects to frontend to select office
7. Frontend sends office selection to `/api/auth/google/complete`
8. User is created and logged in ✅

---

## React Native Integration

### Option 1: WebView Approach
```javascript
// Open Google OAuth in WebView
const oauthUrl = 'https://your-api.com/api/auth/google';
// Handle callback URL in WebView
```

### Option 2: React Native Google Sign-In
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// Sign in
const { idToken, user } = await GoogleSignin.signIn();

// Send to backend
const response = await fetch('https://your-api.com/api/auth/google/verify', {
  method: 'POST',
  body: JSON.stringify({ idToken }),
});
```

**Note:** You may need to add a `/api/auth/google/verify` endpoint that accepts ID tokens directly if using React Native Google Sign-In.

---

## Benefits

✅ **Easier for employees** - No need to remember passwords  
✅ **Automatic profile info** - Name, email, picture from Google  
✅ **Secure** - Google handles authentication  
✅ **Works with company Google accounts** - Perfect for Foodics staff  
✅ **Backward compatible** - Email/password login still works  

---

## Files Modified

- ✅ `package.json` - Added dependencies
- ✅ `models/User.js` - Added Google fields
- ✅ `routes/auth.js` - Added Google OAuth routes
- ✅ `server.js` - Added Passport middleware
- ✅ `config/passport.js` - New file (Google OAuth strategy)

---

## Testing Checklist

- [ ] Dependencies installed
- [ ] Google OAuth credentials created
- [ ] Environment variables set
- [ ] Server starts without errors
- [ ] `/api/auth/google` redirects to Google
- [ ] Google login works
- [ ] Callback creates/finds user
- [ ] JWT token returned
- [ ] User profile includes picture
- [ ] React Native integration works

---

## Need Help?

See **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** for detailed setup instructions.

---

## Quick Start

1. **Install:** `npm install`
2. **Set up Google OAuth:** Follow `GOOGLE_OAUTH_SETUP.md`
3. **Add env variables:** See above
4. **Test:** Visit `/api/auth/google`
5. **Integrate:** Add to React Native app

**You're all set!** 🎉
