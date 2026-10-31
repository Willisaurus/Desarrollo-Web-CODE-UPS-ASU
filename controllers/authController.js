const bcrypt = require('bcrypt');
const Estudiante = require('../models/Estudiante');
const { desconectarUsuario } = require('../servicios/notificaciones');
const {
    formatearError,
    formatearExito,
    crearDatosSesion,
    crearPerfilPublico
} = require('../utils/transformaciones');

const CODIGO_DUPLICADO = 11000;
const RONDAS_ENCRIPTADO = 10;

async function registrar(req, res, next) {
    const { nombre, correo, password, area } = req.body;

    try {
        const existe = await Estudiante.exists({ correo });
        if (existe) {
            return res.status(409).json(formatearError('El correo institucional ya está registrado'));
        }

        const passwordEncriptada = await bcrypt.hash(password, RONDAS_ENCRIPTADO);
        const estudiante = await Estudiante.create({ nombre, correo, password: passwordEncriptada, area });

        res.status(201).json(formatearExito('Registro exitoso', crearPerfilPublico(crearDatosSesion(estudiante))));
    } catch (error) {
        if (error.code === CODIGO_DUPLICADO) {
            return res.status(409).json(formatearError('El correo institucional ya está registrado'));
        }
        next(error);
    }
}

async function iniciarSesion(req, res, next) {
    const { correo, password } = req.body;

    try {
        const estudiante = await Estudiante.findOne({ correo }).select('+password');
        const coincide = estudiante !== null && await bcrypt.compare(password, estudiante.password);

        if (!coincide) {
            return res.status(401).json(formatearError('Credenciales incorrectas'));
        }

        req.session.regenerate(error => {
            if (error) {
                return next(error);
            }
            Object.assign(req.session, crearDatosSesion(estudiante));
            res.status(200).json(formatearExito('Sesión iniciada correctamente', crearPerfilPublico(req.session)));
        });
    } catch (error) {
        next(error);
    }
}

function obtenerPerfil(req, res) {
    res.status(200).json(formatearExito('Sesión activa', crearPerfilPublico(req.session)));
}

function cerrarSesion(req, res, next) {
    const usuarioId = req.session.usuarioId;
    desconectarUsuario(usuarioId);

    req.session.destroy(error => {
        if (error) {
            return next(error);
        }
        res.clearCookie('connect.sid');
        res.status(200).json(formatearExito('Sesión cerrada'));
    });
}

module.exports = {
    registrar,
    iniciarSesion,
    obtenerPerfil,
    cerrarSesion
};
