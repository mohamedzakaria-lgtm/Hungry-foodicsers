# Recurring Order Groups - Complete Guide

This feature allows users to create **recurring order groups** that automatically create orders at specified times. Perfect for regular meal times like breakfast (Ftar), lunch, or coffee breaks!

---

## 🎯 What Are Recurring Order Groups?

A **recurring order group** is a template that automatically creates orders on a schedule. For example:

- **"Ftar"** group: Creates orders every working day (Mon-Fri) from 9:00 AM to 10:00 AM
- **"Lunch"** group: Creates orders every weekday from 12:00 PM to 1:00 PM
- **"Coffee Break"** group: Creates orders every day at 3:00 PM

When the scheduled time arrives, the system automatically:
1. ✅ Creates a new order
2. ✅ Links it to the order group
3. ✅ Notifies all office members
4. ✅ Sets it to `open` status (ready for items)

---

## 📋 Order Group Configuration

### **Basic Information:**
- **Name**: Group name (e.g., "Ftar", "Lunch", "Coffee Break")
- **Restaurant**: Default restaurant for orders
- **Restaurant Phone**: Phone number for orders
- **Default Notes**: Optional notes added to each order

### **Schedule:**
- **Days of Week**: Which days to create orders (0=Sunday, 1=Monday, ..., 6=Saturday)
- **Start Time**: When to create the order (24-hour format, e.g., "09:00")
- **End Time**: End of the time window (24-hour format, e.g., "10:00")
- **Timezone**: Optional timezone (defaults to UTC)

---

## 🔄 How It Works

### **1. Create Order Group**

User creates a recurring order group with schedule:
```json
{
  "name": "Ftar",
  "restaurant": "Local Bakery",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5],  // Monday to Friday
    "startTime": "09:00",            // 9 AM
    "endTime": "10:00",              // 10 AM
    "timezone": "Africa/Cairo"
  },
  "defaultNotes": "Daily breakfast order"
}
```

### **2. System Schedules It**

- System creates a cron job for the schedule
- Job runs at `startTime` on specified days
- Only creates order if current time is within `startTime` - `endTime` window

### **3. Automatic Order Creation**

When scheduled time arrives:
- ✅ Creates new order with status `open`
- ✅ Links to order group
- ✅ Notifies all office members
- ✅ Ready for people to add items!

### **4. Order Proceeds Normally**

After auto-creation, the order follows the normal flow:
- People add items
- Creator calls restaurant
- Prices are entered
- Order is delivered

---

## 📡 API Endpoints

### **Create Order Group**

```http
POST /api/order-groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ftar",
  "restaurant": "Local Bakery",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5],
    "startTime": "09:00",
    "endTime": "10:00",
    "timezone": "Africa/Cairo"
  },
  "defaultNotes": "Daily breakfast order"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order group created and scheduled successfully",
  "data": {
    "orderGroup": {
      "_id": "...",
      "name": "Ftar",
      "creator": { "name": "...", "email": "..." },
      "office": "...",
      "restaurant": "Local Bakery",
      "schedule": {
        "daysOfWeek": [1, 2, 3, 4, 5],
        "startTime": "09:00",
        "endTime": "10:00"
      },
      "isActive": true,
      "createdAt": "..."
    }
  }
}
```

---

### **Get All Order Groups (Office)**

```http
GET /api/order-groups
Authorization: Bearer <token>
```

**Query Parameters:**
- `active` (optional): Filter by active status (`true`/`false`)

**Example:**
```http
GET /api/order-groups?active=true
```

---

### **Get My Order Groups**

```http
GET /api/order-groups/my
Authorization: Bearer <token>
```

Returns order groups created by the current user.

---

### **Get Order Group by ID**

```http
GET /api/order-groups/:id
Authorization: Bearer <token>
```

---

### **Update Order Group**

```http
PUT /api/order-groups/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isActive": false,  // Pause the group
  "schedule": {
    "startTime": "09:30"  // Update start time
  }
}
```

**Note:** Only the creator can update/delete the group.

---

### **Delete Order Group**

```http
DELETE /api/order-groups/:id
Authorization: Bearer <token>
```

**Note:** This unschedules and permanently deletes the group.

---

## 📅 Days of Week Reference

| Day | Number | Name |
|-----|--------|------|
| Sunday | 0 | Sunday |
| Monday | 1 | Monday |
| Tuesday | 2 | Tuesday |
| Wednesday | 3 | Wednesday |
| Thursday | 4 | Thursday |
| Friday | 5 | Friday |
| Saturday | 6 | Saturday |

**Examples:**
- Working days: `[1, 2, 3, 4, 5]` (Mon-Fri)
- Weekend: `[0, 6]` (Sat-Sun)
- Every day: `[0, 1, 2, 3, 4, 5, 6]`
- Weekdays only: `[1, 2, 3, 4, 5]`

---

## ⏰ Time Format

Times must be in **24-hour format** (HH:MM):

- ✅ `"09:00"` - 9:00 AM
- ✅ `"13:30"` - 1:30 PM
- ✅ `"17:00"` - 5:00 PM
- ❌ `"9:00"` - Invalid (must be 2 digits)
- ❌ `"09:00 AM"` - Invalid (24-hour format only)

---

## 🌍 Timezones

Supported timezone formats:
- `"UTC"` (default)
- `"Africa/Cairo"` (Egypt)
- `"Asia/Dubai"` (UAE)
- `"Asia/Riyadh"` (Saudi Arabia)
- Any valid IANA timezone

---

## 💡 Example Scenarios

### **Scenario 1: Daily Breakfast (Ftar)**

```json
{
  "name": "Ftar",
  "restaurant": "Local Bakery",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5],  // Weekdays
    "startTime": "09:00",
    "endTime": "10:00",
    "timezone": "Africa/Cairo"
  },
  "defaultNotes": "Daily breakfast - join if you want!"
}
```

**Result:** Every weekday at 9:00 AM, a new order is created from "Local Bakery".

---

### **Scenario 2: Lunch Order**

```json
{
  "name": "Lunch",
  "restaurant": "KFC",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5],
    "startTime": "12:00",
    "endTime": "13:00",
    "timezone": "Africa/Cairo"
  }
}
```

**Result:** Every weekday at 12:00 PM, a new KFC order is created.

---

### **Scenario 3: Weekend Coffee**

```json
{
  "name": "Weekend Coffee",
  "restaurant": "Starbucks",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [0, 6],  // Saturday and Sunday
    "startTime": "10:00",
    "endTime": "11:00",
    "timezone": "Africa/Cairo"
  }
}
```

**Result:** Every weekend at 10:00 AM, a new Starbucks order is created.

---

## 🔔 Notifications

When an order is automatically created from a group:
- ✅ All office members receive a notification
- ✅ Title: "New Order Created! 🍕"
- ✅ Message: "{Creator} created an order from {Restaurant}. Join now!"
- ✅ Order is ready for people to add items

---

## 🎛️ Managing Order Groups

### **Pause a Group**

Set `isActive: false` to temporarily pause:
```http
PUT /api/order-groups/:id
{
  "isActive": false
}
```

### **Resume a Group**

Set `isActive: true` to resume:
```http
PUT /api/order-groups/:id
{
  "isActive": true
}
```

### **Update Schedule**

Change the schedule:
```http
PUT /api/order-groups/:id
{
  "schedule": {
    "startTime": "09:30",
    "endTime": "10:30"
  }
}
```

The system will automatically reschedule the group.

---

## 🔍 Viewing Orders from Groups

Orders created from groups are linked via the `orderGroup` field:

```http
GET /api/orders?orderGroup=group-id
```

Or check individual orders:
```json
{
  "order": {
    "_id": "...",
    "orderGroup": {
      "_id": "group-id",
      "name": "Ftar"
    },
    "restaurant": "Local Bakery",
    ...
  }
}
```

---

## ⚠️ Important Notes

### **Time Window**
- Orders are only created if current time is within `startTime` - `endTime` window
- If server time is outside the window, order creation is skipped

### **One Order Per Day**
- System prevents creating multiple orders from the same group on the same day
- `lastOrderCreated` timestamp tracks when last order was created

### **Server Restart**
- When server restarts, all active order groups are automatically rescheduled
- No manual intervention needed

### **Timezone Handling**
- Make sure server timezone matches your needs
- Or specify timezone in group configuration

---

## 🚀 Quick Start

### **1. Create Your First Order Group**

```bash
curl -X POST http://localhost:3000/api/order-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ftar",
    "restaurant": "Local Bakery",
    "restaurantPhone": "+201234567890",
    "schedule": {
      "daysOfWeek": [1, 2, 3, 4, 5],
      "startTime": "09:00",
      "endTime": "10:00"
    }
  }'
```

### **2. Verify It's Scheduled**

```bash
curl http://localhost:3000/api/order-groups/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Wait for Scheduled Time**

At the scheduled time, check for new orders:
```bash
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Order Group Data Structure

```json
{
  "_id": "group-id",
  "name": "Ftar",
  "creator": { "name": "...", "email": "..." },
  "office": "office-id",
  "restaurant": "Local Bakery",
  "restaurantPhone": "+201234567890",
  "schedule": {
    "daysOfWeek": [1, 2, 3, 4, 5],
    "startTime": "09:00",
    "endTime": "10:00",
    "timezone": "Africa/Cairo"
  },
  "defaultNotes": "Daily breakfast",
  "isActive": true,
  "lastOrderCreated": "2024-01-16T09:00:00Z",
  "cronJobId": "group-id",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## ✅ Summary

**Features:**
- ✅ Create recurring order groups
- ✅ Automatic order creation on schedule
- ✅ Flexible scheduling (days, times, timezone)
- ✅ Pause/resume groups
- ✅ Update schedules
- ✅ View orders from groups
- ✅ Automatic notifications

**Perfect for:**
- 🍳 Daily breakfast (Ftar)
- 🍽️ Regular lunch orders
- ☕ Coffee breaks
- 🍕 Weekly pizza orders
- Any recurring meal pattern!

---

## 🎯 Best Practices

1. **Clear Naming**: Use descriptive names (e.g., "Ftar", "Lunch", "Coffee Break")
2. **Realistic Time Windows**: Give enough time for people to add items
3. **Office Communication**: Let office know about new recurring groups
4. **Monitor First Orders**: Check that first auto-created orders work correctly
5. **Update as Needed**: Adjust schedules based on office needs

---

**Recurring orders make group ordering effortless! Set it once and orders create themselves!** 🎉
