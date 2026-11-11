<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { pedirApi, obtenerMensajeError, estadoSesion, limpiarSesionLocal } from '../services/api'

const router = useRouter()

const CLASES_ESTADO = {
  'Pendiente': 'estado-pendiente',
  'En Progreso': 'estado-progreso',
  'Completada': 'estado-completada',
}

const tareas = ref([])
const idEnEdicion = ref(null)
const mensaje = ref('')
const tipoMensaje = ref('')
const avisoTiempoReal = ref('')

const formulario = reactive({
  titulo: '',
  descripcion: '',
  area: '',
  fechaEntrega: '',
  estado: 'Pendiente',
})

let socket = null
let temporizadorAviso = null

function formatearFecha(fechaIso) {
  if (!fechaIso) return ''
  const [anio, mes, dia] = fechaIso.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function esTareaPropia(tarea) {
  return (
    tarea.creadoPor !== null &&
    estadoSesion.usuario !== null &&
    String(tarea.creadoPor._id) === String(estadoSesion.usuario.id)
  )
}

function mostrarMensaje(texto, tipo) {
  mensaje.value = texto
  tipoMensaje.value = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'
}

function manejarFallo(respuesta) {
  if (respuesta.estado === 401) {
    limpiarSesionLocal()
    router.push({ name: 'login' })
    return
  }
  mostrarMensaje(obtenerMensajeError(respuesta.cuerpo), 'error')
}

async function cargarTareas() {
  const respuesta = await pedirApi('GET', '/api/tareas')
  if (!respuesta.ok) {
    manejarFallo(respuesta)
    return
  }
  tareas.value = respuesta.cuerpo.datos
}

function prepararEdicion(tarea) {
  idEnEdicion.value = tarea._id
  formulario.titulo = tarea.titulo
  formulario.descripcion = tarea.descripcion
  formulario.area = tarea.area
  formulario.fechaEntrega = tarea.fechaEntrega.slice(0, 10)
  formulario.estado = tarea.estado
  mensaje.value = ''
}

function cancelarEdicion() {
  idEnEdicion.value = null
  formulario.titulo = ''
  formulario.descripcion = ''
  formulario.area = ''
  formulario.fechaEntrega = ''
  formulario.estado = 'Pendiente'
}

function validarTarea() {
  if (formulario.titulo.trim().length < 3) {
    return 'El título debe tener al menos 3 caracteres.'
  }
  if (formulario.area === '') {
    return 'Selecciona un área.'
  }
  if (formulario.fechaEntrega === '') {
    return 'Selecciona una fecha de entrega.'
  }
  return ''
}

async function guardarTarea() {
  const error = validarTarea()
  if (error) {
    mostrarMensaje(error, 'error')
    return
  }

  const datos = {
    titulo: formulario.titulo.trim(),
    descripcion: formulario.descripcion.trim(),
    area: formulario.area,
    fechaEntrega: formulario.fechaEntrega,
    estado: formulario.estado,
  }

  const respuesta = idEnEdicion.value
    ? await pedirApi('PUT', `/api/tareas/${idEnEdicion.value}`, datos)
    : await pedirApi('POST', '/api/tareas', datos)

  if (!respuesta.ok) {
    manejarFallo(respuesta)
    return
  }

  cancelarEdicion()
  mostrarMensaje(respuesta.cuerpo.mensaje, 'exito')
  await cargarTareas()
}

async function eliminarTarea(tarea) {
  if (!confirm(`¿Seguro que deseas eliminar la tarea "${tarea.titulo}"?`)) {
    return
  }

  const respuesta = await pedirApi('DELETE', `/api/tareas/${tarea._id}`)
  if (!respuesta.ok) {
    manejarFallo(respuesta)
    return
  }

  if (idEnEdicion.value === tarea._id) {
    cancelarEdicion()
  }
  mostrarMensaje(respuesta.cuerpo.mensaje, 'exito')
  await cargarTareas()
}

function mostrarAviso(texto) {
  avisoTiempoReal.value = texto
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => {
    avisoTiempoReal.value = ''
  }, 5000)
}

function manejarCambioRemoto(aviso, accion) {
  if (estadoSesion.usuario && aviso.autorId !== estadoSesion.usuario.id) {
    mostrarAviso(`${aviso.autor} ${accion} la tarea "${aviso.titulo}"`)
  }
  cargarTareas()
}

onMounted(async () => {
  await cargarTareas()
  socket = io()
  socket.on('tarea:creada', aviso => manejarCambioRemoto(aviso, 'creó'))
  socket.on('tarea:actualizada', aviso => manejarCambioRemoto(aviso, 'actualizó'))
  socket.on('tarea:eliminada', aviso => manejarCambioRemoto(aviso, 'eliminó'))
})

onUnmounted(() => {
  clearTimeout(temporizadorAviso)
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <main>
    <p v-if="avisoTiempoReal" class="aviso" role="status" aria-live="polite">
      {{ avisoTiempoReal }}
    </p>

    <section id="nueva-tarea">
      <h2>{{ idEnEdicion ? 'Editar tarea' : 'Nueva tarea o evento' }}</h2>
      <form @submit.prevent="guardarTarea" novalidate>
        <fieldset>
          <legend>Datos de la tarea</legend>

          <div class="campo-formulario">
            <label for="titulo">Título:</label>
            <input
              id="titulo"
              v-model="formulario.titulo"
              type="text"
              placeholder="Ej. Taller de Git"
              maxlength="100"
              required
            >
          </div>

          <div class="campo-formulario">
            <label for="descripcion">Descripción (opcional):</label>
            <textarea
              id="descripcion"
              v-model="formulario.descripcion"
              rows="3"
              maxlength="500"
            ></textarea>
          </div>

          <div class="campo-formulario">
            <label for="area">Área:</label>
            <select id="area" v-model="formulario.area" required>
              <option value="">-- Selecciona un área --</option>
              <option value="Desarrollo Web">Desarrollo Web</option>
              <option value="Inteligencia Artificial">Inteligencia Artificial</option>
              <option value="Vinculación">Vinculación</option>
            </select>
          </div>

          <div class="campo-formulario">
            <label for="fechaEntrega">Fecha de entrega:</label>
            <input
              id="fechaEntrega"
              v-model="formulario.fechaEntrega"
              type="date"
              required
            >
          </div>

          <div class="campo-formulario">
            <label for="estado">Estado:</label>
            <select id="estado" v-model="formulario.estado">
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <p v-if="mensaje" :class="tipoMensaje" aria-live="polite">{{ mensaje }}</p>

          <div class="grupo-botones">
            <button type="submit">
              {{ idEnEdicion ? 'Guardar cambios' : 'Guardar tarea' }}
            </button>
            <button v-if="idEnEdicion" type="button" @click="cancelarEdicion">
              Cancelar edición
            </button>
          </div>
        </fieldset>
      </form>
    </section>

    <section id="lista">
      <h2>Tareas y eventos programados</h2>
      <p v-if="tareas.length === 0">Todavía no hay tareas registradas.</p>
      <ul v-else class="lista-tareas">
        <li v-for="tarea in tareas" :key="tarea._id" class="tarjeta">
          <h3>{{ tarea.titulo }}</h3>
          <span class="estado" :class="CLASES_ESTADO[tarea.estado]">
            {{ tarea.estado }}
          </span>
          <p>{{ tarea.descripcion || 'Sin descripción' }}</p>
          <p>Área: {{ tarea.area }}</p>
          <p>Entrega: {{ formatearFecha(tarea.fechaEntrega) }}</p>
          <p class="autor">
            Creada por: {{ tarea.creadoPor ? tarea.creadoPor.nombre : 'Usuario eliminado' }}
          </p>

          <div v-if="esTareaPropia(tarea)" class="grupo-botones">
            <button type="button" @click="prepararEdicion(tarea)">Editar</button>
            <button type="button" class="boton-peligro" @click="eliminarTarea(tarea)">
              Eliminar
            </button>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

