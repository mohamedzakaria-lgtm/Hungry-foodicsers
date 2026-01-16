# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Create .env File

Create a `.env` file in the root directory with the following content:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hungry-foodicsers

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Firebase Configuration
# Download your Firebase service account key JSON file and place it in the project root
# Then set the path here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## 3. Setup MongoDB

Make sure MongoDB is running. You can:
- Install MongoDB locally
- Use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`

## 4. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key"
6. Save the downloaded JSON file as `firebase-service-account.json` in the project root

## 5. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will be available at `http://localhost:3000`

## 6. Test the API

Use Postman, Thunder Client, or curl to test:

```bash
# Health check
curl http://localhost:3000/health

# Register a user (you'll need to create an office first)
curl -X POST http://localhost:3000/api/offices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Cairo Office",
    "location": "New Cairo",
    "city": "Cairo",
    "country": "Egypt"
  }'
```
