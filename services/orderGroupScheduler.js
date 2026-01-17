const cron = require('node-cron');
const Order = require('../models/Order');
const OrderGroup = require('../models/OrderGroup');
const User = require('../models/User');
const { notifyNewOrder } = require('./notificationService');

// Store active cron jobs
const activeJobs = new Map();

/**
 * Convert time string (HH:MM) to cron format
 * Returns { hour, minute }
 */
const parseTime = (timeString) => {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
};

/**
 * Convert days of week array to cron day format
 * node-cron: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 * Our model: 0 = Sunday, 1 = Monday, ..., 6 = Saturday (same!)
 */
const daysToCron = (days) => {
  return days.join(',');
};

/**
 * Create cron expression for order group
 */
const createCronExpression = (orderGroup) => {
  const { startTime, daysOfWeek } = orderGroup.schedule;
  const { minute, hour } = parseTime(startTime);
  const days = daysToCron(daysOfWeek);

  // Format: minute hour day-of-month month day-of-week
  // We want to run at startTime on specified days
  return `${minute} ${hour} * * ${days}`;
};

/**
 * Create an order from an order group
 */
const createOrderFromGroup = async (orderGroup) => {
  try {
    // Check if order already created today for this group
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (orderGroup.lastOrderCreated) {
      const lastCreated = new Date(orderGroup.lastOrderCreated);
      lastCreated.setHours(0, 0, 0, 0);

      // If order was already created today, skip
      if (lastCreated.getTime() === today.getTime()) {
        console.log(`⏭️  Order already created today for group: ${orderGroup.name}`);
        return;
      }
    }

    // Get the creator user
    const creator = await User.findById(orderGroup.creator);
    if (!creator || !creator.isActive) {
      console.error(`❌ Creator not found or inactive for group: ${orderGroup.name}`);
      return;
    }

    // Create the order
    const order = await Order.create({
      creator: orderGroup.creator,
      office: orderGroup.office,
      restaurant: orderGroup.restaurant,
      restaurantPhone: orderGroup.restaurantPhone,
      notes: orderGroup.defaultNotes || `Auto-created from ${orderGroup.name} group`,
      orderGroup: orderGroup._id,
      status: 'open',
    });

    // Update last order created timestamp
    orderGroup.lastOrderCreated = new Date();
    await orderGroup.save();

    // Notify office members
    const officeUsers = await User.find({
      office: orderGroup.office,
      isActive: true,
    }).select('firebaseToken');

    await notifyNewOrder(officeUsers, order);

    console.log(`✅ Order created from group: ${orderGroup.name} (Order ID: ${order._id})`);
    return order;
  } catch (error) {
    console.error(`❌ Error creating order from group ${orderGroup.name}:`, error);
  }
};

/**
 * Schedule an order group
 */
const scheduleOrderGroup = (orderGroup) => {
  // Remove existing job if any
  if (activeJobs.has(orderGroup._id.toString())) {
    const existingJob = activeJobs.get(orderGroup._id.toString());
    existingJob.stop();
    activeJobs.delete(orderGroup._id.toString());
  }

  if (!orderGroup.isActive) {
    console.log(`⏸️  Group ${orderGroup.name} is inactive, not scheduling`);
    return;
  }

  const cronExpression = createCronExpression(orderGroup);
  console.log(`📅 Scheduling group "${orderGroup.name}" with cron: ${cronExpression}`);

  const job = cron.schedule(
    cronExpression,
    async () => {
      console.log(`⏰ Triggered scheduled order for group: ${orderGroup.name}`);
      
      // Check if current time is within the allowed time window
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const { hour: startHour, minute: startMinute } = parseTime(orderGroup.schedule.startTime);
      const { hour: endHour, minute: endMinute } = parseTime(orderGroup.schedule.endTime);

      const currentTimeMinutes = currentHour * 60 + currentMinute;
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Only create order if within time window
      if (currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes) {
        // Refresh order group from database
        const freshGroup = await OrderGroup.findById(orderGroup._id);
        if (freshGroup && freshGroup.isActive) {
          await createOrderFromGroup(freshGroup);
        }
      } else {
        console.log(`⏭️  Current time outside window for group: ${orderGroup.name}`);
      }
    },
    {
      scheduled: true,
      timezone: orderGroup.schedule.timezone || 'UTC',
    }
  );

  // Store job reference
  activeJobs.set(orderGroup._id.toString(), job);
  orderGroup.cronJobId = orderGroup._id.toString();
  orderGroup.save().catch(console.error);

  console.log(`✅ Scheduled order group: ${orderGroup.name}`);
};

/**
 * Unschedule an order group
 */
const unscheduleOrderGroup = (orderGroupId) => {
  const jobId = orderGroupId.toString();
  if (activeJobs.has(jobId)) {
    const job = activeJobs.get(jobId);
    job.stop();
    activeJobs.delete(jobId);
    console.log(`🛑 Unscheduled order group: ${jobId}`);
  }
};

/**
 * Initialize all active order groups on server start
 */
const initializeScheduledGroups = async () => {
  try {
    const activeGroups = await OrderGroup.find({ isActive: true });
    console.log(`🔄 Initializing ${activeGroups.length} active order groups...`);

    for (const group of activeGroups) {
      scheduleOrderGroup(group);
    }

    console.log(`✅ Initialized ${activeGroups.length} order groups`);
  } catch (error) {
    console.error('❌ Error initializing scheduled groups:', error);
  }
};

module.exports = {
  scheduleOrderGroup,
  unscheduleOrderGroup,
  initializeScheduledGroups,
  createOrderFromGroup,
};
