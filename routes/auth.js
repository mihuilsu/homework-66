import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// ── GET / — Home page ────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.render('index');
});

// ── GET /register — Registration form ────────────────────────────────────────
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/data');
  res.render('register', { error: null });
});

// ── POST /register — Create a new user account ───────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('register', { error: 'An account with this email already exists.' });
    }

    // Password is hashed by the pre-save hook in the User model
    const user = await User.create({ name, email, password });

    // Automatically log in the user after registration
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect('/data');
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.render('register', { error: 'Something went wrong. Please try again.' });
  }
});

// ── GET /login — Login form ──────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/data');
  res.render('login', { error: null });
});

// ── POST /login — Authenticate with Passport local strategy ──────────────────
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render('login', { error: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect('/data');
    });
  })(req, res, next);
});

// ── GET /logout — Destroy session ────────────────────────────────────────────
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

export default router;
