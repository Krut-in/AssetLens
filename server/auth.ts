import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { storage } from './storage';
import type { User } from '@shared/schema';

// Configure Google OAuth Strategy
console.log('Setting up Google OAuth with:', {
  clientID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback"
});

try {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
    
    if (user) {
      // Update user info (especially profile picture) if needed
      const updatedUser = await storage.updateUser(user.id, {
        name: profile.displayName || user.name,
        image: profile.photos?.[0]?.value || user.image,
        googleId: profile.id
      });
      return done(null, updatedUser);
    }
    
    // Create new user
    user = await storage.createUser({
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || '',
      image: profile.photos?.[0]?.value || null,
      googleId: profile.id
    });
    
    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));
  console.log('Google OAuth strategy configured successfully');
} catch (error) {
  console.error('Error setting up Google OAuth strategy:', error);
}

// Serialize user for session
passport.serializeUser((user: User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
