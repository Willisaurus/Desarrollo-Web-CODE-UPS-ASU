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

module.exports = mongoose.model('Tarea', tareaSchema);
