const API_URL = import.meta.env.VITE_API_URL || ''
const MENSAJE_RED = 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'

function crearCuerpoError(mensaje) {
  return { exito: false, error: { mensaje, detalles: [] } }
}

function esCuerpoEstructurado(cuerpo) {
  return Boolean(cuerpo && cuerpo.error && typeof cuerpo.error.mensaje === 'string')
}

async function leerCuerpo(respuesta) {
  try {
    return await respuesta.json()
  } catch {
    return null
  }
}

async function solicitar(metodo, ruta, { datos, signal } = {}) {
  const opciones = { method: metodo, headers: {}, credentials: 'include', signal }

  if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(datos)
  }

  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, opciones)
    const cuerpo = await leerCuerpo(respuesta)

    if (!respuesta.ok) {
      const cuerpoError = esCuerpoEstructurado(cuerpo)
        ? cuerpo
        : crearCuerpoError(`El servidor respondió con un error inesperado (código ${respuesta.status}).`)
      return { ok: false, estado: respuesta.status, cuerpo: cuerpoError }
    }

    if (cuerpo === null) {
      return {
        ok: false,
        estado: respuesta.status,
        cuerpo: crearCuerpoError('El servidor devolvió una respuesta que no se pudo interpretar.'),
      }
    }

    return { ok: true, estado: respuesta.status, cuerpo }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, estado: 0, cancelada: true, cuerpo: crearCuerpoError('Petición cancelada.') }
    }
    return { ok: false, estado: 0, cuerpo: crearCuerpoError(MENSAJE_RED) }
  }
}

export function obtenerMensajeError(cuerpo) {
  const detalles = (cuerpo && cuerpo.error && cuerpo.error.detalles) || []
  if (detalles.length > 0) {
    return detalles.map(detalle => detalle.msg).join(' ')
  }
  return (cuerpo && cuerpo.error && cuerpo.error.mensaje) || 'Ocurrió un error inesperado.'
}

export const authApi = {
  registrar: datos => solicitar('POST', '/api/auth/registro', { datos }),
  iniciarSesion: datos => solicitar('POST', '/api/auth/login', { datos }),
  perfil: () => solicitar('GET', '/api/auth/perfil'),
  cerrarSesion: () => solicitar('POST', '/api/auth/logout'),
}

export const tareasApi = {
  listar: signal => solicitar('GET', '/api/tareas', { signal }),
  obtener: id => solicitar('GET', `/api/tareas/${id}`),
  crear: datos => solicitar('POST', '/api/tareas', { datos }),
  actualizar: (id, datos) => solicitar('PUT', `/api/tareas/${id}`, { datos }),
  eliminar: id => solicitar('DELETE', `/api/tareas/${id}`),
}
