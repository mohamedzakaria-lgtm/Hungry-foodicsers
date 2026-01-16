# Firebase Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the Hungry Foodicsers app.

## What is Firebase?

Firebase is Google's platform for building mobile and web apps. We're using it specifically for **push notifications** - sending alerts to users' phones when orders are created, prices are updated, or orders are delivered.

---

## Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Hungry Foodicsers` (or any name you like)
4. Click **"Continue"**
5. **Disable Google Analytics** (optional, not needed for this project) or enable it if you want
6. Click **"Create project"**
7. Wait for project creation (takes ~30 seconds)
8. Click **"Continue"**

### Step 2: Enable Cloud Messaging

1. In your Firebase project dashboard, look for the left sidebar
2. Click on **"Build"** → **"Cloud Messaging"**
3. If you see "Get started" or "Enable", click it
4. You should now see the Cloud Messaging dashboard

**Note:** For server-side (backend) notifications, we need the **Service Account** key, not the web app configuration.

### Step 3: Get Service Account Key

This is the key file your backend needs to send notifications:

1. Click the **gear icon (⚙️)** next to "Project Overview" in the left sidebar
2. Click **"Project settings"**
3. Go to the **"Service accounts"** tab
4. You'll see "Firebase Admin SDK"
5. Click **"Generate new private key"**
6. A dialog will appear - click **"Generate key"**
7. A JSON file will download automatically (e.g., `hungry-foodicsers-firebase-adminsdk-xxxxx.json`)

**⚠️ IMPORTANT:** This file contains sensitive credentials. Never commit it to Git!

### Step 4: Save the Service Account File

1. Move the downloaded JSON file to your project root directory:
   ```
   /Users/mohamedemad/Projects/Hungry-foodicsers/firebase-service-account.json
   ```

2. Verify it's in the `.gitignore` file (it should already be there)

3. Update your `.env` file:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

### Step 5: Verify Setup

1. Start your server:
   ```bash
   npm run dev
   ```

2. You should see one of these messages:
   - ✅ `Firebase Admin SDK initialized` (if file is found)
   - ⚠️ `Firebase service account file not found` (if file is missing)

3. If you see the warning, check:
   - File exists in project root
   - File name matches `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env`
   - File has `.json` extension

---

## Understanding Firebase for React Native App

### What You Need for the Mobile App

When you build your React Native app, you'll need:

1. **Firebase Configuration** (different from service account):
   - Go to Project Settings → General
   - Scroll down to "Your apps"
   - Click the **Android** or **iOS** icon to add your app
   - Download `google-services.json` (Android) or `GoogleService-Info.plist` (iOS)

2. **FCM Token**:
   - Each device gets a unique FCM token
   - Your React Native app will get this token
   - Send this token to your backend via: `PUT /api/auth/firebase-token`

### How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  React      │         │   Backend    │         │   Firebase  │
│  Native App │────────▶│   (Node.js)  │────────▶│   FCM       │
│             │ Token   │              │         │   Service   │
└─────────────┘         └──────────────┘         └─────────────┘
     ▲                                              │
     │                                              │
     └──────────────────────────────────────────────┘
                    Push Notification
```

1. Mobile app gets FCM token from Firebase
2. App sends token to your backend API
3. Backend stores token with user account
4. When event happens (new order, price update, delivery), backend sends notification via Firebase
5. Firebase delivers notification to user's device

---

## Testing Notifications (Without Mobile App)

Since you don't have the mobile app yet, you can:

### Option 1: Test with a Test Token

1. Get a test FCM token (you'll need to build the React Native app first)
2. Update user's token:
   ```bash
   curl -X PUT http://localhost:3000/api/auth/firebase-token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"token": "TEST_FCM_TOKEN_HERE"}'
   ```

### Option 2: Skip Notifications for Now

The backend will work fine without Firebase! You'll just see warnings in the console, but all other features work:
- ✅ User registration/login
- ✅ Order creation
- ✅ Item management
- ✅ Price updates
- ✅ Status updates
- ⚠️ Notifications (will be skipped gracefully)

You can add Firebase later when you build the mobile app.

---

## Common Issues & Solutions

### Issue: "Firebase service account file not found"

**Solution:**
1. Check file exists: `ls firebase-service-account.json`
2. Check file path in `.env` matches actual location
3. Make sure file has `.json` extension
4. Try absolute path: `FIREBASE_SERVICE_ACCOUNT_PATH=/full/path/to/file.json`

### Issue: "Error: Failed to parse private key"

**Solution:**
- Make sure you downloaded the **Service Account** key, not the web app config
- File should start with: `{"type": "service_account", ...}`
- Re-download the key from Firebase Console

### Issue: "Permission denied" errors

**Solution:**
- Make sure the service account has proper permissions
- In Firebase Console → IAM & Admin, verify service account exists
- Re-generate the key if needed

### Issue: Notifications not working

**Possible causes:**
1. **Invalid FCM token**: Token might be expired or invalid
2. **Token not registered**: User hasn't updated their Firebase token
3. **Firebase not initialized**: Check server logs for initialization errors
4. **App not configured**: React Native app needs Firebase SDK setup

---

## Firebase Console Features

Once set up, you can:

1. **View notification history**: Cloud Messaging → Reports
2. **Send test notifications**: Cloud Messaging → Send test message
3. **View analytics**: See how many notifications were sent/delivered
4. **Manage tokens**: View registered device tokens

---

## Security Best Practices

1. ✅ **Never commit** `firebase-service-account.json` to Git
2. ✅ Keep it in `.gitignore` (already done)
3. ✅ Use environment variables for sensitive data
4. ✅ Rotate keys periodically
5. ✅ Restrict service account permissions if possible

---

## Next Steps

1. ✅ Firebase project created
2. ✅ Service account key downloaded and saved
3. ✅ `.env` file updated
4. ✅ Server starts without Firebase errors

**For React Native app (later):**
- Add Firebase SDK to React Native project
- Configure Android/iOS apps in Firebase Console
- Get FCM tokens from devices
- Send tokens to backend API

---

## Quick Checklist

- [ ] Firebase project created
- [ ] Cloud Messaging enabled
- [ ] Service account key downloaded
- [ ] Key file saved to project root as `firebase-service-account.json`
- [ ] `.env` file updated with correct path
- [ ] Server starts and shows "Firebase Admin SDK initialized"
- [ ] (Later) React Native app configured with Firebase
- [ ] (Later) FCM tokens being sent to backend

---

## Need Help?

- Firebase Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- Cloud Messaging Guide: [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)
- Firebase Support: [https://firebase.google.com/support](https://firebase.google.com/support)
