const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['castle', 'event'], required: true },
  client: {
    name: String,
    phone: String
  },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  notes: String
}, { timestamps: true });

// Middleware: marcar item como no disponible si se crea reserva confirmada
reservationSchema.post('save', async function (doc) {
  if (doc.status === 'confirmed') {
    const Model = doc.itemType === 'castle' ? require('./castle') : require('./event');
    await Model.findByIdAndUpdate(doc.itemId, { available: false });
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
// reservationRoutes.js
const express = require('express');
const router = express.Router();
const Reservation = require('./reservationRoutes');
const Castle = require('./castle');
const Event = require('./event');

// Middleware para validar administrador
const isAdmin = (req, res, next) => {
  const authorized = req.headers.authorization === `Bearer ${process.env.SECRET_KEY}`;
  if (!authorized) return res.status(403).json({ message: 'No autorizado' });
  next();
};

// GET /availability - castillos y eventos (visibles para todos)
router.get('/availability', async (req, res) => {
  try {
    const castles = await Castle.find();
    const events = await Event.find();
    res.json({ castles, events });
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar disponibilidad', error: err.message });
  }
});

// POST /reservations - crear nueva reserva (cliente)
router.post('/reservations', async (req, res) => {
  const { itemId, itemType, client, date } = req.body;
  try {
    const newReservation = new Reservation({
      itemId,
      itemType,
      client,
      date,
      status: 'pending'
    });
    await newReservation.save();
    res.status(201).json({ success: true, reservation: newReservation });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al guardar reserva', error: err.message });
  }
});

// GET /reservations - ver todas las reservas (solo admin)
router.get('/reservations', isAdmin, async (req, res) => {
  try {
    const reservas = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ message: 'Error al cargar reservas', error: err.message });
  }
});

// PATCH /reservations/:id - actualizar estado o notas (solo admin)
router.patch('/reservations/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const updated = await Reservation.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar reserva' });
  }
});
// DELETE /reservations/:id - solo admin
router.delete('/reservations/:id', isAdmin, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar reserva' });
  }
});


module.exports = router;
