# View My Orders - User Guide

Users can now view orders they've participated in! This feature allows users to see only the orders where they have items.

---

## 📋 Available Endpoints

### **Option 1: Dedicated Endpoint (Recommended)**

```
GET /api/orders/my
```

Get all orders where the current user has items.

**Query Parameters:**
- `status` (optional) - Filter by status: `open`, `ordered`, `delivered`, `cancelled`

**Example:**
```http
GET /api/orders/my
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "order-id-1",
        "creator": { "name": "Ahmed", "email": "ahmed@foodics.com" },
        "restaurant": "KFC",
        "status": "delivered",
        "totalAmount": 150.50,
        "items": [
          {
            "_id": "item-id",
            "name": "Chicken Bucket",
            "quantity": 2,
            "price": 150.50,
            "notes": "Extra spicy",
            "user": { "name": "Sara", "email": "sara@foodics.com" }
          }
        ],
        "deliveredAt": "2024-01-16T12:00:00Z",
        "createdAt": "2024-01-16T10:00:00Z"
      }
    ]
  }
}
```

**Note:** Only shows items that belong to the current user!

---

### **Option 2: Query Parameter**

```
GET /api/orders?my=true
```

Same functionality as `/api/orders/my`, but using a query parameter.

**Example:**
```http
GET /api/orders?my=true&status=delivered
Authorization: Bearer <token>
```

---

## 🎯 Use Cases

### **1. View All My Orders**
```http
GET /api/orders/my
```
Shows all orders where user has items, regardless of status.

### **2. View My Active Orders**
```http
GET /api/orders/my?status=open
```
Shows only open orders where user has items.

### **3. View My Delivered Orders**
```http
GET /api/orders/my?status=delivered
```
Shows only delivered orders (order history).

### **4. View My Ordered (Placed) Orders**
```http
GET /api/orders/my?status=ordered
```
Shows orders that have been placed but not yet delivered.

---

## 📊 Response Details

### **What's Included:**
- ✅ Order information (restaurant, status, dates)
- ✅ Order creator details
- ✅ **Only user's items** (filtered automatically)
- ✅ Item prices (if set)
- ✅ Order total (calculated from all items, but only user's items shown)

### **What's Filtered:**
- ❌ Other users' items are hidden
- ❌ Only shows orders from user's office
- ❌ Only shows orders where user has items

---

## 🔍 Example Scenarios

### **Scenario 1: Sara wants to see her order history**

**Request:**
```http
GET /api/orders/my?status=delivered
```

**Response:** Shows all delivered orders where Sara has items, with only Sara's items visible.

---

### **Scenario 2: Mohamed wants to see his active orders**

**Request:**
```http
GET /api/orders/my?status=open
```

**Response:** Shows all open orders where Mohamed has items.

---

### **Scenario 3: Ahmed (order creator) wants to see orders he created**

**Note:** This endpoint shows orders where user has **items**, not orders user **created**.

To see orders you created, use:
```http
GET /api/orders
```
Then filter on the frontend by `creator._id === currentUser._id`

---

## 💡 Key Features

### **1. Automatic Filtering**
- Only shows orders where user has items
- Only shows user's items in each order
- Automatically filters by user's office

### **2. Status Filtering**
- Filter by order status
- Useful for viewing order history vs active orders

### **3. Privacy**
- Users can't see other users' items
- Only see their own participation

---

## 📱 Frontend Integration Example

### **React Native Example:**

```javascript
// Get user's orders
const getMyOrders = async (status = null) => {
  try {
    const url = status 
      ? `/api/orders/my?status=${status}`
      : '/api/orders/my';
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    return data.data.orders;
  } catch (error) {
    console.error('Error fetching my orders:', error);
    return [];
  }
};

// Usage
const myDeliveredOrders = await getMyOrders('delivered');
const myActiveOrders = await getMyOrders('open');
const allMyOrders = await getMyOrders();
```

---

## 🔄 Comparison: All Orders vs My Orders

### **GET /api/orders** (All Office Orders)
- Shows all orders from user's office
- Shows all items from all users
- Useful for: Browsing, seeing what others ordered

### **GET /api/orders/my** (My Orders)
- Shows only orders where user has items
- Shows only user's items
- Useful for: Personal order history, tracking your items

---

## ✅ Summary

**New Endpoints:**
- ✅ `GET /api/orders/my` - Get user's orders
- ✅ `GET /api/orders/my?status=delivered` - Filter by status
- ✅ `GET /api/orders?my=true` - Alternative syntax

**Features:**
- ✅ Shows only orders where user has items
- ✅ Shows only user's items in each order
- ✅ Filter by status
- ✅ Privacy-focused (can't see others' items)

**Perfect for:**
- 📱 "My Orders" screen in mobile app
- 📊 Order history
- 🔔 Tracking your items
- 💰 Viewing your spending

---

## 🎯 Quick Reference

| Endpoint | Purpose | Shows |
|----------|---------|-------|
| `GET /api/orders` | All office orders | All orders, all items |
| `GET /api/orders/my` | My orders | Orders I participated in, my items only |
| `GET /api/orders/my?status=delivered` | My delivered orders | My order history |
| `GET /api/orders/my?status=open` | My active orders | Orders I can still modify |

---

Users can now easily track their orders and view their order history! 🎉
