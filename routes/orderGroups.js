const express = require('express');
const { body, validationResult } = require('express-validator');
const OrderGroup = require('../models/OrderGroup');
const auth = require('../middleware/auth');
const { scheduleOrderGroup, unscheduleOrderGroup } = require('../services/orderGroupScheduler');

const router = express.Router();

// @route   POST /api/order-groups
// @desc    Create a new recurring order group
// @access  Private
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Order group name is required'),
    body('restaurant').trim().notEmpty().withMessage('Restaurant name is required'),
    body('schedule.daysOfWeek')
      .isArray({ min: 1 })
      .withMessage('At least one day of week is required')
      .custom((days) => {
        return days.every((day) => day >= 0 && day <= 6);
      })
      .withMessage('Days must be between 0 (Sunday) and 6 (Saturday)'),
    body('schedule.startTime')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format (24-hour)'),
    body('schedule.endTime')
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format (24-hour)'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, restaurant, restaurantPhone, schedule, defaultNotes } = req.body;

      // Validate time range
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time',
        });
      }

      // Create order group
      const orderGroup = await OrderGroup.create({
        name,
        creator: req.user._id,
        office: req.user.office._id,
        restaurant,
        restaurantPhone,
        schedule,
        defaultNotes,
        isActive: true,
      });

      // Schedule the group
      scheduleOrderGroup(orderGroup);

      await orderGroup.populate('creator', 'name email');
      await orderGroup.populate('office');

      res.status(201).json({
        success: true,
        message: 'Order group created and scheduled successfully',
        data: {
          orderGroup,
        },
      });
    } catch (error) {
      console.error('Create order group error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order group',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/order-groups
// @desc    Get all order groups for user's office
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { active } = req.query;

    const query = { office: req.user.office._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const orderGroups = await OrderGroup.find(query)
      .populate('creator', 'name email')
      .populate('office')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        orderGroups,
      },
    });
  } catch (error) {
    console.error('Get order groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order groups',
      error: error.message,
    });
  }
});

// @route   GET /api/order-groups/my
// @desc    Get order groups created by current user
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { active } = req.query;

    const query = { creator: req.user._id };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const orderGroups = await OrderGroup.find(query)
      .populate('creator', 'name email')
      .populate('office')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        orderGroups,
      },
    });
  } catch (error) {
    console.error('Get my order groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user order groups',
      error: error.message,
    });
  }
});

// @route   GET /api/order-groups/:id
// @desc    Get order group by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const orderGroup = await OrderGroup.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('office');

    if (!orderGroup) {
      return res.status(404).json({
        success: false,
        message: 'Order group not found',
      });
    }

    // Check if user is in the same office
    if (orderGroup.office._id.toString() !== req.user.office._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not in the same office',
      });
    }

    res.json({
      success: true,
      data: {
        orderGroup,
      },
    });
  } catch (error) {
    console.error('Get order group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order group',
      error: error.message,
    });
  }
});

// @route   PUT /api/order-groups/:id
// @desc    Update order group
// @access  Private
router.put(
  '/:id',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('restaurant').optional().trim().notEmpty(),
    body('schedule.daysOfWeek')
      .optional()
      .isArray({ min: 1 })
      .custom((days) => {
        return days.every((day) => day >= 0 && day <= 6);
      }),
    body('schedule.startTime')
      .optional()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
    body('schedule.endTime')
      .optional()
      .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const orderGroup = await OrderGroup.findById(req.params.id);

      if (!orderGroup) {
        return res.status(404).json({
          success: false,
          message: 'Order group not found',
        });
      }

      // Check if user is the creator
      if (orderGroup.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the creator can update this order group',
        });
      }

      // Update fields
      const { name, restaurant, restaurantPhone, schedule, defaultNotes, isActive } = req.body;

      if (name) orderGroup.name = name;
      if (restaurant) orderGroup.restaurant = restaurant;
      if (restaurantPhone !== undefined) orderGroup.restaurantPhone = restaurantPhone;
      if (defaultNotes !== undefined) orderGroup.defaultNotes = defaultNotes;
      if (schedule) {
        // Validate time range if schedule is being updated
        if (schedule.startTime && schedule.endTime) {
          const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;

          if (endMinutes <= startMinutes) {
            return res.status(400).json({
              success: false,
              message: 'End time must be after start time',
            });
          }
        }
        orderGroup.schedule = { ...orderGroup.schedule, ...schedule };
      }
      if (isActive !== undefined) {
        orderGroup.isActive = isActive;
      }

      await orderGroup.save();

      // Reschedule if active
      if (orderGroup.isActive) {
        scheduleOrderGroup(orderGroup);
      } else {
        unscheduleOrderGroup(orderGroup._id);
      }

      await orderGroup.populate('creator', 'name email');
      await orderGroup.populate('office');

      res.json({
        success: true,
        message: 'Order group updated successfully',
        data: {
          orderGroup,
        },
      });
    } catch (error) {
      console.error('Update order group error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order group',
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/order-groups/:id
// @desc    Delete order group
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const orderGroup = await OrderGroup.findById(req.params.id);

    if (!orderGroup) {
      return res.status(404).json({
        success: false,
        message: 'Order group not found',
      });
    }

    // Check if user is the creator
    if (orderGroup.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can delete this order group',
      });
    }

    // Unschedule the group
    unscheduleOrderGroup(orderGroup._id);

    // Delete the group
    await OrderGroup.findByIdAndDelete(orderGroup._id);

    res.json({
      success: true,
      message: 'Order group deleted successfully',
    });
  } catch (error) {
    console.error('Delete order group error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order group',
      error: error.message,
    });
  }
});

module.exports = router;
