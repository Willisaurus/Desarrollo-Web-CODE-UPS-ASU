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
}

function notificar(evento, datos) {
    if (io) {
        io.emit(evento, datos);
    }
}

module.exports = {
    iniciarNotificaciones,
    notificar
};

