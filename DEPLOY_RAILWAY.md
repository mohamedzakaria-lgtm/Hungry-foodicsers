# Deploy to Railway - Step by Step Guide

Railway is the easiest platform to deploy your backend. Follow these steps:

## Prerequisites

1. GitHub account (free)
2. Railway account (free trial, then $5/month)
3. Your MongoDB Atlas connection string
4. Your Firebase service account JSON file

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Name it: `hungry-foodicsers-backend`
4. Make it **Private** (recommended)
5. Click **"Create repository"**

### 1.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/hungry-foodicsers-backend.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with GitHub (easiest)
4. Authorize Railway to access your GitHub

---

## Step 3: Deploy from GitHub

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select your `hungry-foodicsers-backend` repository
4. Railway will automatically detect it's a Node.js app and start building

---

## Step 4: Configure Environment Variables

Once deployment starts, you need to add environment variables:

1. Click on your project in Railway
2. Click on the service (your app)
3. Go to **"Variables"** tab
4. Add these variables:

### Required Variables:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
JWT_EXPIRES_IN=7d
```

### Firebase Variable (Important!)

You need to convert your Firebase JSON file to a base64 string:

**On Mac/Linux:**
```bash
base64 -i firebase-service-account.json | pbcopy
```

**Or manually:**
1. Open `firebase-service-account.json`
2. Copy the entire JSON content
3. Go to [base64encode.org](https://www.base64encode.org/)
4. Paste and encode
5. Copy the encoded string

Then add to Railway:
```
FIREBASE_SERVICE_ACCOUNT=<paste-the-base64-encoded-string-here>
```

**OR** you can paste the JSON directly (Railway will handle it):
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
```

---

## Step 5: Get Your API URL

1. In Railway, go to your service
2. Click **"Settings"**
3. Scroll to **"Domains"**
4. Railway automatically creates a domain like: `your-app-name.up.railway.app`
5. Copy this URL - this is your API base URL!

**Example:** `https://hungry-foodicsers-production.up.railway.app`

---

## Step 6: Test Your Deployed API

```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Login
curl -X POST https://your-app-name.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@foodics.com", "password": "password123"}'
```

---

## Step 7: Update MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add: `0.0.0.0/0` (allow from anywhere)
   - Or get Railway's IP from their docs

---

## Step 8: Seed Production Data (Optional)

You can run the seed script once on Railway:

1. In Railway, go to your service
2. Click **"Deployments"**
3. Click on the latest deployment
4. Open **"View Logs"**
5. Or use Railway's CLI to run commands

Or create a one-time script to seed data after first deployment.

---

## Troubleshooting

### Deployment Fails

- Check build logs in Railway
- Make sure all dependencies are in `package.json`
- Verify Node.js version (Railway auto-detects)

### MongoDB Connection Error

- Check `MONGODB_URI` is correct
- Verify IP is whitelisted in MongoDB Atlas
- Check connection string has correct password

### Firebase Not Working

- Verify `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Check logs for Firebase initialization errors
- Make sure JSON is properly formatted

### API Not Responding

- Check Railway logs
- Verify the service is running (not crashed)
- Check environment variables are set

---

## Custom Domain (Optional)

1. In Railway → Settings → Domains
2. Click **"Generate Domain"** or **"Custom Domain"**
3. Follow instructions to add your domain

---

## Cost

- **Free Trial:** $5 credit (lasts ~1 month)
- **After Trial:** $5/month (Hobby plan)
- **Includes:** 
  - 512MB RAM
  - 1GB storage
  - 100GB bandwidth
  - Perfect for your backend!

---

## Next Steps

1. ✅ Update your React Native app to use the new API URL
2. ✅ Test all endpoints
3. ✅ Monitor logs in Railway dashboard
4. ✅ Set up custom domain (optional)

---

## Your API URL

Once deployed, your API will be available at:
```
https://your-app-name.up.railway.app
```

Use this URL in your React Native app instead of `localhost:3000`!
