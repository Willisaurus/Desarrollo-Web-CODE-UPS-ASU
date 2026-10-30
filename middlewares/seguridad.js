const { validationResult } = require('express-validator');
const Tarea = require('../models/Tarea');
const { formatearError, esDuenoDeTarea } = require('../utils/transformaciones');

function validarCampos(req, res, next) {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json(formatearError('Datos de entrada inválidos', errores.array()));
    }
    next();
}

function verificarSesion(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        return res.status(401).json(formatearError('No autorizado. Debes iniciar sesión primero.'));
    }
    next();
}

async function verificarPropietario(req, res, next) {
    try {
        const tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(404).json(formatearError('Tarea no encontrada'));
        }
        if (!esDuenoDeTarea(tarea, req.session.usuarioId)) {
            return res.status(403).json(formatearError('Solo el creador puede modificar o eliminar esta tarea'));
        }

        req.tarea = tarea;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    validarCampos,
    verificarSesion,
    verificarPropietario
};
