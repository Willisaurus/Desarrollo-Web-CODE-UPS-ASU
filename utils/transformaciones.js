function formatearError(mensaje, detalles = []) {
    return {
        exito: false,
        error: { mensaje, detalles }
    };
}

function formatearExito(mensaje, datos) {
    return { exito: true, mensaje, datos };
}

function construirDatosTarea(cuerpo, usuarioId, estadoActual = 'Pendiente') {
    return {
        titulo: cuerpo.titulo,
        descripcion: cuerpo.descripcion || '',
        area: cuerpo.area,
        fechaEntrega: cuerpo.fechaEntrega,
        estado: cuerpo.estado || estadoActual,
        creadoPor: usuarioId
    };
}

function esDuenoDeTarea(tarea, usuarioId) {
    return String(tarea.creadoPor) === String(usuarioId);
}

function crearDatosSesion(estudiante) {
    return {
        usuarioId: String(estudiante._id),
        nombre: estudiante.nombre,
        area: estudiante.area
    };
}

function crearPerfilPublico(datosSesion) {
    return {
        id: datosSesion.usuarioId,
        nombre: datosSesion.nombre,
        area: datosSesion.area
    };
}

function crearAviso(tarea, datosSesion) {
    return {
        id: String(tarea._id),
        titulo: tarea.titulo,
        autor: datosSesion.nombre,
        autorId: datosSesion.usuarioId
    };
}

module.exports = {
    formatearError,
    formatearExito,
    construirDatosTarea,
    esDuenoDeTarea,
    crearDatosSesion,
    crearPerfilPublico,
    crearAviso
};
