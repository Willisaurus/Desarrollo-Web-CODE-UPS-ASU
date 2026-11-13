import { ref, computed, toValue, onUnmounted } from 'vue'
import { tareasApi, obtenerMensajeError } from '../services/api'

function crearResultado(respuesta) {
  return {
    ok: respuesta.ok,
    estado: respuesta.estado,
    cancelada: Boolean(respuesta.cancelada),
    mensaje: respuesta.ok ? respuesta.cuerpo.mensaje : obtenerMensajeError(respuesta.cuerpo),
  }
}

const RESULTADO_IGNORADO = { ok: false, estado: 0, cancelada: true, mensaje: '' }

function contarPorEstado(tareas, estado) {
  return tareas.filter(tarea => tarea.estado === estado).length
}

export function useTareas(usuarioId) {
  const tareas = ref([])
  const cargando = ref(false)
  const guardando = ref(false)
  const errorCarga = ref('')

  let controlador = null

  const misTareas = computed(() =>
    tareas.value.filter(
      tarea => tarea.creadoPor && String(tarea.creadoPor._id) === String(toValue(usuarioId))
    )
  )

  const resumen = computed(() => ({
    total: misTareas.value.length,
    pendientes: contarPorEstado(misTareas.value, 'Pendiente'),
    enProgreso: contarPorEstado(misTareas.value, 'En Progreso'),
    completadas: contarPorEstado(misTareas.value, 'Completada'),
  }))

  async function cargar() {
    if (controlador) {
      controlador.abort()
    }
    const actual = new AbortController()
    controlador = actual
    cargando.value = true

    const respuesta = await tareasApi.listar(actual.signal)

    if (respuesta.cancelada || controlador !== actual) {
      return RESULTADO_IGNORADO
    }

    controlador = null
    cargando.value = false

    if (respuesta.ok) {
      tareas.value = respuesta.cuerpo.datos
      errorCarga.value = ''
    } else {
      errorCarga.value = obtenerMensajeError(respuesta.cuerpo)
    }
    return crearResultado(respuesta)
  }

  async function modificar(peticion) {
    if (guardando.value) {
      return RESULTADO_IGNORADO
    }

    guardando.value = true
    try {
      const respuesta = await peticion()
      if (respuesta.ok) {
        await cargar()
      }
      return crearResultado(respuesta)
    } finally {
      guardando.value = false
    }
  }

  const crear = datos => modificar(() => tareasApi.crear(datos))
  const actualizar = (id, datos) => modificar(() => tareasApi.actualizar(id, datos))
  const eliminar = id => modificar(() => tareasApi.eliminar(id))

  onUnmounted(() => {
    if (controlador) {
      controlador.abort()
    }
  })

  return { tareas, cargando, guardando, errorCarga, misTareas, resumen, cargar, crear, actualizar, eliminar }
}
