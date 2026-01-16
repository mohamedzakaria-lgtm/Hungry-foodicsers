# Testing Guide

This guide will help you test all the API endpoints and verify that everything is working correctly.

## Prerequisites

1. MongoDB is running
2. Server is running (`npm run dev`)
3. Firebase is configured (optional for notification testing)

## Testing Tools

You can use any of these tools:
- **Postman** (recommended for GUI)
- **Thunder Client** (VS Code extension)
- **curl** (command line)
- **httpie** (command line, more user-friendly than curl)

## Step-by-Step Testing Flow

### Step 1: Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Hungry Foodicsers API is running"
}
```

---

### Step 2: Create an Office

First, we need to create an office. But wait - we need authentication! Let's create a test user first, but we need an office ID for that... 

**Solution:** We'll create an office without auth first, or you can manually insert one in MongoDB, OR we can modify the office creation to allow it without auth for testing.

For now, let's create an office using MongoDB directly or create a test script.

**Option A: Using MongoDB Shell**
```javascript
// Connect to MongoDB
use hungry-foodicsers

// Insert office
db.offices.insertOne({
  name: "Cairo Office",
  location: "New Cairo",
  city: "Cairo",
  country: "Egypt",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option B: Using API (if you temporarily remove auth from office creation)**

---

### Step 3: Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Mohamed",
    "email": "ahmed@foodics.com",
    "password": "password123",
    "office": "OFFICE_ID_FROM_STEP_2"
  }'
```

**Save the token from the response!** You'll need it for subsequent requests.

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "Ahmed Mohamed",
      "email": "ahmed@foodics.com",
      "office": {...},
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Step 4: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@foodics.com",
    "password": "password123"
  }'
```

---

### Step 5: Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 6: Create an Office (if you have admin access)

```bash
curl -X POST http://localhost:3000/api/offices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Dubai Office",
    "location": "Dubai Marina",
    "city": "Dubai",
    "country": "UAE"
  }'
```

---

### Step 7: Get All Offices

```bash
curl http://localhost:3000/api/offices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 8: Update Firebase Token

```bash
curl -X PUT http://localhost:3000/api/auth/firebase-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "token": "YOUR_FIREBASE_FCM_TOKEN"
  }'
```

**Note:** Get this token from your React Native app after implementing Firebase.

---

### Step 9: Create an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "restaurant": "KFC",
    "restaurantPhone": "+201234567890",
    "notes": "Please be quick!"
  }'
```

**Save the order ID from the response!**

Expected response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "creator": {...},
      "office": "...",
      "restaurant": "KFC",
      "status": "open",
      "items": [],
      "totalAmount": 0,
      "createdAt": "..."
    }
  }
}
```

---

### Step 10: Get All Orders

```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Get orders by status:
```bash
curl "http://localhost:3000/api/orders?status=open" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 11: Get Specific Order

```bash
curl http://localhost:3000/api/orders/ORDER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 12: Add Item to Order

```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID_HERE/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Chicken Bucket",
    "quantity": 2,
    "notes": "Extra spicy please"
  }'
```

**Save the item ID from the response!**

---

### Step 13: Update Item Price (Order Creator Only)

```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID_HERE/items/ITEM_ID_HERE/price \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "price": 150.50
  }'
```

---

### Step 14: Update Order Status to "Ordered"

```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "ordered"
  }'
```

---

### Step 15: Update Order Status to "Delivered"

```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID_HERE/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "delivered"
  }'
```

---

### Step 16: Remove Item from Order

```bash
curl -X DELETE http://localhost:3000/api/orders/ORDER_ID_HERE/items/ITEM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 17: Get Users in Office

```bash
curl http://localhost:3000/api/users/office/OFFICE_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing Notifications

To test notifications, you need:

1. A valid Firebase FCM token
2. Multiple users registered with Firebase tokens
3. Create an order and add items
4. Update prices and status

Notifications will be sent automatically when:
- A new order is created (all office members except creator)
- Item price is updated (item owner)
- Order is delivered (all participants)

Check your Firebase console logs or the server console for notification status.

---

## Common Issues

### 1. "MongoDB connection error"
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

### 2. "Token is not valid"
- Make sure you're including `Bearer ` before the token
- Check if token has expired
- Verify `JWT_SECRET` in `.env`

### 3. "Firebase not initialized"
- Check if `firebase-service-account.json` exists
- Verify the file path in `.env`
- Check Firebase console for service account key

### 4. "Office not found"
- Create an office first
- Use the correct office ID

---

## Quick Test Script

See `test-api.sh` for an automated test script.
