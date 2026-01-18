const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const User = require('../models/User');
const Office = require('../models/Office');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('office').optional().notEmpty().withMessage('Office ID must be valid if provided'),
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

      const { name, email, password, office } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Create user (office is optional)
      const user = await User.create({
        name,
        email,
        password,
        office: office || null, // Office is optional
      });

      await user.populate('office');

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            office: user.office,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
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

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password').populate('office');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials or inactive account',
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            office: user.office,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
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

// @route   PUT /api/auth/firebase-token
// @desc    Update user's Firebase token
// @access  Private
router.put(
  '/firebase-token',
  auth,
  [body('token').notEmpty().withMessage('Firebase token is required')],
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

      const { token } = req.body;

      req.user.firebaseToken = token;
      await req.user.save();

      res.json({
        success: true,
        message: 'Firebase token updated successfully',
      });
    } catch (error) {
      console.error('Update token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating Firebase token',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/auth/office
// @desc    Update user's office
// @access  Private
router.put(
  '/office',
  auth,
  [body('office').notEmpty().withMessage('Office ID is required')],
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

      const { office } = req.body;
      const Office = require('../models/Office');

      // Verify office exists
      const officeExists = await Office.findById(office);
      if (!officeExists) {
        return res.status(404).json({
          success: false,
          message: 'Office not found',
        });
      }

      req.user.office = office;
      await req.user.save();
      await req.user.populate('office');

      res.json({
        success: true,
        message: 'Office updated successfully',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error('Update office error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating office',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth login
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const profile = req.user;

      // If it's a new user, they need to select an office
      if (profile.isNew) {
        // Return user data and request office selection
        return res.redirect(
          `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/select-office?email=${encodeURIComponent(profile.email)}&name=${encodeURIComponent(profile.name)}&googleId=${profile.googleId}&profilePicture=${encodeURIComponent(profile.profilePicture || '')}`
        );
      }

      // Existing user - generate token and redirect
      const token = generateToken(profile._id);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`;
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(errorUrl);
    }
  }
);

// @route   POST /api/auth/google/mobile
// @desc    Authenticate with Google ID token (for mobile apps)
// @access  Public
router.post(
  '/google/mobile',
  [
    body('idToken').notEmpty().withMessage('Google ID token is required'),
    body('office').optional().notEmpty().withMessage('Office ID must be valid if provided'),
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

      const { idToken, office } = req.body;

      // Verify Google ID token
      // For now, we'll decode it (in production, verify with Google's API)
      // Note: In production, you should verify the token with Google's tokeninfo endpoint
      // or use google-auth-library npm package
      
      let googleUser;
      try {
        // Decode JWT token (basic verification - in production use proper verification)
        const jwt = require('jsonwebtoken');
        // Decode without verification for now (mobile apps should send verified token)
        googleUser = jwt.decode(idToken);
        
        if (!googleUser || !googleUser.sub || !googleUser.email) {
          throw new Error('Invalid Google ID token');
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google ID token',
          error: error.message,
        });
      }

      const googleId = googleUser.sub;
      const email = googleUser.email;
      const name = googleUser.name || googleUser.email.split('@')[0];
      const profilePicture = googleUser.picture || null;

      // Check if user already exists
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if user exists with email
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.profilePicture = profilePicture || user.profilePicture;
          if (!user.name) user.name = name;
          await user.save();
        } else {
          // Create new user (office is optional)
          user = await User.create({
            googleId,
            email,
            name,
            office: office || null, // Office is optional
            profilePicture: profilePicture || null,
          });
        }
      } else {
        // Update profile picture if changed
        if (profilePicture && user.profilePicture !== profilePicture) {
          user.profilePicture = profilePicture;
          await user.save();
        }
      }

      await user.populate('office');

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            office: user.office,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Google mobile auth error:', error);
      res.status(500).json({
        success: false,
        message: 'Error authenticating with Google',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/google/complete
// @desc    Complete Google OAuth registration (after office selection) - for web flow
// @access  Public
router.post(
  '/google/complete',
  [
    body('googleId').notEmpty().withMessage('Google ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('office').optional().notEmpty().withMessage('Office ID must be valid if provided'),
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

      const { googleId, email, name, office, profilePicture } = req.body;

      // Check if user already exists
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if user exists with email
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.googleId = googleId;
          user.profilePicture = profilePicture || user.profilePicture;
          if (!user.name) user.name = name;
          await user.save();
        } else {
          // Create new user (office is optional)
          user = await User.create({
            googleId,
            email,
            name,
            office: office || null, // Office is optional
            profilePicture: profilePicture || null,
          });
        }
      }

      await user.populate('office');

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            office: user.office,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Google OAuth complete error:', error);
      res.status(500).json({
        success: false,
        message: 'Error completing Google authentication',
        error: error.message,
      });
    }
  }
);

module.exports = router;
