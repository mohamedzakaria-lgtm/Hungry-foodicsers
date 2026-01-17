const mongoose = require('mongoose');

const orderGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Order group name is required'],
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Office',
      required: [true, 'Office is required'],
    },
    restaurant: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    restaurantPhone: {
      type: String,
      trim: true,
    },
    // Schedule configuration
    schedule: {
      // Days of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      daysOfWeek: {
        type: [Number],
        required: true,
        validate: {
          validator: function (days) {
            return days.length > 0 && days.every(day => day >= 0 && day <= 6);
          },
          message: 'Days must be between 0 (Sunday) and 6 (Saturday)',
        },
      },
      // Start time in 24-hour format (e.g., "09:00" for 9 AM)
      startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)'],
      },
      // End time in 24-hour format (e.g., "10:00" for 10 AM)
      endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format (24-hour)'],
      },
      // Timezone (optional, defaults to server timezone)
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
    // Default notes for orders created from this group
    defaultNotes: {
      type: String,
      trim: true,
    },
    // Whether the group is active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Last time an order was created from this group
    lastOrderCreated: {
      type: Date,
      default: null,
    },
    // Cron job ID (for tracking/managing the scheduled job)
    cronJobId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to get day names
orderGroupSchema.virtual('dayNames').get(function () {
  const dayMap = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
  };
  return this.schedule.daysOfWeek.map(day => dayMap[day]);
});

// Index for faster queries
orderGroupSchema.index({ office: 1, isActive: 1 });
orderGroupSchema.index({ creator: 1 });

module.exports = mongoose.model('OrderGroup', orderGroupSchema);
