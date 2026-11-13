const VERSION = 'v1'
const CACHE_SHELL = `codeups-shell-${VERSION}`
const CACHE_ASSETS = `codeups-assets-${VERSION}`
const CACHES_ACTUALES = [CACHE_SHELL, CACHE_ASSETS]
const MAX_ASSETS = 60

const SHELL = [
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/logo.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]
const RUTAS_SIN_CACHE = ['/api/', '/socket.io/']

self.addEventListener('install', event => {
  event.waitUntil(precargar().then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(limpiarCachesAntiguos().then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (!esPeticionCacheable(request)) {
    return
  }

  const { pathname } = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(responderNavegacion(request))
  } else if (pathname.startsWith('/assets/')) {
    event.respondWith(responderConCacheprimero(request))
  } else if (SHELL.includes(pathname)) {
    event.respondWith(responderConRevalidacion(request))
  }
})

function esPeticionCacheable(request) {
  const url = new URL(request.url)
  return (
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    !RUTAS_SIN_CACHE.some(ruta => url.pathname.startsWith(ruta))
  )
}

function esRespuestaGuardable(respuesta) {
  return respuesta.ok && respuesta.type === 'basic'
}

async function precargar() {
  const shell = await caches.open(CACHE_SHELL)
  await shell.addAll(SHELL)

  const index = await shell.match('/index.html')
  const html = await index.clone().text()
  const rutasAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(coincidencia => coincidencia[1])

  const assets = await caches.open(CACHE_ASSETS)
  await Promise.allSettled(rutasAssets.map(ruta => assets.add(ruta)))
}

async function limpiarCachesAntiguos() {
  const nombres = await caches.keys()
  const obsoletos = nombres.filter(
    nombre => nombre.startsWith('codeups-') && !CACHES_ACTUALES.includes(nombre)
  )
  await Promise.all(obsoletos.map(nombre => caches.delete(nombre)))
}

async function responderNavegacion(request) {
  const shell = await caches.open(CACHE_SHELL)

  try {
    const respuesta = await fetch(request)
    const tipo = respuesta.headers.get('content-type') || ''
    if (esRespuestaGuardable(respuesta) && tipo.includes('text/html')) {
      await shell.put('/index.html', respuesta.clone())
    }
    return respuesta
  } catch {
    return (await shell.match('/index.html')) || (await shell.match('/offline.html'))
  }
}

async function responderConCacheprimero(request) {
  const cache = await caches.open(CACHE_ASSETS)
  const guardada = await cache.match(request)
  if (guardada) {
    return guardada
  }

  const respuesta = await fetch(request)
  if (esRespuestaGuardable(respuesta)) {
    await cache.put(request, respuesta.clone())
    await limitarCache(cache, MAX_ASSETS)
  }
  return respuesta
}

async function responderConRevalidacion(request) {
  const cache = await caches.open(CACHE_SHELL)
  const guardada = await cache.match(request)

  const actualizacion = fetch(request)
    .then(respuesta => {
      if (esRespuestaGuardable(respuesta)) {
        cache.put(request, respuesta.clone())
      }
      return respuesta
    })
    .catch(() => guardada)

  return guardada || actualizacion
}

async function limitarCache(cache, maximo) {
  const claves = await cache.keys()
  const sobrantes = claves.slice(0, Math.max(0, claves.length - maximo))
  await Promise.all(sobrantes.map(clave => cache.delete(clave)))
}

