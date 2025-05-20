const mongoose = require('mongoose');

const castleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    capacity: Number,
    available: { type: Boolean, default: true },
    images: [String],
    price: Number,
    features: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Castle', castleSchema);