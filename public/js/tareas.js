const CLASES_ESTADO = {
    'Pendiente': 'estado-pendiente',
    'En Progreso': 'estado-progreso',
    'Completada': 'estado-completada'
};
const DURACION_AVISO = 5000;

const formularioTarea = document.getElementById('form-tarea');
const mensajeTarea = document.getElementById('mensaje-tarea');
const tituloFormulario = document.getElementById('titulo-formulario');
const botonGuardar = document.getElementById('btn-guardar');
const botonCancelar = document.getElementById('btn-cancelar');
const listaTareas = document.getElementById('lista-tareas');
const listaVacia = document.getElementById('lista-vacia');
const nombreUsuario = document.getElementById('nombre-usuario');
const botonLogout = document.getElementById('btn-logout');
const avisoTiempoReal = document.getElementById('aviso-tiempo-real');

let usuarioActual = null;
let idEnEdicion = null;
let temporizadorAviso = null;

function formatearFecha(fechaIso) {
    const [anio, mes, dia] = fechaIso.slice(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
}

function esTareaPropia(tarea) {
    return tarea.creadoPor !== null && String(tarea.creadoPor._id) === String(usuarioActual.id);
}

function crearElemento(etiqueta, texto, clase) {
    const elemento = document.createElement(etiqueta);
    if (texto) {
        elemento.textContent = texto;
    }
    if (clase) {
        elemento.className = clase;
    }
    return elemento;
}

function crearBoton(texto, clase, alHacerClic) {
    const boton = crearElemento('button', texto, clase);
    boton.type = 'button';
    boton.addEventListener('click', alHacerClic);
    return boton;
}

function crearTarjetaTarea(tarea) {
    const tarjeta = crearElemento('li', '', 'tarjeta');
    const autor = tarea.creadoPor ? tarea.creadoPor.nombre : 'Usuario eliminado';

    tarjeta.append(
        crearElemento('h3', tarea.titulo),
        crearElemento('span', tarea.estado, `estado ${CLASES_ESTADO[tarea.estado]}`),
        crearElemento('p', tarea.descripcion || 'Sin descripción'),
        crearElemento('p', `Área: ${tarea.area}`),
        crearElemento('p', `Entrega: ${formatearFecha(tarea.fechaEntrega)}`),
        crearElemento('p', `Creada por: ${autor}`, 'autor')
    );

    if (esTareaPropia(tarea)) {
        const acciones = crearElemento('div', '', 'grupo-botones');
        acciones.append(
            crearBoton('Editar', '', () => prepararEdicion(tarea)),
            crearBoton('Eliminar', 'boton-peligro', () => eliminarTarea(tarea))
        );
        tarjeta.append(acciones);
    }

    return tarjeta;
}

function mostrarTareas(tareas) {
    listaTareas.replaceChildren(...tareas.map(crearTarjetaTarea));
    listaVacia.hidden = tareas.length > 0;
}

function irAlLogin() {
    window.location.href = 'login.html';
}

function manejarRespuestaFallida(respuesta) {
    if (respuesta.estado === 401) {
        irAlLogin();
        return;
    }
    mostrarMensaje(mensajeTarea, obtenerMensajeError(respuesta.cuerpo), 'error');
}

async function cargarTareas() {
    const respuesta = await pedirApi('GET', '/api/tareas');

    if (!respuesta.ok) {
        manejarRespuestaFallida(respuesta);
        return;
    }

    mostrarTareas(respuesta.cuerpo.datos);
}

function leerFormularioTarea() {
    const campos = formularioTarea.elements;
    return {
        titulo: campos.titulo.value.trim(),
        descripcion: campos.descripcion.value.trim(),
        area: campos.area.value,
        fechaEntrega: campos.fechaEntrega.value,
        estado: campos.estado.value
    };
}

function validarTarea(datos) {
    if (datos.titulo.length < 3) {
        return 'El título debe tener al menos 3 caracteres.';
    }
    if (datos.area === '') {
        return 'Selecciona un área.';
    }
    if (datos.fechaEntrega === '') {
        return 'Selecciona una fecha de entrega.';
    }
    return '';
}

function prepararEdicion(tarea) {
    const campos = formularioTarea.elements;

    idEnEdicion = tarea._id;
    campos.titulo.value = tarea.titulo;
    campos.descripcion.value = tarea.descripcion;
    campos.area.value = tarea.area;
    campos.fechaEntrega.value = tarea.fechaEntrega.slice(0, 10);
    campos.estado.value = tarea.estado;

    tituloFormulario.textContent = 'Editar tarea';
    botonGuardar.textContent = 'Guardar cambios';
    botonCancelar.hidden = false;
    limpiarMensaje(mensajeTarea);
    formularioTarea.scrollIntoView({ behavior: 'smooth' });
}

function salirDeEdicion() {
    idEnEdicion = null;
    formularioTarea.reset();
    tituloFormulario.textContent = 'Nueva tarea o evento';
    botonGuardar.textContent = 'Guardar tarea';
    botonCancelar.hidden = true;
}

async function guardarTarea(evento) {
    evento.preventDefault();

    const datos = leerFormularioTarea();
    const error = validarTarea(datos);

    if (error) {
        mostrarMensaje(mensajeTarea, error, 'error');
        return;
    }

    const respuesta = idEnEdicion
        ? await pedirApi('PUT', `/api/tareas/${idEnEdicion}`, datos)
        : await pedirApi('POST', '/api/tareas', datos);

    if (!respuesta.ok) {
        manejarRespuestaFallida(respuesta);
        return;
    }

    salirDeEdicion();
    mostrarMensaje(mensajeTarea, respuesta.cuerpo.mensaje, 'exito');
    cargarTareas();
}

async function eliminarTarea(tarea) {
    if (!confirm(`¿Seguro que deseas eliminar la tarea "${tarea.titulo}"?`)) {
        return;
    }

    const respuesta = await pedirApi('DELETE', `/api/tareas/${tarea._id}`);

    if (!respuesta.ok) {
        manejarRespuestaFallida(respuesta);
        return;
    }

    if (idEnEdicion === tarea._id) {
        salirDeEdicion();
    }
    mostrarMensaje(mensajeTarea, respuesta.cuerpo.mensaje, 'exito');
    cargarTareas();
}

function mostrarAviso(texto) {
    avisoTiempoReal.textContent = texto;
    avisoTiempoReal.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        avisoTiempoReal.hidden = true;
    }, DURACION_AVISO);
}

function manejarCambioRemoto(aviso, accion) {
    if (aviso.autorId !== usuarioActual.id) {
        mostrarAviso(`${aviso.autor} ${accion} la tarea "${aviso.titulo}"`);
    }
    cargarTareas();
}

function conectarTiempoReal() {
    const socket = io();
    socket.on('tarea:creada', aviso => manejarCambioRemoto(aviso, 'creó'));
    socket.on('tarea:actualizada', aviso => manejarCambioRemoto(aviso, 'actualizó'));
    socket.on('tarea:eliminada', aviso => manejarCambioRemoto(aviso, 'eliminó'));
}

async function cerrarSesion() {
    await pedirApi('POST', '/api/auth/logout');
    irAlLogin();
}

async function iniciarPanel() {
    const respuesta = await pedirApi('GET', '/api/auth/perfil');

    if (!respuesta.ok) {
        irAlLogin();
        return;
    }

    usuarioActual = respuesta.cuerpo.datos;
    nombreUsuario.textContent = `Hola, ${usuarioActual.nombre}`;

    await cargarTareas();
    conectarTiempoReal();
}

formularioTarea.addEventListener('submit', guardarTarea);
botonCancelar.addEventListener('click', salirDeEdicion);
botonLogout.addEventListener('click', cerrarSesion);
iniciarPanel();

