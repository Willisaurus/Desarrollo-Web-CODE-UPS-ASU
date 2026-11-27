const { Server } = require('socket.io');
const { verificarTokenSesion, extraerTokenCabecera } = require('../utils/transformaciones');

let io = null;

function iniciarNotificaciones(servidorHttp, middlewareSesion, opcionesCors) {
    io = new Server(servidorHttp, { cors: opcionesCors });
    io.engine.use(middlewareSesion);

    io.use((socket, next) => {
        const sesion = socket.request.session || {};
        if (sesion.usuarioId) {
            return next();
        }
        const token = (socket.handshake.auth && socket.handshake.auth.token) || extraerTokenCabecera(socket.handshake.headers);
        const datos = verificarTokenSesion(token);
        if (datos) {
            socket.request.session = Object.assign(sesion, datos);
            return next();
        }
        next(new Error('No autorizado'));
    });

    io.on('connection', socket => {
        const usuarioId = String(socket.request.session.usuarioId);
        socket.join(usuarioId);
    });
}

function notificar(evento, datos) {
    if (io) {
        io.emit(evento, datos);
    }
}

function desconectarUsuario(usuarioId) {
    if (io && usuarioId) {
        io.in(String(usuarioId)).disconnectSockets(true);
    }
}

module.exports = {
    iniciarNotificaciones,
    notificar,
    desconectarUsuario
};
