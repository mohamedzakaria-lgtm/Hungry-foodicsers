# Google OAuth for Mobile Apps (React Native)

## ❌ Why Your cURL Command Doesn't Work

The endpoint `/api/auth/google` uses a **web-based redirect flow** that doesn't work with direct API calls:

1. It redirects to Google's login page
2. User logs in on Google
3. Google redirects back to your callback URL
4. This flow requires a browser, not a direct API call

**Your cURL:**
```bash
curl 'https://.../api/auth/google?email=...'
```
This will just redirect to Google, not return JSON.

---

## ✅ Solution: Use Mobile Endpoint

For **React Native mobile apps**, use the new endpoint:

### **POST /api/auth/google/mobile**

This endpoint accepts a **Google ID token** from your mobile app.

---

## 📱 How to Use in React Native

### Step 1: Install React Native Google Sign-In

```bash
npm install @react-native-google-signin/google-signin
# or
yarn add @react-native-google-signin/google-signin
```

### Step 2: Configure Google Sign-In

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure (use your Google Client ID)
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID', // From Google Cloud Console
  offlineAccess: true, // Optional
});
```

### Step 3: Sign In and Get ID Token

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

async function signInWithGoogle() {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices();
    
    // Sign in
    const userInfo = await GoogleSignin.signIn();
    
    // Get ID token
    const idToken = userInfo.data?.idToken;
    
    if (!idToken) {
      throw new Error('No ID token received');
    }
    
    // Send to your backend
    const response = await fetch('https://your-api.com/api/auth/google/mobile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: idToken,
        office: 'office-id', // Optional
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Save token
      const token = data.data.token;
      // Store token (AsyncStorage, SecureStore, etc.)
      await AsyncStorage.setItem('authToken', token);
      
      // Navigate to app
      navigation.navigate('Home');
    }
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
}
```

---

## 🔌 API Endpoint

### **POST /api/auth/google/mobile**

**Request:**
```json
{
  "idToken": "google-id-token-from-mobile-app",
  "office": "office-id"  // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@foodics.com",
      "office": {...},
      "role": "user",
      "profilePicture": "https://..."
    },
    "token": "jwt-token-here"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid Google ID token",
  "error": "..."
}
```

---

## 🔄 Complete Flow

### **For New Users:**

1. User opens app
2. User taps "Sign in with Google"
3. Google Sign-In opens
4. User authenticates
5. App gets ID token
6. App sends ID token to `/api/auth/google/mobile`
7. Backend creates user (office optional)
8. Backend returns JWT token
9. App saves token and navigates

### **For Existing Users:**

1. User taps "Sign in with Google"
2. Google Sign-In opens
3. User authenticates
4. App gets ID token
5. App sends ID token to `/api/auth/google/mobile`
6. Backend finds user by Google ID or email
7. Backend returns JWT token
8. App saves token and navigates

---

## 🆚 Web vs Mobile

### **Web Flow (Browser):**
```
GET /api/auth/google
→ Redirects to Google
→ User logs in
→ Google redirects to /api/auth/google/callback
→ Backend redirects to frontend with token
```

### **Mobile Flow (React Native):**
```
1. Use @react-native-google-signin/google-signin
2. Get ID token from Google
3. POST /api/auth/google/mobile with idToken
4. Backend verifies and returns JWT token
```

---

## ⚠️ Important Notes

### **1. Token Verification**

Currently, the endpoint decodes the JWT token. For **production**, you should:

- Verify the token with Google's tokeninfo endpoint
- Or use `google-auth-library` npm package
- Check token expiration
- Verify the token signature

**Example with google-auth-library:**
```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
```

### **2. Office Selection**

- Office is **optional** during authentication
- User can set office later using `PUT /api/auth/office`
- Or include office in the initial request

### **3. Error Handling**

Handle these cases:
- Invalid token
- Network errors
- User cancellation
- Token expiration

---

## 📝 Example cURL (for testing)

```bash
# This won't work - you need a real Google ID token from mobile app
curl -X POST 'https://your-api.com/api/auth/google/mobile' \
  -H 'Content-Type: application/json' \
  -d '{
    "idToken": "REAL_GOOGLE_ID_TOKEN_FROM_MOBILE_APP",
    "office": "office-id"
  }'
```

**Note:** You can't get a real ID token with cURL. You need to use the React Native Google Sign-In library.

---

## ✅ Summary

**For Mobile Apps:**
- ✅ Use `@react-native-google-signin/google-signin`
- ✅ Get ID token from Google
- ✅ POST to `/api/auth/google/mobile`
- ✅ Save JWT token from response

**For Web Apps:**
- ✅ Use `/api/auth/google` (redirect flow)
- ✅ Handle callback redirect
- ✅ Complete registration if needed

---

**The mobile endpoint is ready to use!** 🎉
