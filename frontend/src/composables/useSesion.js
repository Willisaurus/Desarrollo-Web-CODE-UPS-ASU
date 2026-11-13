import { reactive, computed } from 'vue'
import { authApi, obtenerMensajeError } from '../services/api'

const estadoSesion = reactive({
  usuario: null,
  verificado: false,
})

let verificacionEnCurso = null

function crearResultado(respuesta) {
  return respuesta.ok
    ? { ok: true, mensaje: respuesta.cuerpo.mensaje }
    : { ok: false, mensaje: obtenerMensajeError(respuesta.cuerpo) }
}

export function limpiarSesionLocal() {
  estadoSesion.usuario = null
  estadoSesion.verificado = true
}

export function verificarSesionActiva(forzar = false) {
  if (estadoSesion.verificado && !forzar) {
    return Promise.resolve(estadoSesion.usuario)
  }

  if (!verificacionEnCurso) {
    verificacionEnCurso = authApi.perfil()
      .then(respuesta => {
        estadoSesion.usuario = respuesta.ok ? respuesta.cuerpo.datos : null
        estadoSesion.verificado = respuesta.estado !== 0
        return estadoSesion.usuario
      })
      .finally(() => {
        verificacionEnCurso = null
      })
  }

  return verificacionEnCurso
}

export function useSesion() {
  const usuario = computed(() => estadoSesion.usuario)
  const autenticado = computed(() => estadoSesion.usuario !== null)

  async function iniciarSesion(datos) {
    const respuesta = await authApi.iniciarSesion(datos)
    if (respuesta.ok) {
      estadoSesion.usuario = respuesta.cuerpo.datos
      estadoSesion.verificado = true
    }
    return crearResultado(respuesta)
  }

  async function registrar(datos) {
    return crearResultado(await authApi.registrar(datos))
  }

  async function cerrarSesion() {
    await authApi.cerrarSesion()
    limpiarSesionLocal()
  }

  return {
    usuario,
    autenticado,
    iniciarSesion,
    registrar,
    cerrarSesion,
    verificar: verificarSesionActiva,
    expulsar: limpiarSesionLocal,
  }
}
