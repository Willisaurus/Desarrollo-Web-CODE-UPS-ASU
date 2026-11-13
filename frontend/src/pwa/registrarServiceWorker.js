const RUTA_SERVICE_WORKER = '/sw.js'

export function registrarServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(RUTA_SERVICE_WORKER).catch(error => {
      console.error('No se pudo registrar el Service Worker:', error)
    })
  })
}

