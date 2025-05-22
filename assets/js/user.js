const mongoose = require('mongoose');
const { encrypt, decrypt } = require('./utils/encryption'); // Ajusta la ruta si es necesario

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        set: encrypt,
        get: decrypt
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('User', userSchema);
