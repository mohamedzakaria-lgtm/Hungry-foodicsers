# Quick Start Testing Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Seed Test Data
```bash
npm run seed
```
This creates:
- 3 offices (Cairo, Dubai, Riyadh)
- 4 test users (ahmed@foodics.com, sara@foodics.com, mohamed@foodics.com, admin@foodics.com)
- All passwords: `password123` (except admin: `admin123`)

### 5. Start the Server
```bash
npm run dev
```

---

## 🧪 Quick Test (3 steps)

### Step 1: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@foodics.com",
    "password": "password123"
  }'
```

**Copy the `token` from the response!**

### Step 2: Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "restaurant": "KFC",
    "restaurantPhone": "+201234567890"
  }'
```

**Copy the `_id` from the order response!**

### Step 3: Add an Item
```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID_HERE/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Chicken Bucket",
    "quantity": 2
  }'
```

---

## ✅ Automated Testing

### Option 1: Run Test Script
```bash
./test-api.sh
```

### Option 2: Use Postman
1. Import `postman-collection.json` (if available)
2. Set the `token` variable after login
3. Run the collection

### Option 3: Use Thunder Client (VS Code)
1. Install Thunder Client extension
2. Import the collection
3. Run requests

---

## 📋 Full Testing Checklist

- [ ] Health check works (`/health`)
- [ ] Can register a user
- [ ] Can login and get token
- [ ] Can get current user info
- [ ] Can get all offices
- [ ] Can create an order
- [ ] Can get all orders
- [ ] Can get specific order
- [ ] Can add item to order
- [ ] Can update item price (as order creator)
- [ ] Can update order status
- [ ] Can remove item from order
- [ ] Can get users in office

---

## 🔔 Testing Notifications

1. Register/login with multiple users
2. Update Firebase token for each user:
   ```bash
   curl -X PUT http://localhost:3000/api/auth/firebase-token \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -d '{"token": "FIREBASE_FCM_TOKEN"}'
   ```
3. Create an order → Other users should get notified
4. Update item price → Item owner should get notified
5. Mark order as delivered → All participants should get notified

**Note:** You need valid Firebase FCM tokens from your React Native app.

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Check if MongoDB is running: `mongosh` or check MongoDB service
- Verify `MONGODB_URI` in `.env`

### "Token is not valid"
- Make sure you include `Bearer ` before the token
- Token might have expired, login again

### "Office not found"
- Run `npm run seed` to create test offices

### "Firebase not initialized"
- This is OK for basic testing
- Notifications won't work without Firebase setup
- API will still work for all other endpoints

---

## 📚 More Details

- See `TESTING.md` for detailed endpoint documentation
- See `README.md` for full API documentation
- See `SETUP.md` for complete setup instructions
