<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { verificarSesionActiva } from '../services/api'
import { useSesion } from '../composables/useSesion'
import { useTareas } from '../composables/useTareas'
import TarjetaUsuario from '../components/TarjetaUsuario.vue'
import ResumenTareas from '../components/ResumenTareas.vue'

const { usuario } = useSesion()
const usuarioId = computed(() => usuario.value ? usuario.value.id : '')
const { resumen, cargar } = useTareas(usuarioId)

onMounted(async () => {
  await verificarSesionActiva(true)
  await cargar()
})
</script>

<template>
  <main>
    <section v-if="usuario">
      <h2>Perfil del Estudiante</h2>
      <TarjetaUsuario :usuario="usuario" />
    </section>

    <section>
      <h2>Resumen de mis tareas</h2>
      <ResumenTareas :resumen="resumen" />
      <p class="texto-ayuda">
        <RouterLink to="/tareas">Ir al Dashboard de Tareas →</RouterLink>
      </p>
    </section>
  </main>
</template>


