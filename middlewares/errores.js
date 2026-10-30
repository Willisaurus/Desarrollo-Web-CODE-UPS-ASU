const { formatearError } = require('../utils/transformaciones');

function rutaNoEncontrada(req, res) {
    res.status(404).json(formatearError('Ruta no encontrada'));
}

function manejarErrores(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json(formatearError('El cuerpo de la petición no es un JSON válido'));
    }
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json(formatearError('Datos de entrada inválidos'));
    }
    console.error(err);
    res.status(500).json(formatearError('Error interno del servidor'));
}

module.exports = {
    rutaNoEncontrada,
    manejarErrores
};

