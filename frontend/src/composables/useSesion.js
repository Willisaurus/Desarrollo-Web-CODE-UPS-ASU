import { computed } from 'vue'
import { estadoSesion, pedirApi, obtenerMensajeError, limpiarSesionLocal } from '../services/api'

function crearResultado(respuesta) {
  return respuesta.ok
    ? { ok: true, mensaje: respuesta.cuerpo.mensaje }
    : { ok: false, mensaje: obtenerMensajeError(respuesta.cuerpo) }
}

export function useSesion() {
  const usuario = computed(() => estadoSesion.usuario)
  const autenticado = computed(() => estadoSesion.usuario !== null)

  async function iniciarSesion(datos) {
    const respuesta = await pedirApi('POST', '/api/auth/login', datos)
    if (respuesta.ok) {
      estadoSesion.usuario = respuesta.cuerpo.datos
      estadoSesion.verificado = true
    }
    return crearResultado(respuesta)
  }

  async function registrar(datos) {
    const respuesta = await pedirApi('POST', '/api/auth/registro', datos)
    return crearResultado(respuesta)
  }

  async function cerrarSesion() {
    await pedirApi('POST', '/api/auth/logout')
    limpiarSesionLocal()
  }

  return { usuario, autenticado, iniciarSesion, registrar, cerrarSesion }
}

