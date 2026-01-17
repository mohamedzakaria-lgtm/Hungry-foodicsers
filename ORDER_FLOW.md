# Order Flow - Complete Guide

This document explains how the order system works from start to finish, including all steps, API calls, notifications, and user interactions.

---

## 📋 Order Lifecycle Overview

An order goes through 4 main statuses:

1. **`open`** - Order is open, people can add items
2. **`ordered`** - Order creator called restaurant and placed order
3. **`delivered`** - Order has been delivered
4. **`cancelled`** - Order was cancelled

---

## 🔄 Complete Order Flow

### **Step 1: Create Order** 🆕

**Who:** Any employee in the office  
**Action:** Creates a new group order

#### API Call:
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurant": "KFC",
  "restaurantPhone": "+201234567890",
  "notes": "Please be quick!"
}
```

#### What Happens:
1. ✅ Order is created with status `open`
2. ✅ Order is linked to creator's office
3. ✅ **Notification sent** to all office members (except creator)
   - Title: "New Order Created! 🍕"
   - Message: "{Creator Name} created an order from {Restaurant}. Join now!"
   - Data: `{ type: 'new_order', orderId: '...', restaurant: '...' }`

#### Response:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "creator": { "name": "...", "email": "..." },
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

### **Step 2: Add Items** ➕

**Who:** Any employee in the same office  
**Action:** Adds food items to the order

#### API Call:
```http
POST /api/orders/:orderId/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chicken Bucket",
  "quantity": 2,
  "notes": "Extra spicy please"
}
```

#### What Happens:
1. ✅ Validates order exists and is `open`
2. ✅ Validates user is in same office
3. ✅ Creates OrderItem linked to user and order
4. ✅ Adds item to order's items array
5. ✅ Order total is recalculated automatically

#### Response:
```json
{
  "success": true,
  "message": "Item added to order successfully",
  "data": {
    "item": {
      "_id": "...",
      "order": "...",
      "user": { "name": "...", "email": "..." },
      "name": "Chicken Bucket",
      "quantity": 2,
      "price": null,  // Not set yet
      "notes": "Extra spicy please"
    }
  }
}
```

#### Notes:
- Multiple users can add items
- Each item is linked to the user who added it
- Items can have notes (special instructions)
- Price is `null` initially (set later by order creator)

---

### **Step 3: Remove Items** ➖ (Optional)

**Who:** Item owner OR order creator  
**Action:** Removes an item from the order

#### API Call:
```http
DELETE /api/orders/:orderId/items/:itemId
Authorization: Bearer <token>
```

#### What Happens:
1. ✅ Validates order is still `open`
2. ✅ Validates user owns item OR is order creator
3. ✅ Removes item from order
4. ✅ Deletes OrderItem from database
5. ✅ Order total recalculated

---

### **Step 4: Order Creator Calls Restaurant** 📞

**Who:** Order creator  
**Action:** Calls restaurant and places the order

**This is done manually** - the order creator:
- Calls the restaurant using `restaurantPhone` from order
- Places the order verbally
- Gets prices for items

---

### **Step 5: Update Order Status to "Ordered"** 📝

**Who:** Order creator only  
**Action:** Marks order as placed with restaurant

#### API Call:
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ordered"
}
```

#### What Happens:
1. ✅ Validates user is order creator
2. ✅ Updates status to `ordered`
3. ✅ Sets `orderedAt` timestamp
4. ✅ **No more items can be added** (order is closed)

#### Notes:
- Only order creator can change status
- Once status is `ordered`, items cannot be added/removed
- This locks the order

---

### **Step 6: Enter Item Prices** 💰

**Who:** Order creator only  
**Action:** Enters prices for each item (from restaurant call)

#### API Call:
```http
PUT /api/orders/:orderId/items/:itemId/price
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 150.50
}
```

#### What Happens:
1. ✅ Validates user is order creator
2. ✅ Updates item price
3. ✅ Recalculates order total
4. ✅ **Notification sent** to item owner
   - Title: "Item Price Updated 💰"
   - Message: "Your {Item Name} from {Restaurant} costs {Price} EGP"
   - Data: `{ type: 'item_price_updated', orderId: '...', itemId: '...', price: '...' }`

#### Response:
```json
{
  "success": true,
  "message": "Item price updated successfully",
  "data": {
    "item": {
      "_id": "...",
      "name": "Chicken Bucket",
      "price": 150.50,
      "user": { "name": "...", "email": "..." }
    }
  }
}
```

#### Notes:
- Order creator enters prices one by one
- Each price update notifies the item owner
- Order total updates automatically

---

### **Step 7: Order Delivered** 🎉

**Who:** Order creator only  
**Action:** Marks order as delivered

#### API Call:
```http
PUT /api/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "delivered"
}
```

#### What Happens:
1. ✅ Validates user is order creator
2. ✅ Updates status to `delivered`
3. ✅ Sets `deliveredAt` timestamp
4. ✅ **Notification sent** to ALL users who have items
   - Title: "Order Delivered! 🎉"
   - Message: "Your order from {Restaurant} has been delivered!"
   - Data: `{ type: 'order_delivered', orderId: '...', restaurant: '...' }`

#### Response:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {
      "_id": "...",
      "status": "delivered",
      "deliveredAt": "...",
      "totalAmount": 450.50,
      "items": [...]
    }
  }
}
```

---

## 📊 Order States & Permissions

### **Status: `open`**
- ✅ Anyone in office can add items
- ✅ Item owners can remove their items
- ✅ Order creator can remove any item
- ✅ Order creator can update status
- ❌ No one can update prices yet

### **Status: `ordered`**
- ❌ No one can add/remove items
- ✅ Order creator can enter prices
- ✅ Order creator can update status
- ✅ Users get notified when their item price is set

### **Status: `delivered`**
- ❌ No changes allowed
- ✅ Order is complete
- ✅ All participants notified

### **Status: `cancelled`**
- ❌ No changes allowed
- ✅ Order is cancelled

---

## 🔔 Notification Flow

### **Notification 1: New Order Created**
- **When:** Order is created
- **Who receives:** All office members (except creator)
- **Content:** 
  - Title: "New Order Created! 🍕"
  - Message: "{Creator} created an order from {Restaurant}. Join now!"
  - Data: `{ type: 'new_order', orderId: '...', restaurant: '...' }`

### **Notification 2: Item Price Updated**
- **When:** Order creator sets price for an item
- **Who receives:** Item owner only
- **Content:**
  - Title: "Item Price Updated 💰"
  - Message: "Your {Item} from {Restaurant} costs {Price} EGP"
  - Data: `{ type: 'item_price_updated', orderId: '...', itemId: '...', price: '...' }`

### **Notification 3: Order Delivered**
- **When:** Order status changed to `delivered`
- **Who receives:** All users who have items in the order
- **Content:**
  - Title: "Order Delivered! 🎉"
  - Message: "Your order from {Restaurant} has been delivered!"
  - Data: `{ type: 'order_delivered', orderId: '...', restaurant: '...' }`

---

## 👥 User Roles & Permissions

### **Order Creator:**
- ✅ Can update order status
- ✅ Can enter item prices
- ✅ Can remove any item (when order is open)
- ✅ Can cancel order

### **Regular User (Office Member):**
- ✅ Can add items (when order is open)
- ✅ Can remove own items (when order is open)
- ✅ Can view order details
- ✅ Receives notifications

### **Office-Based Access:**
- ✅ Users can only see orders from their office
- ✅ Users can only add items to orders from their office
- ✅ Cross-office access is blocked

---

## 📱 Example User Journey

### **Scenario: Lunch Order from KFC**

1. **Ahmed** (Cairo Office) creates order:
   - Restaurant: "KFC"
   - Phone: "+201234567890"
   - Status: `open`

2. **Notification sent** to Sara, Mohamed, and other Cairo office members

3. **Sara** adds item:
   - "Chicken Bucket" x2
   - Notes: "Extra spicy"

4. **Mohamed** adds item:
   - "Zinger Burger" x1
   - Notes: "No pickles"

5. **Ahmed** (creator) calls KFC and places order

6. **Ahmed** updates status to `ordered`
   - Order is now locked

7. **Ahmed** enters prices:
   - Sara's Chicken Bucket: 150 EGP → **Sara gets notification**
   - Mohamed's Zinger: 80 EGP → **Mohamed gets notification**

8. Order arrives at office

9. **Ahmed** updates status to `delivered`
   - **Sara and Mohamed get notification** 🎉

10. Everyone picks up their food!

---

## 🔍 API Endpoints Summary

| Endpoint | Method | Who | Purpose |
|----------|--------|-----|---------|
| `/api/orders` | POST | Anyone | Create order |
| `/api/orders` | GET | Anyone | List orders |
| `/api/orders/:id` | GET | Anyone | Get order details |
| `/api/orders/:id/items` | POST | Anyone | Add item |
| `/api/orders/:id/items/:itemId` | DELETE | Owner/Creator | Remove item |
| `/api/orders/:id/items/:itemId/price` | PUT | Creator only | Set item price |
| `/api/orders/:id/status` | PUT | Creator only | Update status |

---

## 💡 Key Features

### **Automatic Calculations:**
- Order total is calculated automatically from item prices
- Updates when items are added/removed/priced

### **Real-time Notifications:**
- Push notifications via Firebase
- Users stay informed at every step

### **Office Isolation:**
- Orders are office-specific
- Users only see orders from their office

### **Flexible Item Management:**
- Users can add multiple items
- Items can have notes (special instructions)
- Items can be removed (when order is open)

### **Price Tracking:**
- Prices set after calling restaurant
- Each user knows their item cost
- Total order amount calculated automatically

---

## 🎯 Best Practices

1. **Order Creator Responsibilities:**
   - Call restaurant promptly
   - Enter prices accurately
   - Update status timely
   - Communicate with office members

2. **Item Owners:**
   - Add items early (while order is open)
   - Check notifications for price updates
   - Be ready when order is delivered

3. **Office Coordination:**
   - One order at a time per restaurant (recommended)
   - Clear communication about order timing
   - Respect order deadlines

---

## 📝 Order Data Structure

### **Order Object:**
```json
{
  "_id": "order-id",
  "creator": { "name": "...", "email": "..." },
  "office": "office-id",
  "restaurant": "KFC",
  "restaurantPhone": "+201234567890",
  "status": "open|ordered|delivered|cancelled",
  "items": ["item-id-1", "item-id-2"],
  "totalAmount": 230.50,
  "orderedAt": "2024-01-16T10:00:00Z",
  "deliveredAt": null,
  "notes": "Please be quick!",
  "createdAt": "2024-01-16T09:00:00Z",
  "updatedAt": "2024-01-16T10:00:00Z"
}
```

### **OrderItem Object:**
```json
{
  "_id": "item-id",
  "order": "order-id",
  "user": { "name": "...", "email": "..." },
  "name": "Chicken Bucket",
  "quantity": 2,
  "price": 150.50,
  "notes": "Extra spicy please",
  "createdAt": "2024-01-16T09:15:00Z"
}
```

---

## ✅ Summary

The order flow is designed to:
- ✅ Make group ordering easy and organized
- ✅ Keep everyone informed with notifications
- ✅ Track prices and totals automatically
- ✅ Ensure only authorized users can make changes
- ✅ Support office-based collaboration

**The system handles everything from order creation to delivery, with automatic notifications keeping all participants informed!** 🎉
