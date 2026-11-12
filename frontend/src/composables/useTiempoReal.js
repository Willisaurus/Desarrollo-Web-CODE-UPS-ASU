import { ref, onMounted, onUnmounted, toValue } from 'vue'
import { io } from 'socket.io-client'

const DURACION_AVISO = 5000
const ACCIONES = {
  'tarea:creada': 'creó',
  'tarea:actualizada': 'actualizó',
  'tarea:eliminada': 'eliminó',
}

export function useTiempoReal(alCambiar, usuarioId) {
  const aviso = ref('')
  let socket = null
  let temporizador = null

  function mostrarAviso(texto) {
    aviso.value = texto
    clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      aviso.value = ''
    }, DURACION_AVISO)
  }

  function manejarCambio(evento, datos) {
    if (datos.autorId !== toValue(usuarioId)) {
      mostrarAviso(`${datos.autor} ${ACCIONES[evento]} la tarea "${datos.titulo}"`)
    }
    alCambiar()
  }

  onMounted(() => {
    socket = io()
    Object.keys(ACCIONES).forEach(evento => {
      socket.on(evento, datos => manejarCambio(evento, datos))
    })
  })

  onUnmounted(() => {
    clearTimeout(temporizador)
    if (socket) {
      socket.disconnect()
    }
  })

  return { aviso }
}

