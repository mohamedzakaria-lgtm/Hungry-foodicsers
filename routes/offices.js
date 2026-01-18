const express = require('express');
const Office = require('../models/Office');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/offices
// @desc    Get all offices
// @access  Public
router.get('/', async (req, res) => {
  try {
    const offices = await Office.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: {
        offices,
      },
    });
  } catch (error) {
    console.error('Get offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offices',
      error: error.message,
    });
  }
});

// @route   GET /api/offices/:id
// @desc    Get office by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);

    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found',
      });
    }

    res.json({
      success: true,
      data: {
        office,
      },
    });
  } catch (error) {
    console.error('Get office error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching office',
      error: error.message,
    });
  }
});

// @route   POST /api/offices
// @desc    Create a new office (Admin only - you can add admin check later)
// @access  Private
router.post(
  '/',
  auth,
  async (req, res) => {
    try {
      const { name, location, city, country } = req.body;

      const office = await Office.create({
        name,
        location,
        city,
        country,
      });

      res.status(201).json({
        success: true,
        message: 'Office created successfully',
        data: {
          office,
        },
      });
    } catch (error) {
      console.error('Create office error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating office',
        error: error.message,
      });
    }
  }
);

module.exports = router;
