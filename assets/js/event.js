const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    time: String,
    available: { type: Boolean, default: true },
    maxCapacity: Number,
    currentAttendees: { type: Number, default: 0 },
    location: String,
    price: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);