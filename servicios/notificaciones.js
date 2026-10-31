const { Server } = require('socket.io');

let io = null;

function iniciarNotificaciones(servidorHttp, middlewareSesion) {
    io = new Server(servidorHttp);
    io.engine.use(middlewareSesion);

    io.use((socket, next) => {
        const sesion = socket.request.session;
        if (sesion && sesion.usuarioId) {
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
