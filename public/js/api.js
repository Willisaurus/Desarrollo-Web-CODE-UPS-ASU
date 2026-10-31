const ERROR_CONEXION = {
    exito: false,
    error: { mensaje: 'No se pudo conectar con el servidor', detalles: [] }
};

async function pedirApi(metodo, ruta, datos) {
    const opciones = { method: metodo, headers: {} };

    if (datos !== undefined) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
    }

    try {
        const respuesta = await fetch(ruta, opciones);
        const cuerpo = await respuesta.json();
        return { ok: respuesta.ok, estado: respuesta.status, cuerpo };
    } catch (error) {
        return { ok: false, estado: 0, cuerpo: ERROR_CONEXION };
    }
}

function obtenerMensajeError(cuerpo) {
    const detalles = (cuerpo && cuerpo.error && cuerpo.error.detalles) || [];
    if (detalles.length > 0) {
        return detalles.map(detalle => detalle.msg).join(' ');
    }
    return (cuerpo && cuerpo.error && cuerpo.error.mensaje) || 'Ocurrió un error';
}

function mostrarMensaje(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
}

function limpiarMensaje(elemento) {
    elemento.textContent = '';
    elemento.className = '';
}

