import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import logger from "./logger.js";
import User from "../models/user.model.js";

export const configurePassport = () => {
  const googleClientId =
    process.env.GOOGLE_CLIENT_ID;

  const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET;

  const googleCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:5000/api/v1/auth/google/callback";

  console.log(
    "=================================================="
  );

  console.log(
    "🔐 GOOGLE OAUTH CONFIGURATION"
  );

  console.log(
    "Google Client ID:",
    googleClientId
      ? `${googleClientId.substring(0, 15)}...`
      : "MISSING"
  );

  console.log(
    "Google Client Secret:",
    googleClientSecret
      ? "SET"
      : "MISSING"
  );

  console.log(
    "Google Callback URL:",
    googleCallbackUrl
  );

  console.log(
    "=================================================="
  );

  if (
    googleClientId?.trim() &&
    googleClientSecret?.trim()
  ) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: googleCallbackUrl,

          passReqToCallback: true,
        },

        async (
          req,
          accessToken,
          refreshToken,
          profile,
          done
        ) => {
          try {
            console.log(
              "=================================================="
            );

            console.log(
              "🔵 GOOGLE CALLBACK REACHED"
            );

            console.log(
              "Google Profile ID:",
              profile?.id
            );

            console.log(
              "Google Display Name:",
              profile?.displayName
            );

            console.log(
              "Google Email:",
              profile?.emails?.[0]?.value
            );

            console.log(
              "=================================================="
            );

            const email =
              profile?.emails?.[0]?.value;

            // ------------------------------------------------
            // GOOGLE DID NOT RETURN EMAIL
            // ------------------------------------------------

            if (!email) {
              console.log(
                "❌ Google did not return an email address"
              );

              return done(
                new Error(
                  "Google account did not provide an email address"
                ),
                null
              );
            }

            const normalizedEmail =
              email.toLowerCase().trim();

            console.log(
              "🔎 Searching MongoDB for:",
              normalizedEmail
            );

            // ------------------------------------------------
            // FIND EXISTING USER
            // ------------------------------------------------

            const user =
              await User.findOne({
                email: normalizedEmail,
              });

            // ------------------------------------------------
            // USER NOT FOUND
            // ------------------------------------------------

            if (!user) {
              console.log(
                "❌ GOOGLE USER NOT FOUND IN DATABASE"
              );

              console.log(
                "Google email:",
                normalizedEmail
              );

              return done(
                null,
                false,
                {
                  message:
                    "User not registered",
                }
              );
            }

            // ------------------------------------------------
            // USER FOUND
            // ------------------------------------------------

            console.log(
              "✅ USER FOUND IN DATABASE"
            );

            console.log(
              "User ID:",
              user._id.toString()
            );

            console.log(
              "User email:",
              user.email
            );

            console.log(
              "User role:",
              user.role
            );

            console.log(
              "Existing Google ID:",
              user.googleId || "NONE"
            );

            // ------------------------------------------------
            // LINK GOOGLE ACCOUNT
            // ------------------------------------------------

            if (!user.googleId) {
              console.log(
                "🔗 Linking Google account to user..."
              );

              user.googleId = profile.id;
              user.isEmailVerified = true;

              await user.save();

              console.log(
                "✅ Google account linked successfully"
              );
            }

            console.log(
              "✅ GOOGLE AUTHENTICATION SUCCESS"
            );

            return done(
              null,
              user
            );
          } catch (error) {
            console.error(
              "❌ GOOGLE OAUTH CALLBACK ERROR:"
            );

            console.error(error);

            logger.error(
              "Google OAuth callback error: %s",
              error.message
            );

            return done(
              error,
              null
            );
          }
        }
      )
    );

    console.log(
      "✅ Google OAuth strategy registered successfully"
    );
  } else {
    console.log(
      "❌ Google OAuth strategy NOT registered"
    );

    logger.warn(
      "Google OAuth client ID/Secret not set. Google Strategy disabled."
    );
  }

  // ==========================================================
  // PASSPORT SERIALIZATION
  // ==========================================================

  passport.serializeUser(
    (user, done) => {
      done(
        null,
        user.id
      );
    }
  );

  passport.deserializeUser(
    async (id, done) => {
      try {
        const user =
          await User.findById(id);

        done(
          null,
          user
        );
      } catch (error) {
        done(
          error,
          null
        );
      }
    }
  );
};

export default passport;