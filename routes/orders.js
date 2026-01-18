const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  notifyNewOrder,
  notifyItemPriceUpdate,
  notifyOrderDelivered,
} = require('../services/notificationService');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post(
  '/',
  auth,
  [
    body('restaurant').trim().notEmpty().withMessage('Restaurant name is required'),
    body('restaurantPhone').optional().trim(),
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

      const { restaurant, restaurantPhone, notes } = req.body;

      // Check if user has an office
      if (!req.user.office || !req.user.office._id) {
        return res.status(400).json({
          success: false,
          message: 'You must select an office before creating orders. Please update your profile.',
        });
      }

      // Create order
      const order = await Order.create({
        creator: req.user._id,
        office: req.user.office._id,
        restaurant,
        restaurantPhone,
        notes,
      });

      await order.populate('creator', 'name email');

      // Notify all users in the office (except creator)
      const officeUsers = await User.find({
        office: req.user.office._id,
        isActive: true,
      }).select('firebaseToken');

      await notifyNewOrder(officeUsers, order);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating order',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/orders
// @desc    Get all orders for user's office (or user's orders if ?my=true)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, my } = req.query;

    // If ?my=true, get only orders where user has items (works even without office)
    if (my === 'true') {
      // Find all order items for this user
      const userItems = await OrderItem.find({ user: req.user._id }).select('order');
      const orderIds = [...new Set(userItems.map(item => item.order.toString()))];
      
      if (orderIds.length === 0) {
        return res.json({
          success: true,
          data: {
            orders: [],
          },
        });
      }

      let query = { _id: { $in: orderIds } };
      if (status) {
        query.status = status;
      }

      const orders = await Order.find(query)
        .populate('creator', 'name email')
        .populate({
          path: 'items',
          populate: {
            path: 'user',
            select: 'name email',
          },
        })
        .sort({ createdAt: -1 });

      // Filter items to show only user's items
      orders.forEach(order => {
        order.items = order.items.filter(item => 
          item.user && item.user._id.toString() === req.user._id.toString()
        );
      });

      return res.json({
        success: true,
        data: {
          orders,
        },
      });
    }

    // For office orders, check if user has an office
    if (!req.user.office || !req.user.office._id) {
      return res.json({
        success: true,
        data: {
          orders: [],
          message: 'Please select an office to view orders',
        },
      });
    }

    let query = { office: req.user.office._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('creator', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    // If my=true, filter items to show only user's items
    if (my === 'true') {
      orders.forEach(order => {
        order.items = order.items.filter(item => 
          item.user && item.user._id.toString() === req.user._id.toString()
        );
      });
    }

    res.json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

// @route   GET /api/orders/my
// @desc    Get orders where current user has items (alias for ?my=true)
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const { status } = req.query;

    // Find all order items for this user
    const userItems = await OrderItem.find({ user: req.user._id }).select('order');
    const orderIds = [...new Set(userItems.map(item => item.order.toString()))];

    if (orderIds.length === 0) {
      return res.json({
        success: true,
        data: {
          orders: [],
        },
      });
    }

    let query = {
      _id: { $in: orderIds },
    };

    // If user has an office, filter by office for security
    if (req.user.office && req.user.office._id) {
      query.office = req.user.office._id;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('creator', 'name email')
      .populate({
        path: 'items',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    // Filter items to show only user's items
    orders.forEach(order => {
      order.items = order.items.filter(item => 
        item.user && item.user._id.toString() === req.user._id.toString()
      );
    });

    res.json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user orders',
      error: error.message,
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('office')
      .populate({
        path: 'items',
        populate: {
          path: 'user',
          select: 'name email',
        },
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Allow users without office to view orders (they can select office later)
    // If user has an office, verify they're in the same office
    if (req.user.office && req.user.office._id) {
      if (order.office._id.toString() !== req.user.office._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not in the same office',
        });
      }
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
});

// @route   POST /api/orders/:id/items
// @desc    Add item to order
// @access  Private
router.post(
  '/:id/items',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('notes').optional().trim(),
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

      const order = await Order.findById(req.params.id).populate('office');

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Allow users without office to add items (they can select office later)
      // If user has an office, verify they're in the same office
      if (req.user.office && req.user.office._id) {
        if (order.office._id.toString() !== req.user.office._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not in the same office',
          });
        }
      }
      // If user doesn't have an office, allow them to add items
      // They can update their office later to match the order's office

      // Check if order is still open
      if (order.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: 'Cannot add items to a closed order',
        });
      }

      const { name, quantity = 1, notes } = req.body;

      // Create order item
      const orderItem = await OrderItem.create({
        order: order._id,
        user: req.user._id,
        name,
        quantity,
        notes,
      });

      // Add item to order
      order.items.push(orderItem._id);
      await order.save();

      await orderItem.populate('user', 'name email');

      res.status(201).json({
        success: true,
        message: 'Item added to order successfully',
        data: {
          item: orderItem,
        },
      });
    } catch (error) {
      console.error('Add item error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding item to order',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/orders/:id/items/:itemId/price
// @desc    Update item price (only order creator)
// @access  Private
router.put(
  '/:id/items/:itemId/price',
  auth,
  [body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')],
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

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if user is the order creator
      if (order.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the order creator can update item prices',
        });
      }

      const orderItem = await OrderItem.findById(req.params.itemId);

      if (!orderItem || orderItem.order.toString() !== order._id.toString()) {
        return res.status(404).json({
          success: false,
          message: 'Order item not found',
        });
      }

      const { price } = req.body;

      // Update item price
      orderItem.price = price;
      await orderItem.save();

      // Recalculate order total
      await order.save();

      // Get user to send notification
      const itemUser = await User.findById(orderItem.user);

      if (itemUser && itemUser.firebaseToken) {
        await notifyItemPriceUpdate(itemUser.firebaseToken, orderItem, order);
      }

      await orderItem.populate('user', 'name email');

      res.json({
        success: true,
        message: 'Item price updated successfully',
        data: {
          item: orderItem,
        },
      });
    } catch (error) {
      console.error('Update item price error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating item price',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (only order creator)
// @access  Private
router.put(
  '/:id/status',
  auth,
  [body('status').isIn(['open', 'ordered', 'delivered', 'cancelled']).withMessage('Invalid status')],
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

      const order = await Order.findById(req.params.id).populate({
        path: 'items',
        populate: {
          path: 'user',
          select: 'firebaseToken',
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check if user is the order creator
      if (order.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the order creator can update order status',
        });
      }

      const { status } = req.body;
      const oldStatus = order.status;

      order.status = status;

      // Set timestamps based on status
      if (status === 'ordered' && !order.orderedAt) {
        order.orderedAt = new Date();
      } else if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();

        // Notify all users who have items in this order
        const userTokens = order.items
          .map(item => item.user?.firebaseToken)
          .filter(token => token);

        if (userTokens.length > 0) {
          await notifyOrderDelivered(userTokens, order);
        }
      }

      await order.save();

      await order.populate('creator', 'name email');

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: {
          order,
        },
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating order status',
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/orders/:id/items/:itemId
// @desc    Remove item from order
// @access  Private
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order is still open
    if (order.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove items from a closed order',
      });
    }

    const orderItem = await OrderItem.findById(req.params.itemId);

    if (!orderItem || orderItem.order.toString() !== order._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found',
      });
    }

    // Check if user owns the item or is the order creator
    if (
      orderItem.user.toString() !== req.user._id.toString() &&
      order.creator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own items',
      });
    }

    // Remove item from order
    order.items = order.items.filter(
      itemId => itemId.toString() !== orderItem._id.toString()
    );
    await order.save();

    // Delete order item
    await OrderItem.findByIdAndDelete(orderItem._id);

    res.json({
      success: true,
      message: 'Item removed from order successfully',
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from order',
      error: error.message,
    });
  }
});

module.exports = router;
