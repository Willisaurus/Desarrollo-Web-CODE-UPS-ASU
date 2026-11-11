import { reactive } from 'vue'

const ERROR_CONEXION = {
  exito: false,
  error: { mensaje: 'No se pudo conectar con el servidor', detalles: [] },
}

export const estadoSesion = reactive({
  usuario: null,
  verificado: false,
})

export async function pedirApi(metodo, ruta, datos) {
  const opciones = {
    method: metodo,
    headers: {},
    credentials: 'include',
  }

  if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json'
    opciones.body = JSON.stringify(datos)
  }

  try {
    const respuesta = await fetch(ruta, opciones)
    const cuerpo = await respuesta.json()
    return { ok: respuesta.ok, estado: respuesta.status, cuerpo }
  } catch {
    return { ok: false, estado: 0, cuerpo: ERROR_CONEXION }
  }
}

export function obtenerMensajeError(cuerpo) {
  const detalles = (cuerpo && cuerpo.error && cuerpo.error.detalles) || []
  if (detalles.length > 0) {
    return detalles.map(detalle => detalle.msg).join(' ')
  }
  return (cuerpo && cuerpo.error && cuerpo.error.mensaje) || 'Ocurrió un error'
}

export async function verificarSesionActiva(forzar = false) {
  if (estadoSesion.verificado && !forzar) {
    return estadoSesion.usuario
  }

  const respuesta = await pedirApi('GET', '/api/auth/perfil')
  estadoSesion.usuario = respuesta.ok ? respuesta.cuerpo.datos : null
  estadoSesion.verificado = true
  return estadoSesion.usuario
}

export function limpiarSesionLocal() {
  estadoSesion.usuario = null
  estadoSesion.verificado = true
}

