import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import methodOverride from 'method-override';
import { connectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database ────────────────────────────────────────────────────────────────
await connectDB();

// ── View engine ─────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', './views');

// ── Static files ────────────────────────────────────────────────────────────
app.use(express.static('public'));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ── Method override — allows forms to send PATCH, PUT, DELETE ────────────────
// HTML forms only support GET/POST, so we use ?_method=PATCH in the action URL
app.use(methodOverride('_method'));

// ── Session (stored in MongoDB Atlas) ───────────────────────────────────────
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// ── Passport ─────────────────────────────────────────────────────────────────
configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// ── Make user available in all views ─────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/', authRoutes);
app.use('/', dataRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found', status: 404, user: req.user || null });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal Server Error', status: 500, user: req.user || null });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
