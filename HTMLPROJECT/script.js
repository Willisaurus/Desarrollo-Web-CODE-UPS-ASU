// Interacción 1: Menú móvil
const botonMenu = document.getElementById("btn-menu");
const menuNav = document.getElementById("menu-nav");

function alternarMenu() {
    menuNav.classList.toggle("menu-abierto");
    const estaAbierto = menuNav.classList.contains("menu-abierto");
    botonMenu.setAttribute("aria-expanded", estaAbierto);
}

botonMenu.addEventListener("click", alternarMenu);

// Interacción 2: Validación de formulario
const formulario = document.getElementById("form-inscripcion");
const inputNombre = document.getElementById("nombre");
const inputCorreo = document.getElementById("correo");
const selectArea = document.getElementById("area");
const textoMensaje = document.getElementById("mensaje-validacion");
const botonLimpiar = document.getElementById("btn-limpiar");

function validarFormulario(evento) {
    evento.preventDefault();

    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim();
    const area = selectArea.value;

    if (nombre === "") {
        mostrarMensaje("Por favor, ingresa tu nombre completo.", "error");
        inputNombre.focus();
        return;
    }

    if (!correo.endsWith("@est.ups.edu.ec") && !correo.endsWith("@ups.edu.ec")) {
        mostrarMensaje("Debes ingresar un correo institucional válido (@est.ups.edu.ec o @ups.edu.ec).", "error");
        inputCorreo.focus();
        return;
    }

    if (area === "") {
        mostrarMensaje("Por favor, selecciona un área de interés de la lista.", "error");
        selectArea.focus();
        return;
    }

    mostrarMensaje("¡Gracias por postular, " + nombre + "! Te contactaremos pronto al área de " + area + ".", "exito");
    formulario.reset();
}

function mostrarMensaje(texto, tipo) {
    textoMensaje.textContent = texto;
    textoMensaje.className = tipo === "error" ? "mensaje-error" : "mensaje-exito";
}

function limpiarMensaje() {
    textoMensaje.textContent = "";
    textoMensaje.className = "";
}

formulario.addEventListener("submit", validarFormulario);
botonLimpiar.addEventListener("click", limpiarMensaje);