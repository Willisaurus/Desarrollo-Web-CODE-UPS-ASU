const mongoose = require('mongoose');
const { AREAS, ESTADOS } = require('../config/constantes');

const tareaSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    area: {
        type: String,
        required: true,
        enum: AREAS
    },
    fechaEntrega: { type: Date, required: true },
    estado: {
        type: String,
        enum: ESTADOS,
        default: 'Pendiente'
    },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estudiante',
        required: true
    }
});

// Índice único compuesto: impide en base de datos que un estudiante duplique título y fecha
tareaSchema.index(
    { titulo: 1, fechaEntrega: 1, creadoPor: 1 },
    { unique: true }
);

module.exports = mongoose.model('Tarea', tareaSchema);
