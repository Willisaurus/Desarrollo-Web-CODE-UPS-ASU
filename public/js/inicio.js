const DOMINIOS_PERMITIDOS = ['@est.ups.edu.ec', '@ups.edu.ec'];

const botonMenu = document.getElementById('btn-menu');
const menuNav = document.getElementById('menu-nav');
const formulario = document.getElementById('form-inscripcion');
const textoMensaje = document.getElementById('mensaje-validacion');
const botonLimpiar = document.getElementById('btn-limpiar');

function alternarMenu() {
    menuNav.classList.toggle('menu-abierto');
    const estaAbierto = menuNav.classList.contains('menu-abierto');
    botonMenu.setAttribute('aria-expanded', estaAbierto);
}

function leerFormulario() {
    const campos = formulario.elements;
    return {
        nombre: campos.nombre.value.trim(),
        correo: campos.correo.value.trim().toLowerCase(),
        password: campos.password.value,
        area: campos.area.value
    };
}

function validarRegistro(datos) {
    if (datos.nombre === '') {
        return { campo: 'nombre', mensaje: 'Por favor, ingresa tu nombre completo.' };
    }
    if (!DOMINIOS_PERMITIDOS.some(dominio => datos.correo.endsWith(dominio))) {
        return { campo: 'correo', mensaje: 'Debes ingresar un correo institucional válido (@est.ups.edu.ec o @ups.edu.ec).' };
    }
    if (datos.password.length < 6) {
        return { campo: 'password', mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (datos.area === '') {
        return { campo: 'area', mensaje: 'Por favor, selecciona un área de interés de la lista.' };
    }
    return null;
}

async function enviarRegistro(evento) {
    evento.preventDefault();

    const datos = leerFormulario();
    const error = validarRegistro(datos);

    if (error) {
        mostrarMensaje(textoMensaje, error.mensaje, 'error');
        formulario.elements[error.campo].focus();
        return;
    }

    const respuesta = await pedirApi('POST', '/api/auth/registro', datos);

    if (!respuesta.ok) {
        mostrarMensaje(textoMensaje, obtenerMensajeError(respuesta.cuerpo), 'error');
        return;
    }

    mostrarMensaje(textoMensaje, `¡Registro exitoso, ${datos.nombre}! Ya puedes iniciar sesión.`, 'exito');
    formulario.reset();
}

botonMenu.addEventListener('click', alternarMenu);
formulario.addEventListener('submit', enviarRegistro);
botonLimpiar.addEventListener('click', () => limpiarMensaje(textoMensaje));

