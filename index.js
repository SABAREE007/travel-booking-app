// index.js
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/travelDB')
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Load products
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/products.json')));

// Schema
const bookingSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  email: String,
  date: String,
  seats: Number,
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// API routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { productId, name, email, date, seats } = req.body;
    if (!productId || !name || !email || !date || !seats) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const booking = await Booking.create({ productId, name, email, date, seats });
    res.json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
