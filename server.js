const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./db');
const { authRequired } = require('./auth');
const { computeEffectiveDiscount } = require('./pricing');

dotenv.config();
initDb();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function withPricing(product) {
  const pricing = computeEffectiveDiscount(product, nowMinutes());
  const price = Number(product.price);
  const discount = Math.min(Math.max(pricing.discountPercent, 0), 100);
  const finalPrice = Number((price * (1 - discount / 100)).toFixed(2));
  return {
    ...product,
    is_happy_hour_active: pricing.active,
    effective_discount_percent: discount,
    final_price: finalPrice
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, restaurantName } = req.body || {};
  if (!email || !password || !restaurantName) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'email_in_use' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const insert = db.prepare(
    'INSERT INTO users (email, password_hash, restaurant_name) VALUES (?, ?, ?)'
  );
  const info = insert.run(email, passwordHash, restaurantName);

  return res.status(201).json({ id: info.lastInsertRowid });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const user = db
    .prepare('SELECT id, password_hash, restaurant_name FROM users WHERE email = ?')
    .get(email);
  if (!user) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });

  return res.json({
    token,
    user: { id: user.id, restaurantName: user.restaurant_name }
  });
});

app.get('/api/restaurants', (req, res) => {
  const rows = db.prepare('SELECT id, restaurant_name FROM users ORDER BY restaurant_name').all();
  res.json(rows);
});

app.get('/api/restaurants/:restaurantId', (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  const restaurant = db
    .prepare('SELECT id, restaurant_name FROM users WHERE id = ?')
    .get(restaurantId);

  if (!restaurant) {
    return res.status(404).json({ error: 'restaurant_not_found' });
  }

  res.json(restaurant);
});

app.get('/api/restaurants/:restaurantId/categories', (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  const categories = db
    .prepare('SELECT id, name FROM categories WHERE user_id = ? ORDER BY name')
    .all(restaurantId);
  res.json(categories);
});

app.get('/api/restaurants/:restaurantId/products', (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  const { categoryId, featured, discounted, happyHour } = req.query;

  let query = 'SELECT * FROM products WHERE user_id = ?';
  const params = [restaurantId];

  if (categoryId) {
    query += ' AND category_id = ?';
    params.push(Number(categoryId));
  }

  if (featured === 'true') {
    query += ' AND is_featured = 1';
  }

  if (discounted === 'true') {
    query += ' AND discount_percent > 0';
  }

  if (happyHour === 'true') {
    query += ' AND happy_hour_enabled = 1';
  }

  query += ' ORDER BY name';

  const rows = db.prepare(query).all(...params).map(withPricing);
  res.json(rows);
});

app.get('/api/restaurants/:restaurantId/products/:productId', (req, res) => {
  const restaurantId = Number(req.params.restaurantId);
  const productId = Number(req.params.productId);
  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND user_id = ?')
    .get(productId, restaurantId);

  if (!product) {
    return res.status(404).json({ error: 'product_not_found' });
  }

  res.json(withPricing(product));
});

app.get('/api/me', authRequired, (req, res) => {
  const user = db
    .prepare('SELECT id, email, restaurant_name FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  res.json({ id: user.id, email: user.email, restaurantName: user.restaurant_name });
});

app.put('/api/me', authRequired, (req, res) => {
  const { email, restaurantName, password } = req.body || {};
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }

  if (email) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'email_in_use' });
    }
  }

  const updates = [];
  const params = [];

  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  if (restaurantName) {
    updates.push('restaurant_name = ?');
    params.push(restaurantName);
  }

  if (password) {
    updates.push('password_hash = ?');
    params.push(bcrypt.hashSync(password, 10));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'no_updates' });
  }

  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json({ status: 'updated' });
});

app.delete('/api/me', authRequired, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  res.status(204).end();
});

app.post('/api/categories', authRequired, (req, res) => {
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_name' });
  }

  const info = db
    .prepare('INSERT INTO categories (user_id, name) VALUES (?, ?)')
    .run(req.user.id, name);

  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/categories/:id', authRequired, (req, res) => {
  const categoryId = Number(req.params.id);
  const { name } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'missing_name' });
  }

  const info = db
    .prepare('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?')
    .run(name, categoryId, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'category_not_found' });
  }

  res.json({ status: 'updated' });
});

app.delete('/api/categories/:id', authRequired, (req, res) => {
  const categoryId = Number(req.params.id);
  const info = db
    .prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
    .run(categoryId, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'category_not_found' });
  }

  res.status(204).end();
});

app.post('/api/products', authRequired, (req, res) => {
  const {
    name,
    description,
    price,
    categoryId,
    isFeatured,
    discountPercent,
    happyHourEnabled,
    happyHourDiscountPercent,
    happyHourStart,
    happyHourEnd
  } = req.body || {};

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  const info = db
    .prepare(
      `INSERT INTO products (
        user_id,
        category_id,
        name,
        description,
        price,
        is_featured,
        discount_percent,
        happy_hour_enabled,
        happy_hour_discount_percent,
        happy_hour_start,
        happy_hour_end
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      categoryId || null,
      name,
      description || null,
      Number(price),
      isFeatured ? 1 : 0,
      Number(discountPercent || 0),
      happyHourEnabled ? 1 : 0,
      Number(happyHourDiscountPercent || 0),
      happyHourStart || '18:00',
      happyHourEnd || '20:00'
    );

  res.status(201).json({ id: info.lastInsertRowid });
});

app.put('/api/products/:id', authRequired, (req, res) => {
  const productId = Number(req.params.id);
  const {
    name,
    description,
    price,
    categoryId,
    isFeatured,
    discountPercent,
    happyHourEnabled,
    happyHourDiscountPercent,
    happyHourStart,
    happyHourEnd
  } = req.body || {};

  const info = db
    .prepare(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category_id = COALESCE(?, category_id),
        is_featured = COALESCE(?, is_featured),
        discount_percent = COALESCE(?, discount_percent),
        happy_hour_enabled = COALESCE(?, happy_hour_enabled),
        happy_hour_discount_percent = COALESCE(?, happy_hour_discount_percent),
        happy_hour_start = COALESCE(?, happy_hour_start),
        happy_hour_end = COALESCE(?, happy_hour_end)
      WHERE id = ? AND user_id = ?`
    )
    .run(
      name ?? null,
      description ?? null,
      price ?? null,
      categoryId ?? null,
      isFeatured === undefined ? null : isFeatured ? 1 : 0,
      discountPercent ?? null,
      happyHourEnabled === undefined ? null : happyHourEnabled ? 1 : 0,
      happyHourDiscountPercent ?? null,
      happyHourStart ?? null,
      happyHourEnd ?? null,
      productId,
      req.user.id
    );

  if (info.changes === 0) {
    return res.status(404).json({ error: 'product_not_found' });
  }

  res.json({ status: 'updated' });
});

app.delete('/api/products/:id', authRequired, (req, res) => {
  const productId = Number(req.params.id);
  const info = db
    .prepare('DELETE FROM products WHERE id = ? AND user_id = ?')
    .run(productId, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'product_not_found' });
  }

  res.status(204).end();
});

app.patch('/api/products/:id/discount', authRequired, (req, res) => {
  const productId = Number(req.params.id);
  const { discountPercent } = req.body || {};
  if (discountPercent === undefined) {
    return res.status(400).json({ error: 'missing_discount' });
  }

  const info = db
    .prepare('UPDATE products SET discount_percent = ? WHERE id = ? AND user_id = ?')
    .run(Number(discountPercent), productId, req.user.id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'product_not_found' });
  }

  res.json({ status: 'updated' });
});

app.patch('/api/products/:id/happy-hour', authRequired, (req, res) => {
  const productId = Number(req.params.id);
  const { enabled, discountPercent, start, end } = req.body || {};

  const updates = [];
  const params = [];

  if (enabled !== undefined) {
    updates.push('happy_hour_enabled = ?');
    params.push(enabled ? 1 : 0);
  }

  if (discountPercent !== undefined) {
    updates.push('happy_hour_discount_percent = ?');
    params.push(Number(discountPercent));
  }

  if (start) {
    updates.push('happy_hour_start = ?');
    params.push(start);
  }

  if (end) {
    updates.push('happy_hour_end = ?');
    params.push(end);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'no_updates' });
  }

  params.push(productId, req.user.id);
  const info = db
    .prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
    .run(...params);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'product_not_found' });
  }

  res.json({ status: 'updated' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

