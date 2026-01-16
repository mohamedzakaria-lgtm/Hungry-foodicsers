const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    let serviceAccount;

    // Option 1: Use environment variable (for deployment - base64 encoded JSON)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
        console.log('✅ Using Firebase credentials from environment variable');
      } catch (e) {
        // If not base64, try parsing as JSON string directly
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Using Firebase credentials from environment variable (JSON)');
      }
    }
    // Option 2: Use file path (for local development)
    else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
      const absolutePath = path.resolve(serviceAccountPath);

      if (!fs.existsSync(absolutePath)) {
        console.warn('⚠️  Firebase service account file not found. Notifications will be disabled.');
        console.warn(`   Expected path: ${absolutePath}`);
        return;
      }

      serviceAccount = require(absolutePath);
      console.log('✅ Using Firebase credentials from file');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.warn('⚠️  Notifications will be disabled');
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Send notification to a single user
 */
const sendNotificationToUser = async (userToken, title, body, data = {}) => {
  if (!firebaseInitialized || !userToken) {
    console.log('⚠️  Notification skipped: Firebase not initialized or no token');
    return { success: false, message: 'Firebase not initialized or no token' };
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      token: userToken,
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    
    // Handle invalid token
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      return { success: false, message: 'Invalid or unregistered token', code: error.code };
    }
    
    return { success: false, message: error.message };
  }
};

/**
 * Send notification to multiple users
 */
const sendNotificationToUsers = async (userTokens, title, body, data = {}) => {
  if (!firebaseInitialized || !userTokens || userTokens.length === 0) {
    console.log('⚠️  Notification skipped: Firebase not initialized or no tokens');
    return { success: false, message: 'Firebase not initialized or no tokens' };
  }

  // Filter out null/undefined tokens
  const validTokens = userTokens.filter(token => token);

  if (validTokens.length === 0) {
    return { success: false, message: 'No valid tokens provided' };
  }

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      tokens: validTokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`✅ Notifications sent: ${response.successCount}/${validTokens.length}`);
    
    if (response.failureCount > 0) {
      console.warn(`⚠️  ${response.failureCount} notifications failed`);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('❌ Error sending multicast notification:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Notify office members about a new order
 */
const notifyNewOrder = async (officeUsers, order) => {
  const tokens = officeUsers
    .filter(user => user.firebaseToken && user._id.toString() !== order.creator.toString())
    .map(user => user.firebaseToken);

  if (tokens.length === 0) {
    return { success: false, message: 'No valid tokens found' };
  }

  return await sendNotificationToUsers(
    tokens,
    'New Order Created! 🍕',
    `${order.creator.name} created an order from ${order.restaurant}. Join now!`,
    {
      type: 'new_order',
      orderId: order._id.toString(),
      restaurant: order.restaurant,
    }
  );
};

/**
 * Notify user about item price update
 */
const notifyItemPriceUpdate = async (userToken, orderItem, order) => {
  return await sendNotificationToUser(
    userToken,
    'Item Price Updated 💰',
    `Your ${orderItem.name} from ${order.restaurant} costs ${orderItem.price} EGP`,
    {
      type: 'item_price_updated',
      orderId: order._id.toString(),
      itemId: orderItem._id.toString(),
      price: orderItem.price.toString(),
    }
  );
};

/**
 * Notify users about order delivery
 */
const notifyOrderDelivered = async (userTokens, order) => {
  return await sendNotificationToUsers(
    userTokens,
    'Order Delivered! 🎉',
    `Your order from ${order.restaurant} has been delivered!`,
    {
      type: 'order_delivered',
      orderId: order._id.toString(),
      restaurant: order.restaurant,
    }
  );
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToUsers,
  notifyNewOrder,
  notifyItemPriceUpdate,
  notifyOrderDelivered,
  initializeFirebase,
};
