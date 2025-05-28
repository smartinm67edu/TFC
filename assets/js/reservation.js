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

// Middleware: si la reserva se confirma, marcar el castillo o evento como no disponible
reservationSchema.post('save', async function (doc) {
  if (doc.status === 'confirmed') {
    const Model = doc.itemType === 'castle' ? require('./castle') : require('./event');
    await Model.findByIdAndUpdate(doc.itemId, { available: false });
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
