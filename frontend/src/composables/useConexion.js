import { ref, onMounted, onUnmounted } from 'vue'

function leerEstadoConexion() {
  return typeof navigator === 'undefined' || navigator.onLine !== false
}

export function useConexion() {
  const enLinea = ref(leerEstadoConexion())

  function actualizar() {
    enLinea.value = leerEstadoConexion()
  }

  onMounted(() => {
    window.addEventListener('online', actualizar)
    window.addEventListener('offline', actualizar)
    actualizar()
  })

  onUnmounted(() => {
    window.removeEventListener('online', actualizar)
    window.removeEventListener('offline', actualizar)
  })

  return { enLinea }
}

