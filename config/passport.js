import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

/**
 * Configures Passport with a local username/password strategy.
 * Handles serialization and deserialization of the user to/from the session.
 * @param {import('passport').PassportStatic} passport
 */
export const configurePassport = (passport) => {
  // ── Local strategy: verify username + password ───────────────────────────
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: 'No account found with that email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // ── Store only user id in the session ───────────────────────────────────
  passport.serializeUser((user, done) => done(null, user.id));

  // ── Restore full user object from the session ────────────────────────────
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
