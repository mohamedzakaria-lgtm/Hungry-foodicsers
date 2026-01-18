# Replit Environment Variables Setup

This guide shows you exactly what environment variables you need for Replit deployment.

---

## 🔐 Environment Variables for Replit

In Replit, you don't use a `.env` file. Instead, you use **"Secrets"** (lock icon in the sidebar).

---

## 📋 Complete Environment Variables List

### **1. Server Configuration**

```
PORT=3000
NODE_ENV=production
```

**Note:** Replit may set PORT automatically, but you can override it.

---

### **2. MongoDB Configuration**

```
MONGODB_URI=mongodb+srv://mohamedzakaria_db_user:6bHg7pHXmFofmcIt@cluster0.zgjwfal.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority
```

**Your MongoDB Atlas connection string.**

---

### **3. JWT Configuration**

```
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random-at-least-32-characters
JWT_EXPIRES_IN=7d
```

**Important:** 
- Make `JWT_SECRET` long and random (at least 32 characters)
- Don't use the example value - generate your own!

---

### **4. Firebase Configuration**

You have two options:

#### **Option A: Base64 Encoded (Recommended)**

```
FIREBASE_SERVICE_ACCOUNT=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6Imh1bmdyeS1mb29kaWNzZXJzIiw...
```

**Get this by running:**
```bash
npm run prepare-firebase
```
Then copy the base64 string it outputs.

#### **Option B: JSON String**

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"hungry-foodicsers",...}
```

Paste the entire JSON content from `firebase-service-account.json`.

---

### **5. Google OAuth (If Using Google Login)**

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_CALLBACK_URL=https://hungry-foodicsers--mohamedzakari21.replit.app/api/auth/google/callback
```

**Get these from Google Cloud Console.**

---

### **6. Session Secret (For OAuth)**

```
SESSION_SECRET=your-random-session-secret-key-at-least-32-characters
```

**Can be the same as JWT_SECRET or different.**

---

### **7. Frontend URL (For OAuth Redirects)**

```
FRONTEND_URL=https://your-mobile-app-url.com
```

**Or your React Native app deep link URL.**

---

## 🎯 Quick Setup in Replit

### **Step 1: Open Secrets**

1. In Replit, look for the **lock icon (🔒)** in the left sidebar
2. Click it to open "Secrets" (environment variables)

### **Step 2: Add Each Variable**

Click **"+ New secret"** and add each variable:

**Variable Name:** `MONGODB_URI`  
**Value:** `mongodb+srv://mohamedzakaria_db_user:6bHg7pHXmFofmcIt@cluster0.zgjwfal.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority`

Repeat for each variable below.

---

## 📝 Complete Replit Secrets List

Copy and paste these one by one into Replit Secrets:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://mohamedzakaria_db_user:6bHg7pHXmFofmcIt@cluster0.zgjwfal.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-long-and-random-123456789
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT=<paste-base64-or-json-from-prepare-firebase>
SESSION_SECRET=your-random-session-secret-key-123456789
FRONTEND_URL=https://your-mobile-app-url.com
```

**Optional (if using Google OAuth):**
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://hungry-foodicsers--mohamedzakari21.replit.app/api/auth/google/callback
```

---

## 🔧 How to Get Firebase Service Account

### **Method 1: Using the Helper Script**

1. In your local project, run:
   ```bash
   npm run prepare-firebase
   ```

2. Copy the base64 string it outputs

3. In Replit Secrets, add:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** `<paste the base64 string>`

### **Method 2: Manual Encoding**

1. Open `firebase-service-account.json` locally
2. Copy the entire JSON content
3. Go to [base64encode.org](https://www.base64encode.org/)
4. Paste and encode
5. Copy the encoded string
6. Add to Replit Secrets

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Long random string (32+ characters)
- [ ] `JWT_EXPIRES_IN` - `7d` (or your preference)
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Base64 encoded or JSON string
- [ ] `SESSION_SECRET` - Random string (can be same as JWT_SECRET)
- [ ] `NODE_ENV` - `production`
- [ ] `PORT` - `3000` (or let Replit set it)
- [ ] `FRONTEND_URL` - Your mobile app URL (optional)
- [ ] `GOOGLE_CLIENT_ID` - If using Google OAuth (optional)
- [ ] `GOOGLE_CLIENT_SECRET` - If using Google OAuth (optional)
- [ ] `GOOGLE_CALLBACK_URL` - Your Replit URL + `/api/auth/google/callback` (optional)

---

## 🚀 After Setting Secrets

1. **Restart your Repl** (click Stop, then Run)
2. **Check logs** - You should see:
   ```
   ✅ Connected to MongoDB
   ✅ Firebase Admin SDK initialized
   🚀 Server running on port 3000
   ```

3. **Test your API:**
   ```bash
   curl https://hungry-foodicsers--mohamedzakari21.replit.app/health
   ```

---

## 🔍 Troubleshooting

### **Issue: "MongoDB connection error"**

**Check:**
- `MONGODB_URI` is correct
- MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Password doesn't have special characters that need encoding

### **Issue: "Firebase not initialized"**

**Check:**
- `FIREBASE_SERVICE_ACCOUNT` is set correctly
- If using base64, it's the full encoded string
- If using JSON, it's valid JSON

### **Issue: "JWT secret not set"**

**Check:**
- `JWT_SECRET` is set
- It's at least 32 characters long

### **Issue: "Port already in use"**

**Solution:**
- Replit may set PORT automatically
- Check Replit's environment or remove PORT from secrets

---

## 📱 Your Replit URL

Your API will be available at:
```
https://hungry-foodicsers--mohamedzakari21.replit.app
```

Use this URL in your React Native app!

---

## 💡 Pro Tips

1. **Never commit secrets** - Replit Secrets are secure
2. **Use different JWT_SECRET** for production (not the example)
3. **Test locally first** - Make sure everything works before deploying
4. **Check logs** - Replit shows console output in the logs panel

---

## 🎯 Quick Reference

| Variable | Required | Example |
|----------|----------|---------|
| `MONGODB_URI` | ✅ Yes | `mongodb+srv://...` |
| `JWT_SECRET` | ✅ Yes | `long-random-string-32-chars` |
| `JWT_EXPIRES_IN` | ✅ Yes | `7d` |
| `FIREBASE_SERVICE_ACCOUNT` | ⚠️ Optional | Base64 or JSON |
| `SESSION_SECRET` | ⚠️ Optional | Random string |
| `NODE_ENV` | ✅ Yes | `production` |
| `PORT` | ⚠️ Optional | `3000` |
| `FRONTEND_URL` | ⚠️ Optional | Your app URL |
| `GOOGLE_CLIENT_ID` | ⚠️ Optional | If using OAuth |
| `GOOGLE_CLIENT_SECRET` | ⚠️ Optional | If using OAuth |
| `GOOGLE_CALLBACK_URL` | ⚠️ Optional | Replit URL + callback |

---

## ✅ Summary

1. **Open Replit Secrets** (lock icon)
2. **Add each variable** from the list above
3. **Get Firebase credentials** using `npm run prepare-firebase`
4. **Restart your Repl**
5. **Test your API**

**You're all set!** 🎉
