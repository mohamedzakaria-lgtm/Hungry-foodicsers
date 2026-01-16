# 🚀 Quick Deployment Guide

Choose your platform and follow the steps!

## 🎯 Recommended: Railway (Easiest)

**Time:** 15-20 minutes  
**Cost:** $5/month (free trial available)

👉 **See detailed guide:** [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)

### Quick Steps:
1. Push code to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Deploy from GitHub
4. Add environment variables
5. Get your API URL!

---

## 🆓 Alternative: Render (Free Tier)

**Time:** 15-20 minutes  
**Cost:** Free (with limitations)

👉 **See detailed guide:** [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)

### Quick Steps:
1. Push code to GitHub
2. Sign up at [render.com](https://render.com)
3. Create Web Service
4. Add environment variables
5. Deploy!

**Note:** Free tier spins down after inactivity (first request takes ~30s)

---

## 📋 Before You Deploy - Checklist

- [ ] Code is on GitHub
- [ ] MongoDB Atlas connection string ready
- [ ] Firebase service account file ready
- [ ] JWT_SECRET ready (long random string)

---

## 🔐 Prepare Firebase for Deployment

Run this command to get your Firebase credentials encoded:

```bash
npm run prepare-firebase
```

This will give you:
- Base64 encoded string (for environment variable)
- Or JSON string format

Copy the output and use it as `FIREBASE_SERVICE_ACCOUNT` environment variable.

---

## 🌐 Environment Variables Needed

Add these to your deployment platform:

```
PORT=3000
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT=<from-prepare-firebase-command>
```

---

## ✅ After Deployment

1. Get your API URL (e.g., `https://your-app.railway.app`)
2. Test health endpoint: `curl https://your-app.railway.app/health`
3. Update MongoDB Atlas to allow connections from anywhere (0.0.0.0/0)
4. Update your React Native app to use the new URL!

---

## 🆘 Need Help?

- Railway: [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) - Detailed step-by-step
- Render: [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) - Detailed step-by-step
- General: [DEPLOYMENT.md](./DEPLOYMENT.md) - Platform comparison

---

## 🎉 Ready to Deploy?

1. **Choose a platform** (Railway recommended)
2. **Follow the detailed guide** for that platform
3. **Get your API URL**
4. **Update your mobile app!**

Good luck! 🚀
