const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // Split the display name into first and last name
      let firstName = profile.displayName;
      let lastName = '';
      
      // If we can split the name, do so
      if (profile.displayName.includes(' ')) {
        const nameParts = profile.displayName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      // Create new user
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: {
          firstName: firstName,
          lastName: lastName
        },
        profilePicture: profile.photos[0].value,
        isEmailVerified: true // Google OAuth users are automatically verified
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
})); 