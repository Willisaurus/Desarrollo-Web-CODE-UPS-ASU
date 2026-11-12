<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { limpiarSesionLocal } from '../services/api'
import { useSesion } from '../composables/useSesion'
import { useTareas } from '../composables/useTareas'
import { useTiempoReal } from '../composables/useTiempoReal'
import { useMensaje } from '../composables/useMensaje'
import AvisoTiempoReal from '../components/AvisoTiempoReal.vue'
import FormularioTarea from '../components/FormularioTarea.vue'
import ListaTareas from '../components/ListaTareas.vue'
import MensajeEstado from '../components/MensajeEstado.vue'

const router = useRouter()
const { usuario } = useSesion()
const usuarioId = computed(() => usuario.value ? usuario.value.id : '')

const { tareas, cargar, crear, actualizar, eliminar } = useTareas(usuarioId)
const { aviso } = useTiempoReal(cargar, usuarioId)
const { texto, tipo, mostrar } = useMensaje()

const tareaEnEdicion = ref(null)
const claveFormulario = ref(0)

function manejarFallo(resultado) {
  if (resultado.estado === 401) {
    limpiarSesionLocal()
    router.push({ name: 'login' })
    return
  }
  mostrar(resultado.mensaje, 'error')
}

function terminarEdicion() {
  tareaEnEdicion.value = null
  claveFormulario.value++
}

async function guardarTarea(datos) {
  const resultado = tareaEnEdicion.value
    ? await actualizar(tareaEnEdicion.value._id, datos)
    : await crear(datos)

  if (!resultado.ok) {
    manejarFallo(resultado)
    return
  }

  terminarEdicion()
  mostrar(resultado.mensaje)
}

async function eliminarTarea(tarea) {
  if (!confirm(`¿Seguro que deseas eliminar la tarea "${tarea.titulo}"?`)) {
    return
  }

  const resultado = await eliminar(tarea._id)
  if (!resultado.ok) {
    manejarFallo(resultado)
    return
  }

  if (tareaEnEdicion.value && tareaEnEdicion.value._id === tarea._id) {
    terminarEdicion()
  }
  mostrar(resultado.mensaje)
}

onMounted(async () => {
  const resultado = await cargar()
  if (!resultado.ok) {
    manejarFallo(resultado)
  }
})
</script>

<template>
  <main>
    <AvisoTiempoReal :texto="aviso" />

    <section id="nueva-tarea">
      <h2>{{ tareaEnEdicion ? 'Editar tarea' : 'Nueva tarea o evento' }}</h2>
      <FormularioTarea
        :key="claveFormulario"
        :tarea-edicion="tareaEnEdicion"
        @guardar="guardarTarea"
        @cancelar="terminarEdicion"
      />
      <MensajeEstado :texto="texto" :tipo="tipo" />
    </section>

    <section id="lista">
      <h2>Tareas y eventos programados</h2>
      <ListaTareas
        :tareas="tareas"
        :usuario-id="usuarioId"
        @editar="tareaEnEdicion = $event"
        @eliminar="eliminarTarea"
      />
    </section>
  </main>
</template>
