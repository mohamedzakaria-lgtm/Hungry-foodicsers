# Troubleshooting Railway Deployment

## Server Shows as "Offline"

If your Railway deployment shows as offline, check these common issues:

---

## 1. Check Railway Logs

**Most Important Step!**

1. Go to Railway dashboard
2. Click on your service
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Click **"View Logs"**

Look for errors like:
- ❌ MongoDB connection errors
- ❌ Missing environment variables
- ❌ Module not found errors
- ❌ Port binding errors

---

## 2. Common Issues & Fixes

### Issue: MongoDB Connection Error

**Error in logs:**
```
❌ MongoDB connection error: ...
```

**Fix:**
1. Check `MONGODB_URI` environment variable is set correctly
2. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
3. Check password doesn't have special characters that need URL encoding
4. Make sure connection string includes database name

**Correct format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

---

### Issue: Missing Environment Variables

**Error in logs:**
```
ReferenceError: process.env.MONGODB_URI is not defined
```

**Fix:**
1. Go to Railway → Your Service → **"Variables"** tab
2. Make sure all these are set:
   - `PORT` (Railway sets this automatically, but you can set it)
   - `NODE_ENV=production`
   - `MONGODB_URI=your-connection-string`
   - `JWT_SECRET=your-secret`
   - `JWT_EXPIRES_IN=7d`
   - `FIREBASE_SERVICE_ACCOUNT=your-base64-string`

---

### Issue: Port Binding Error

**Error in logs:**
```
Error: listen EADDRINUSE: address already in use
```

**Fix:**
- Railway automatically sets `PORT` environment variable
- Don't hardcode port in your code
- Use: `const PORT = process.env.PORT || 3000;`

---

### Issue: Build Failed

**Error in logs:**
```
npm ERR! ...
```

**Fix:**
1. Check `package.json` has all dependencies
2. Make sure `node_modules` is in `.gitignore` (it should be)
3. Railway will run `npm install` automatically
4. Check Node.js version compatibility

---

### Issue: Module Not Found

**Error in logs:**
```
Error: Cannot find module 'express'
```

**Fix:**
1. Make sure all dependencies are in `package.json`
2. Check `package-lock.json` is committed
3. Railway should install dependencies automatically

---

## 3. Verify Environment Variables

In Railway dashboard:

1. Go to your service
2. Click **"Variables"** tab
3. Verify these exist:

```
✅ PORT (Railway sets this automatically)
✅ NODE_ENV=production
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=...
✅ JWT_EXPIRES_IN=7d
✅ FIREBASE_SERVICE_ACCOUNT=...
```

---

## 4. Check MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. **Network Access** → Make sure `0.0.0.0/0` is whitelisted
3. **Database Access** → Verify user exists and password is correct

---

## 5. Test Locally First

Before deploying, test with production environment variables:

```bash
# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your-atlas-connection-string
export JWT_SECRET=your-secret
export PORT=3000

# Start server
npm start
```

If it works locally, it should work on Railway.

---

## 6. Railway-Specific Checks

### Check Service Status

1. Railway dashboard → Your service
2. Look at the status indicator:
   - 🟢 Green = Running
   - 🟡 Yellow = Building/Deploying
   - 🔴 Red = Failed/Offline

### Check Deployment Status

1. Click **"Deployments"** tab
2. Latest deployment should show:
   - ✅ "Active" status
   - Build completed successfully
   - No errors in logs

### Restart Service

If stuck, try:
1. Railway dashboard → Your service
2. Click **"Settings"**
3. Scroll down → **"Restart"** button
4. Or trigger a new deployment

---

## 7. Quick Diagnostic Checklist

- [ ] Check Railway logs for errors
- [ ] All environment variables are set
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] MongoDB connection string is correct
- [ ] Server code uses `process.env.PORT`
- [ ] No hardcoded ports
- [ ] Dependencies are in `package.json`
- [ ] Build completed successfully
- [ ] Service shows as "Active" in Railway

---

## 8. Get Help

If still stuck:

1. **Copy logs from Railway** (Deployments → View Logs)
2. **Check error messages** - they usually tell you what's wrong
3. **Verify environment variables** are set correctly
4. **Test MongoDB connection** from your local machine

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Application not found" | Service not deployed | Check deployment status |
| "MongoDB connection error" | Wrong connection string | Verify MONGODB_URI |
| "Cannot find module" | Missing dependency | Check package.json |
| "Port already in use" | Port conflict | Use process.env.PORT |
| "EADDRINUSE" | Port binding error | Railway handles this automatically |

---

## Still Not Working?

1. Share the error logs from Railway
2. Verify environment variables are set
3. Check MongoDB Atlas is accessible
4. Try redeploying from GitHub
