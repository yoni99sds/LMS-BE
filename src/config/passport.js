import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import logger from "./logger.js";
import User from "../models/user.model.js";

export const configurePassport = () => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (googleClientId?.trim() && googleClientSecret?.trim()) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            "http://localhost:5000/api/v1/auth/google/callback",
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
           const email = profile.emails?.[0]?.value;

if (!email) {
  return done(new Error("No email found"), null);
}

// ONLY SEARCH BY EMAIL
const user = await User.findOne({
  email: email.toLowerCase(),
});

if (!user) {
  return done(null, false, {
    message: "User not registered",
  });
}

// Save Google ID only once
if (!user.googleId) {
  user.googleId = profile.id;
  user.isEmailVerified = true;

  await user.save();
}

return done(null, user);
          } catch (error) {
            logger.error(
              "Google OAuth callback error: %s",
              error.message
            );

            return done(error, null);
          }
        }
      )
    );
  } else {
    logger.warn(
      "Google OAuth client ID/Secret not set. Google Strategy disabled."
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default passport;