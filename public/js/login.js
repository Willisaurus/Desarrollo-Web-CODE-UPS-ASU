const formularioLogin = document.getElementById('form-login');
const mensajeLogin = document.getElementById('mensaje-login');

function irAlPanel() {
    window.location.href = 'tareas.html';
}

async function redirigirSiHaySesion() {
    const respuesta = await pedirApi('GET', '/api/auth/perfil');
    if (respuesta.ok) {
        irAlPanel();
    }
}

async function iniciarSesion(evento) {
    evento.preventDefault();

    const campos = formularioLogin.elements;
    const datos = {
        correo: campos.correo.value.trim().toLowerCase(),
        password: campos.password.value
    };

    if (datos.correo === '' || datos.password === '') {
        mostrarMensaje(mensajeLogin, 'Ingresa tu correo y tu contraseña.', 'error');
        return;
    }

    const respuesta = await pedirApi('POST', '/api/auth/login', datos);

    if (!respuesta.ok) {
        mostrarMensaje(mensajeLogin, obtenerMensajeError(respuesta.cuerpo), 'error');
        return;
    }

    irAlPanel();
}

formularioLogin.addEventListener('submit', iniciarSesion);
redirigirSiHaySesion();

