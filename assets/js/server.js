// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const Castle = require('./castle');
const Event = require('./event');
const User = require('./user');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autorización para admin
function isAdmin(req, res, next) {
  const token = req.headers.authorization;
  if (token === `Bearer ${process.env.SECRET_KEY}`) return next();
  return res.status(403).json({ message: 'No autorizado' });
}

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ===================== RUTAS API =====================

app.get('/castles', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Castle.find(filter);
  res.json(items);
});

app.get('/events', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Event.find(filter);
  res.json(items);
});

app.get('/reservations', isAdmin, async (req, res) => {
  const result = await Reservation.find().populate('itemId');
  res.json(result);
});

app.post('/reservations', async (req, res) => {
  try {
    const newRes = new Reservation(req.body);
    await newRes.save();
    res.status(201).json({ success: true, reservation: newRes });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Error al crear la reserva', details: err });
  }
});

app.get('/reservations/:id', isAdmin, async (req, res) => {
  const resv = await Reservation.findById(req.params.id);
  res.json(resv);
});

app.put('/reservations/:id', isAdmin, async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, updated });
});

app.patch('/reservations/:id/status', isAdmin, async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json({ success: true, updated });
});

app.delete('/reservations/:id', isAdmin, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar reserva' });
  }
});

// ===================== USUARIOS =====================

app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario', details: err });
  }
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/users/find', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuario', details: err });
  }
});

// ===================== AUTH (MONGO) =====================

app.post('/auth/register', async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Usuario ya registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el registro', details: err });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    res.json({ message: 'Login exitoso', user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login', details: err });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🟢 Servidor escuchando en http://localhost:${PORT}`));
