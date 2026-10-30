const Tarea = require('../models/Tarea');
const { notificar } = require('../servicios/notificaciones');
const {
    formatearError,
    formatearExito,
    construirDatosTarea,
    crearAviso
} = require('../utils/transformaciones');

const CAMPOS_AUTOR = 'nombre correo area';
const MENSAJE_DUPLICADA = 'Ya tienes una tarea con ese título para esa fecha';

async function existeDuplicada(datos, idActual) {
    const duplicada = await Tarea.findOne({
        titulo: datos.titulo,
        fechaEntrega: datos.fechaEntrega,
        creadoPor: datos.creadoPor
    });
    return duplicada !== null && String(duplicada._id) !== String(idActual);
}

async function listarTareas(req, res, next) {
    try {
        const tareas = await Tarea.find()
            .populate('creadoPor', CAMPOS_AUTOR)
            .sort({ fechaEntrega: 1 });

        res.status(200).json(formatearExito('Tareas obtenidas', tareas));
    } catch (error) {
        next(error);
    }
}

async function obtenerTarea(req, res, next) {
    try {
        const tarea = await Tarea.findById(req.params.id).populate('creadoPor', CAMPOS_AUTOR);

        if (!tarea) {
            return res.status(404).json(formatearError('Tarea no encontrada'));
        }

        res.status(200).json(formatearExito('Tarea obtenida', tarea));
    } catch (error) {
        next(error);
    }
}

async function crearTarea(req, res, next) {
    try {
        const datos = construirDatosTarea(req.body, req.session.usuarioId);

        if (await existeDuplicada(datos)) {
            return res.status(409).json(formatearError(MENSAJE_DUPLICADA));
        }

        const tarea = await Tarea.create(datos);
        notificar('tarea:creada', crearAviso(tarea, req.session));

        res.status(201).json(formatearExito('Tarea creada exitosamente', tarea));
    } catch (error) {
        next(error);
    }
}

async function actualizarTarea(req, res, next) {
    try {
        const datos = construirDatosTarea(req.body, req.session.usuarioId);

        if (await existeDuplicada(datos, req.params.id)) {
            return res.status(409).json(formatearError(MENSAJE_DUPLICADA));
        }

        const tarea = await Tarea.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true });

        if (!tarea) {
            return res.status(404).json(formatearError('Tarea no encontrada'));
        }

        notificar('tarea:actualizada', crearAviso(tarea, req.session));
        res.status(200).json(formatearExito('Tarea actualizada', tarea));
    } catch (error) {
        next(error);
    }
}

async function eliminarTarea(req, res, next) {
    try {
        await req.tarea.deleteOne();
        notificar('tarea:eliminada', crearAviso(req.tarea, req.session));

        res.status(200).json(formatearExito('Tarea eliminada correctamente'));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listarTareas,
    obtenerTarea,
    crearTarea,
    actualizarTarea,
    eliminarTarea
};

