const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { io } = require('socket.io-client');

const { servidor, iniciarServidor } = require('../index');
const { construirDatosTarea, esDuenoDeTarea, formatearError } = require('../utils/transformaciones');

const URI_PRUEBAS = 'mongodb://127.0.0.1:27017/codeups_test_db';
let urlBase = '';
let cookieA = '';
let cookieB = '';
let idTareaCreada = '';

async function pedir(metodo, ruta, cuerpo, cookie = '') {
    const opciones = {
        method: metodo,
        headers: { 'Content-Type': 'application/json', Cookie: cookie }
    };
    if (cuerpo !== undefined) {
        opciones.body = typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo);
    }
    const respuesta = await fetch(urlBase + ruta, opciones);
    const setCookie = respuesta.headers.get('set-cookie');
    const datos = await respuesta.json();
    return {
        estado: respuesta.status,
        datos,
        cookie: setCookie ? setCookie.split(';')[0] : cookie
    };
}

function esperarEvento(socket, evento) {
    return new Promise((resolver, rechazar) => {
        const timer = setTimeout(() => rechazar(new Error(`Tiempo agotado esperando ${evento}`)), 3000);
        socket.once(evento, datos => {
            clearTimeout(timer);
            resolver(datos);
        });
    });
}

before(async () => {
    await iniciarServidor(URI_PRUEBAS, 0);
    await mongoose.connection.db.dropDatabase();
    const puerto = servidor.address().port;
    urlBase = `http://localhost:${puerto}`;
});

after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    servidor.close();
});

test('Funciones puras: construirDatosTarea mantiene estado actual si no se envía otro', () => {
    const entrada = { titulo: 'Taller', area: 'Desarrollo Web', fechaEntrega: '2026-11-15' };
    const resultado = construirDatosTarea(entrada, '123', 'Completada');

    assert.equal(resultado.estado, 'Completada');
    assert.equal(entrada.estado, undefined);
    assert.equal(esDuenoDeTarea({ creadoPor: '123' }, '123'), true);
    assert.equal(formatearError('Fallo').exito, false);
});

test('GET /api/estado responde 200 y ruta inexistente responde 404 uniforme', async () => {
    const estado = await pedir('GET', '/api/estado');
    assert.equal(estado.estado, 200);
    assert.equal(estado.datos.exito, true);

    const noExiste = await pedir('GET', '/api/ruta-inexistente');
    assert.equal(noExiste.estado, 404);
    assert.equal(noExiste.datos.exito, false);
});

test('POST /api/auth/registro valida correo institucional (400), registra (201) y bloquea duplicados (409)', async () => {
    const invalido = await pedir('POST', '/api/auth/registro', {
        nombre: 'Usuario',
        correo: 'usuario@gmail.com',
        password: '123456',
        area: 'Desarrollo Web'
    });
    assert.equal(invalido.estado, 400);

    const regA = await pedir('POST', '/api/auth/registro', {
        nombre: 'Ana Pérez',
        correo: 'ana@est.ups.edu.ec',
        password: '123456',
        area: 'Desarrollo Web'
    });
    assert.equal(regA.estado, 201);
    assert.equal(regA.datos.datos.password, undefined);

    const regB = await pedir('POST', '/api/auth/registro', {
        nombre: 'Beto Mora',
        correo: 'beto@est.ups.edu.ec',
        password: '123456',
        area: 'Vinculación'
    });
    assert.equal(regB.estado, 201);

    const duplicado = await pedir('POST', '/api/auth/registro', {
        nombre: 'Ana Pérez',
        correo: 'ana@est.ups.edu.ec',
        password: '123456',
        area: 'Desarrollo Web'
    });
    assert.equal(duplicado.estado, 409);
});

test('POST /api/auth/login rechaza credenciales inválidas (401) e inicia sesión (200)', async () => {
    const fallido = await pedir('POST', '/api/auth/login', {
        correo: 'ana@est.ups.edu.ec',
        password: 'incorrecta'
    });
    assert.equal(fallido.estado, 401);

    const loginA = await pedir('POST', '/api/auth/login', {
        correo: 'ana@est.ups.edu.ec',
        password: '123456'
    });
    assert.equal(loginA.estado, 200);
    cookieA = loginA.cookie;

    const loginB = await pedir('POST', '/api/auth/login', {
        correo: 'beto@est.ups.edu.ec',
        password: '123456'
    });
    assert.equal(loginB.estado, 200);
    cookieB = loginB.cookie;
});

test('GET /api/auth/perfil exige sesión (401) y devuelve datos con sesión (200)', async () => {
    const sinSesion = await pedir('GET', '/api/auth/perfil');
    assert.equal(sinSesion.estado, 401);

    const conSesion = await pedir('GET', '/api/auth/perfil', undefined, cookieA);
    assert.equal(conSesion.estado, 200);
    assert.equal(conSesion.datos.datos.nombre, 'Ana Pérez');
});

test('CRUD de tareas, conflictos (409), permisos (403) y eventos en tiempo real con Socket.IO', async () => {
    const socketB = io(urlBase, {
        transports: ['websocket'],
        extraHeaders: { Cookie: cookieB },
        reconnection: false
    });
    await new Promise((resolver, rechazar) => {
        socketB.on('connect', resolver);
        socketB.on('connect_error', rechazar);
    });

    const tareaBase = {
        titulo: 'Taller de Git',
        descripcion: 'Práctica de ramas',
        area: 'Desarrollo Web',
        fechaEntrega: '2026-11-15',
        estado: 'En Progreso'
    };

    const promesaCreada = esperarEvento(socketB, 'tarea:creada');
    const creada = await pedir('POST', '/api/tareas', tareaBase, cookieA);
    assert.equal(creada.estado, 201);
    idTareaCreada = creada.datos.datos._id;

    const avisoCreada = await promesaCreada;
    assert.equal(avisoCreada.titulo, 'Taller de Git');

    const duplicada = await pedir('POST', '/api/tareas', tareaBase, cookieA);
    assert.equal(duplicada.estado, 409);

    const lista = await pedir('GET', '/api/tareas', undefined, cookieB);
    assert.equal(lista.estado, 200);
    assert.equal(lista.datos.datos.length, 1);

    const detalle = await pedir('GET', `/api/tareas/${idTareaCreada}`, undefined, cookieB);
    assert.equal(detalle.estado, 200);

    const idInvalido = await pedir('GET', '/api/tareas/id-no-valido', undefined, cookieA);
    assert.equal(idInvalido.estado, 400);

    const noEncontrada = await pedir('GET', '/api/tareas/507f1f77bcf86cd799439011', undefined, cookieA);
    assert.equal(noEncontrada.estado, 404);

    // Usuario B no puede editar ni eliminar la tarea de A -> 403
    const editarAjena = await pedir('PUT', `/api/tareas/${idTareaCreada}`, tareaBase, cookieB);
    assert.equal(editarAjena.estado, 403);

    const borrarAjena = await pedir('DELETE', `/api/tareas/${idTareaCreada}`, undefined, cookieB);
    assert.equal(borrarAjena.estado, 403);

    // PUT sin enviar campo "estado" conserva "En Progreso" en lugar de reiniciar a "Pendiente"
    const promesaActualizada = esperarEvento(socketB, 'tarea:actualizada');
    const actualizada = await pedir('PUT', `/api/tareas/${idTareaCreada}`, {
        titulo: 'Taller de Git y GitHub',
        descripcion: 'Práctica actualizada',
        area: 'Desarrollo Web',
        fechaEntrega: '2026-11-15'
    }, cookieA);
    assert.equal(actualizada.estado, 200);
    assert.equal(actualizada.datos.datos.estado, 'En Progreso');
    await promesaActualizada;

    // Eliminar tarea y verificar evento en tiempo real
    const promesaEliminada = esperarEvento(socketB, 'tarea:eliminada');
    const eliminada = await pedir('DELETE', `/api/tareas/${idTareaCreada}`, undefined, cookieA);
    assert.equal(eliminada.estado, 200);
    await promesaEliminada;

    // Cerrar sesión de B debe desconectar su socket automáticamente
    const promesaDesconexion = new Promise(resolver => socketB.on('disconnect', resolver));
    const logoutB = await pedir('POST', '/api/auth/logout', undefined, cookieB);
    assert.equal(logoutB.estado, 200);
    await promesaDesconexion;
    assert.equal(socketB.connected, false);
});

