# Complete Setup Guide for Beginners

This is a step-by-step guide to get everything working from scratch. Follow these steps in order.

---

## Prerequisites

- Node.js installed ([Download here](https://nodejs.org/))
- A code editor (VS Code recommended)
- Internet connection

---

## Step 1: Install Node.js Dependencies

Open terminal in your project folder and run:

```bash
npm install
```

This will install all the required packages (Express, MongoDB, Firebase, etc.)

**Expected output:** You should see a list of packages being installed, ending with something like "added 200 packages".

---

## Step 2: Set Up MongoDB

You have two options. **Choose Option A (Atlas) if you're a beginner** - it's easier!

### Option A: MongoDB Atlas (Cloud - Recommended) ⭐

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up (use Google/GitHub for faster signup)
3. Click **"Build a Database"**
4. Choose **FREE (M0)** tier
5. Select a region (choose closest to you)
6. Click **"Create"** (wait 1-3 minutes)

**Create Database User:**
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Username: `foodics-admin`
4. Password: Create a strong password (save it!)
5. Privileges: **"Atlas admin"**
6. Click **"Add User"**

**Whitelist IP:**
1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
4. Click **"Confirm"**

**Get Connection String:**
1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Select **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string

**Update .env:**
```env
MONGODB_URI=mongodb+srv://foodics-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority
```
Replace `YOUR_PASSWORD` and `cluster0.xxxxx` with your actual values.

### Option B: Local MongoDB

See `MONGODB_SETUP.md` for detailed local installation instructions.

---

## Step 3: Set Up Firebase (Optional for Now)

Firebase is needed for push notifications. You can skip this for now and add it later when building the mobile app.

### Quick Setup:

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it: `Hungry Foodicsers`
4. Click through the setup (disable Analytics if you want)
5. Click **"Continue"**

**Get Service Account Key:**
1. Click **gear icon (⚙️)** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. Save the downloaded JSON file as `firebase-service-account.json` in your project root

**Update .env:**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Note:** If you skip Firebase, the app will still work, but notifications won't be sent. You'll see warnings in the console, which is fine.

---

## Step 4: Create .env File

Create a file named `.env` in your project root with this content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# Replace with your MongoDB Atlas connection string or local MongoDB URI
MONGODB_URI=mongodb+srv://foodics-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hungry-foodicsers?retryWrites=true&w=majority

# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Firebase Configuration (optional - can skip for now)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual MongoDB password
- Replace `cluster0.xxxxx` with your actual cluster name
- Change `JWT_SECRET` to a long random string (for security)

---

## Step 5: Test Everything

### 5.1: Start the Server

```bash
npm run dev
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Firebase Admin SDK initialized  (or warning if Firebase not set up)
🚀 Server running on port 3000
```

If you see errors:
- **MongoDB error**: Check your connection string in `.env`
- **Firebase warning**: This is OK if you skipped Firebase setup

### 5.2: Test Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{"status":"OK","message":"Hungry Foodicsers API is running"}
```

### 5.3: Seed Test Data

In the same terminal:

```bash
npm run seed
```

**Expected output:**
```
✅ Connected to MongoDB
✅ Created office: Cairo Office
✅ Created office: Dubai Office
✅ Created office: Riyadh Office
✅ Created user: Ahmed Mohamed (ahmed@foodics.com)
✅ Created user: Sara Ali (sara@foodics.com)
✅ Created user: Mohamed Emad (mohamed@foodics.com)
✅ Created user: Admin User (admin@foodics.com)
✅ Seed data created successfully!
```

### 5.4: Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@foodics.com",
    "password": "password123"
  }'
```

**Expected response:** JSON with `success: true` and a `token` field.

**Copy the token!** You'll need it for other requests.

### 5.5: Test Creating an Order

Replace `YOUR_TOKEN_HERE` with the token from step 5.4:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "restaurant": "KFC",
    "restaurantPhone": "+201234567890"
  }'
```

**Expected response:** JSON with `success: true` and order details.

---

## Step 6: Run Automated Tests (Optional)

If you want to test everything automatically:

```bash
./test-api.sh
```

This will test all endpoints and show you what's working.

---

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### "MongoDB connection error"
- Check `.env` file has correct `MONGODB_URI`
- For Atlas: Make sure IP is whitelisted
- For Local: Make sure MongoDB is running

### "Port 3000 already in use"
Change `PORT` in `.env` to another number (e.g., `3001`)

### "Firebase service account file not found"
- This is OK if you skipped Firebase
- Or check file exists and path in `.env` is correct

### "Token is not valid"
- Make sure you're including `Bearer ` before the token
- Token might have expired, login again

---

## What's Next?

✅ **Backend is ready!** Now you can:

1. **Test all endpoints** - See `TESTING.md` for detailed API testing
2. **Build the React Native app** - Connect it to this backend
3. **Add Firebase to mobile app** - For push notifications
4. **Deploy backend** - When ready for production

---

## Quick Reference

### Start Server
```bash
npm run dev
```

### Seed Data
```bash
npm run seed
```

### Test API
```bash
./test-api.sh
```

### Test Credentials
- Email: `ahmed@foodics.com`
- Password: `password123`

---

## Need More Help?

- **MongoDB Setup**: See `MONGODB_SETUP.md`
- **Firebase Setup**: See `FIREBASE_SETUP.md`
- **API Testing**: See `TESTING.md`
- **Quick Start**: See `QUICK_START.md`

---

## Checklist

Before moving forward, make sure:

- [ ] Node.js dependencies installed (`npm install`)
- [ ] MongoDB set up (Atlas or local)
- [ ] `.env` file created with correct values
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check works (`curl http://localhost:3000/health`)
- [ ] Seed data created (`npm run seed`)
- [ ] Can login and get token
- [ ] Can create an order

If all checkboxes are checked, **you're ready to go!** 🎉
