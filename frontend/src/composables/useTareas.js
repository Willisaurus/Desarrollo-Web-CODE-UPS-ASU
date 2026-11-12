import { ref, computed, toValue } from 'vue'
import { pedirApi, obtenerMensajeError } from '../services/api'

const RUTA_TAREAS = '/api/tareas'

function crearResultado(respuesta) {
  return respuesta.ok
    ? { ok: true, estado: respuesta.estado, mensaje: respuesta.cuerpo.mensaje }
    : { ok: false, estado: respuesta.estado, mensaje: obtenerMensajeError(respuesta.cuerpo) }
}

function contarPorEstado(tareas, estado) {
  return tareas.filter(tarea => tarea.estado === estado).length
}

export function useTareas(usuarioId) {
  const tareas = ref([])
  const cargando = ref(false)

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
    cargando.value = true
    const respuesta = await pedirApi('GET', RUTA_TAREAS)
    cargando.value = false

    if (respuesta.ok) {
      tareas.value = respuesta.cuerpo.datos
    }
    return crearResultado(respuesta)
  }

  async function modificar(metodo, ruta, datos) {
    const respuesta = await pedirApi(metodo, ruta, datos)
    if (respuesta.ok) {
      await cargar()
    }
    return crearResultado(respuesta)
  }

  const crear = datos => modificar('POST', RUTA_TAREAS, datos)
  const actualizar = (id, datos) => modificar('PUT', `${RUTA_TAREAS}/${id}`, datos)
  const eliminar = id => modificar('DELETE', `${RUTA_TAREAS}/${id}`)

  return { tareas, cargando, misTareas, resumen, cargar, crear, actualizar, eliminar }
}

