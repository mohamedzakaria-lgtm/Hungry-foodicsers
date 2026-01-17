const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email (but different login method)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User exists with email but no Google ID - link accounts
          user.googleId = profile.id;
          user.profilePicture = profile.photos[0]?.value || null;
          if (!user.name && profile.displayName) {
            user.name = profile.displayName;
          }
          await user.save();
          return done(null, user);
        }

        // New user - need to get office from request or create default
        // For now, we'll require office selection in the frontend
        // This will be handled in the callback route
        const userData = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName || profile.emails[0].value.split('@')[0],
          profilePicture: profile.photos[0]?.value || null,
          // Office will be set in the callback route
        };

        return done(null, { ...userData, isNew: true });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for session (we're using JWT, so minimal)
passport.serializeUser((user, done) => {
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).populate('office');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
