# Deploy to Render - Step by Step Guide

Render offers a free tier perfect for getting started!

## Prerequisites

1. GitHub account
2. Render account (free)
3. Your MongoDB Atlas connection string
4. Your Firebase service account JSON

---

## Step 1: Push Code to GitHub

Same as Railway guide - make sure your code is on GitHub.

---

## Step 2: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub

---

## Step 3: Create New Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository
4. Select `hungry-foodicsers-backend`

---

## Step 4: Configure Service

Fill in the form:

- **Name:** `hungry-foodicsers-api` (or any name)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** Free (or paid for better performance)

---

## Step 5: Add Environment Variables

Scroll down to **"Environment Variables"** and add:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT=<base64-encoded-json-or-json-string>
```

For Firebase, encode your JSON file to base64 or paste the JSON directly.

---

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait 2-5 minutes for deployment

---

## Step 7: Get Your URL

Once deployed, Render gives you a URL like:
```
https://hungry-foodicsers-api.onrender.com
```

---

## Free Tier Limitations

- ✅ Free SSL
- ✅ Automatic deployments
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds

**For production, consider paid plan ($7/month) for always-on service.**

---

## Testing

Same as Railway - test your endpoints with the new URL!
