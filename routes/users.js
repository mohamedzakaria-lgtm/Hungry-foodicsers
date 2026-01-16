const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/office/:officeId
// @desc    Get all users in an office
// @access  Private
router.get('/office/:officeId', auth, async (req, res) => {
  try {
    const { officeId } = req.params;

    const users = await User.find({
      office: officeId,
      isActive: true,
    })
      .select('-password')
      .populate('office')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Get office users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching office users',
      error: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('office');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

module.exports = router;
