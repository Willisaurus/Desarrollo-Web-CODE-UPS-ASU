const mongoose = require('mongoose');
const { AREAS } = require('../config/constantes');

const estudianteSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    area: {
        type: String,
        required: true,
        enum: AREAS
    },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Estudiante', estudianteSchema);
