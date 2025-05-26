// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // 🔐 para contraseñas
require('dotenv').config();

const Castle = require('./castle');
const Event = require('./event');
const Reservation = require('./reservation');
const User = require('./user');
const { encrypt } = require('./utils/encryption');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://smartinm67:6h24I0D5K38w8hBY@cluster0.6wzykog.mongodb.net/yupifiestas?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ===================== RUTAS API =====================

// ✅ Castillos
app.get('/castles', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Castle.find(filter);
  res.json(items);
});

// ✅ Eventos
app.get('/events', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Event.find(filter);
  res.json(items);
});

// ✅ Todas las reservas
app.get('/reservations', async (req, res) => {
  const result = await Reservation.find().populate('itemId');
  res.json(result);
});

// ✅ Crear reserva
app.post('/reservations', async (req, res) => {
  try {
    const newRes = new Reservation(req.body);
    await newRes.save();
    res.status(201).json(newRes);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la reserva', details: err });
  }
});

// ✅ Obtener una reserva por ID
app.get('/reservations/:id', async (req, res) => {
  const resv = await Reservation.findById(req.params.id);
  res.json(resv);
});

// ✅ Editar reserva
app.put('/reservations/:id', async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// ✅ Cambiar estado de reserva
app.patch('/reservations/:id/status', async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
});

// ===================== USUARIOS =====================

// ✅ Crear usuario (email cifrado)
app.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear usuario', details: err });
  }
});

// ✅ Obtener todos los usuarios
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ✅ Buscar usuario por email (cifrado)
app.post('/users/find', async (req, res) => {
  const { email } = req.body;
  try {
    const encryptedEmail = encrypt(email);
    const user = await User.findOne({ email: encryptedEmail });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuario', details: err });
  }
});

// ===================== AUTH (MONGO) =====================

// REGISTRO
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

// LOGIN
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

// Puerto
const PORT = 5000;
app.listen(PORT, () => console.log(`🟢 Servidor escuchando en http://localhost:${PORT}`));
