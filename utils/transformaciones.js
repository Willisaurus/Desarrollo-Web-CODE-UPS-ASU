const crypto = require('crypto');

const SECRET_TOKEN = process.env.SESSION_SECRET || 'clave_secreta_codeups_2026';
const DURACION_TOKEN = 1000 * 60 * 60 * 2;
const tokensRevocados = new Set();

function crearTokenSesion(datosSesion) {
    const carga = Buffer.from(JSON.stringify({
        usuarioId: datosSesion.usuarioId,
        nombre: datosSesion.nombre,
        area: datosSesion.area,
        exp: Date.now() + DURACION_TOKEN
    })).toString('base64url');
    const firma = crypto.createHmac('sha256', SECRET_TOKEN).update(carga).digest('base64url');
    return `${carga}.${firma}`;
}

function verificarTokenSesion(token) {
    if (!token || typeof token !== 'string' || tokensRevocados.has(token)) {
        return null;
    }
    const partes = token.split('.');
    if (partes.length !== 2) {
        return null;
    }
    const [carga, firmaRecibida] = partes;
    const firmaEsperada = crypto.createHmac('sha256', SECRET_TOKEN).update(carga).digest('base64url');
    if (firmaRecibida.length !== firmaEsperada.length) {
        return null;
    }
    const coincide = crypto.timingSafeEqual(Buffer.from(firmaRecibida), Buffer.from(firmaEsperada));
    if (!coincide) {
        return null;
    }
    try {
        const datos = JSON.parse(Buffer.from(carga, 'base64url').toString('utf8'));
        if (!datos.exp || Date.now() > datos.exp || !datos.usuarioId) {
            return null;
        }
        return {
            usuarioId: datos.usuarioId,
            nombre: datos.nombre,
            area: datos.area
        };
    } catch {
        return null;
    }
}

function revocarTokenSesion(token) {
    if (token) {
        tokensRevocados.add(token);
    }
}

function extraerTokenCabecera(headers = {}) {
    const auth = headers.authorization || headers.Authorization || '';
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
        return auth.slice(7).trim();
    }
    return headers['x-session-token'] || '';
}

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
    crearAviso,
    crearTokenSesion,
    verificarTokenSesion,
    revocarTokenSesion,
    extraerTokenCabecera
};
