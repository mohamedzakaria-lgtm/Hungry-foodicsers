# Hungry Foodicsers Backend API

Backend API for the Foodics office food ordering application. This allows employees in different office locations to create group orders, add items, and get notified about order status updates.

## 🚀 Getting Started

**New to backend development?** Start here:

1. **[Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - Step-by-step setup from scratch (recommended for beginners)
2. **[MongoDB Setup](./MONGODB_SETUP.md)** - Detailed MongoDB installation guide
3. **[Firebase Setup](./FIREBASE_SETUP.md)** - Firebase configuration for push notifications
4. **[Quick Start](./QUICK_START.md)** - Fast setup if you're experienced
5. **[Testing Guide](./TESTING.md)** - How to test all endpoints

## Features

- 🔐 User authentication (JWT-based)
- 🏢 Multi-office support
- 📦 Order management (create, add items, update status)
- 💰 Price tracking per item
- 🔔 Push notifications via Firebase Cloud Messaging
- 📱 RESTful API ready for React Native mobile app

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Firebase Admin SDK** - Push notifications
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Cloud Messaging enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### 3. MongoDB Setup

Make sure MongoDB is running. You can either:
- Use a local MongoDB instance
- Use MongoDB Atlas (cloud)
- Update `MONGODB_URI` in `.env` accordingly

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Cloud Messaging
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key" to download the service account JSON file
6. Save the file as `firebase-service-account.json` in the project root
7. Update `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` if needed

**Note:** The `firebase-service-account.json` file is in `.gitignore` for security. Never commit it to version control.

### 5. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/firebase-token` - Update Firebase FCM token (requires auth)

### Offices

- `GET /api/offices` - Get all offices (requires auth)
- `GET /api/offices/:id` - Get office by ID (requires auth)
- `POST /api/offices` - Create new office (requires auth)

### Users

- `GET /api/users/office/:officeId` - Get all users in an office (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)

### Orders

- `POST /api/orders` - Create a new order (requires auth)
- `GET /api/orders` - Get all orders for user's office (requires auth)
  - Query params: `?status=open|ordered|delivered|cancelled`
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/orders/:id/items` - Add item to order (requires auth)
- `PUT /api/orders/:id/items/:itemId/price` - Update item price (order creator only)
- `PUT /api/orders/:id/status` - Update order status (order creator only)
- `DELETE /api/orders/:id/items/:itemId` - Remove item from order (requires auth)

## API Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Optional validation errors
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Notification Types

The app sends push notifications for:

1. **New Order Created** - When someone creates an order, all office members are notified
2. **Item Price Updated** - When the order creator sets a price for an item
3. **Order Delivered** - When the order status is updated to "delivered"

## Order Flow

1. User creates an order → Office members get notified
2. Users add items to the order
3. Order creator calls restaurant and places order
4. Order creator updates order status to "ordered"
5. Order creator enters prices for each item → Users get notified about their item prices
6. When order is delivered, creator updates status to "delivered" → All users get notified

## Database Models

- **User** - User accounts with office association
- **Office** - Office locations
- **Order** - Group orders
- **OrderItem** - Individual items in an order

## Development

### Project Structure

```
.
├── models/          # Mongoose models
├── routes/          # Express routes
├── middleware/      # Custom middleware (auth, etc.)
├── services/        # Business logic services (notifications, etc.)
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Testing with Postman/Thunder Client

1. Register a user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (save the token)
3. Create an office: `POST /api/offices`
4. Update Firebase token: `PUT /api/auth/firebase-token`
5. Create an order: `POST /api/orders`
6. Add items: `POST /api/orders/:id/items`
7. Update prices: `PUT /api/orders/:id/items/:itemId/price`
8. Update status: `PUT /api/orders/:id/status`

## Next Steps

- Add input validation and sanitization
- Add rate limiting
- Add request logging
- Add unit and integration tests
- Add API documentation (Swagger/OpenAPI)
- Add admin endpoints for managing offices
- Add order history and analytics

## License

ISC
