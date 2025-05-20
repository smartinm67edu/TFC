// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Castle = require('./js/castle');
const Event = require('./js/event');
const Reservation = require('./js/reservation');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión MongoDB local
mongoose.connect('mongodb://localhost:27017/yupifiestas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// ===================== RUTAS API =====================

// Castillos
app.get('/castles', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Castle.find(filter);
  res.json(items);
});

// Eventos
app.get('/events', async (req, res) => {
  const filter = req.query.available === 'true' ? { available: true } : {};
  const items = await Event.find(filter);
  res.json(items);
});

// Todas las reservas
app.get('/reservations', async (req, res) => {
  const result = await Reservation.find().populate('itemId');
  res.json(result);
});

// Crear reserva
app.post('/reservations', async (req, res) => {
  try {
    const newRes = new Reservation(req.body);
    await newRes.save();
    res.status(201).json(newRes);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la reserva', details: err });
  }
});

// Obtener una reserva por ID
app.get('/reservations/:id', async (req, res) => {
  const resv = await Reservation.findById(req.params.id);
  res.json(resv);
});

// Editar reserva
app.put('/reservations/:id', async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Cambiar estado de reserva
app.patch('/reservations/:id/status', async (req, res) => {
  const updated = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
});

// Puerto
const PORT = 5000;
app.listen(PORT, () => console.log(`🟢 Servidor escuchando en http://localhost:${PORT}`));
