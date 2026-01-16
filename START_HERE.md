# 🎯 START HERE - Quick Setup Checklist

If you're new to backend development, follow this checklist in order:

## ✅ Step 1: Install Dependencies
```bash
npm install
```
**Time:** 1-2 minutes

---

## ✅ Step 2: Set Up MongoDB

**Choose ONE option:**

### Option A: MongoDB Atlas (Cloud - Easiest) ⭐
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create free cluster
3. Create database user
4. Whitelist IP address
5. Copy connection string

**📖 Detailed guide:** See `MONGODB_SETUP.md` → Option 1

**Time:** 5-10 minutes

### Option B: Local MongoDB
Install MongoDB on your computer

**📖 Detailed guide:** See `MONGODB_SETUP.md` → Option 2

**Time:** 10-15 minutes

---

## ✅ Step 3: Create .env File

Create a file named `.env` in project root:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=your-random-secret-key-here
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Time:** 2 minutes

---

## ✅ Step 4: Set Up Firebase (Optional - Can Skip for Now)

1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Create project
3. Enable Cloud Messaging
4. Download service account key
5. Save as `firebase-service-account.json`

**📖 Detailed guide:** See `FIREBASE_SETUP.md`

**Note:** You can skip this and add it later. The app will work without it (just no notifications).

**Time:** 5 minutes (or skip for now)

---

## ✅ Step 5: Test Everything

### 5.1 Start Server
```bash
npm run dev
```
Should see: `✅ Connected to MongoDB` and `🚀 Server running on port 3000`

### 5.2 Test Health
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"OK",...}`

### 5.3 Create Test Data
```bash
npm run seed
```
Creates offices and test users

### 5.4 Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ahmed@foodics.com", "password": "password123"}'
```
Should return a token

**Time:** 5 minutes

---

## 🎉 You're Done!

If all steps completed successfully, your backend is ready!

---

## 📚 Need More Help?

- **Complete step-by-step:** `COMPLETE_SETUP_GUIDE.md`
- **MongoDB details:** `MONGODB_SETUP.md`
- **Firebase details:** `FIREBASE_SETUP.md`
- **Testing API:** `TESTING.md` or `QUICK_START.md`

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` |
| "MongoDB connection error" | Check `.env` file, verify connection string |
| "Port 3000 in use" | Change `PORT` in `.env` to `3001` |
| "Firebase file not found" | OK to skip for now, or check file path |

---

## 📝 Test Credentials (After Seeding)

- **Email:** `ahmed@foodics.com`
- **Password:** `password123`

Or use:
- `sara@foodics.com` / `password123`
- `mohamed@foodics.com` / `password123`
- `admin@foodics.com` / `admin123`

---

## ⏱️ Total Setup Time

- **With MongoDB Atlas:** ~15-20 minutes
- **With Local MongoDB:** ~25-30 minutes
- **Skipping Firebase:** Save 5 minutes (add later)

---

**Next:** Start building your React Native app! 🚀
