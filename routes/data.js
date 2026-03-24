import express from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import Item from '../models/Item.js';

const router = express.Router();

// Allowed projection fields — only these can be requested by the client.
// Any field not in this list is silently ignored, preventing empty cards.
const ALLOWED_FIELDS = new Set(['title', 'description', 'category', 'author', 'createdAt']);

// ── READ: GET /data ──────────────────────────────────────────────────────────
// Supports case-insensitive category filter, title/description search,
// and whitelisted field projection.
router.get('/data', isAuthenticated, async (req, res, next) => {
  try {
    const filter = {};

    // Case-insensitive exact category match
    if (req.query.category && req.query.category.trim()) {
      filter.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    // Case-insensitive partial search across title and description
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = { $regex: new RegExp(req.query.search.trim(), 'i') };
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Projection: only include fields that are in the whitelist.
    // Unknown fields are ignored — this prevents empty cards.
    let projection = {};
    let invalidFields = [];
    if (req.query.fields && req.query.fields.trim()) {
      req.query.fields.split(',').forEach((f) => {
        const field = f.trim();
        if (ALLOWED_FIELDS.has(field)) {
          projection[field] = 1;
        } else if (field) {
          invalidFields.push(field);
        }
      });
      // If all entered fields were invalid, reset projection (return all fields)
      if (Object.keys(projection).length === 0) projection = {};
    }

    const items = await Item.find(filter, projection).sort({ createdAt: -1 });

    res.render('data', {
      items,
      query: req.query,
      invalidFields,                          // pass back so the view can warn the user
      allowedFields: [...ALLOWED_FIELDS],     // pass to view for the hint tooltip
    });
  } catch (error) {
    next(error);
  }
});

// ── READ: GET /data/:id ──────────────────────────────────────────────────────
router.get('/data/:id', isAuthenticated, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).render('error', { message: 'Item not found', status: 404, user: req.user || null });
    res.render('item', { item });
  } catch (error) {
    next(error);
  }
});

// ── CREATE: GET /items/new ───────────────────────────────────────────────────
router.get('/items/new', isAuthenticated, (req, res) => {
  res.render('items/new', { error: null });
});

// ── CREATE: GET /items/bulk ──────────────────────────────────────────────────
router.get('/items/bulk', isAuthenticated, (req, res) => {
  res.render('items/bulk', { error: null, result: null });
});

// ── CREATE: POST /items ──────────────────────────────────────────────────────
router.post('/items', isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, category, author } = req.body;
    await Item.create({ title, description, category, author });
    res.redirect('/data');
  } catch (error) {
    if (error.name === 'ValidationError') return res.render('items/new', { error: error.message });
    next(error);
  }
});

// ── CREATE: POST /items/bulk ─────────────────────────────────────────────────
router.post('/items/bulk', isAuthenticated, async (req, res, next) => {
  try {
    const docs = JSON.parse(req.body.json);
    if (!Array.isArray(docs)) throw new Error('Input must be a JSON array.');
    const result = await Item.insertMany(docs, { ordered: false });
    res.render('items/bulk', { error: null, result: `Successfully inserted ${result.length} documents.` });
  } catch (error) {
    res.render('items/bulk', { error: error.message, result: null });
  }
});

// ── UPDATE: POST /items/update-many ─────────────────────────────────────────
router.post('/items/update-many', isAuthenticated, async (req, res, next) => {
  try {
    const { category, newCategory } = req.body;
    await Item.updateMany(
      { category: { $regex: new RegExp(`^${category.trim()}$`, 'i') } },
      { $set: { category: newCategory.trim() } }
    );
    res.redirect('/data');
  } catch (error) {
    next(error);
  }
});

// ── DELETE: POST /items/delete-many ──────────────────────────────────────────
router.post('/items/delete-many', isAuthenticated, async (req, res, next) => {
  try {
    const { category } = req.body;
    await Item.deleteMany(
      { category: { $regex: new RegExp(`^${category.trim()}$`, 'i') } }
    );
    res.redirect('/data');
  } catch (error) {
    next(error);
  }
});

// ── UPDATE: GET /items/:id/edit ──────────────────────────────────────────────
router.get('/items/:id/edit', isAuthenticated, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).render('error', { message: 'Item not found', status: 404, user: req.user || null });
    res.render('items/edit', { item, error: null });
  } catch (error) {
    next(error);
  }
});

// ── UPDATE: POST /items/:id ──────────────────────────────────────────────────
router.post('/items/:id', isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, category, author } = req.body;
    await Item.updateOne({ _id: req.params.id }, { $set: { title, description, category, author } });
    res.redirect('/data');
  } catch (error) {
    next(error);
  }
});

// ── UPDATE: POST /items/:id/replace ─────────────────────────────────────────
router.post('/items/:id/replace', isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, category, author } = req.body;
    await Item.replaceOne({ _id: req.params.id }, { title, description, category, author });
    res.redirect('/data');
  } catch (error) {
    next(error);
  }
});

// ── DELETE: POST /items/:id/delete ───────────────────────────────────────────
router.post('/items/:id/delete', isAuthenticated, async (req, res, next) => {
  try {
    await Item.deleteOne({ _id: req.params.id });
    res.redirect('/data');
  } catch (error) {
    next(error);
  }
});

export default router;
