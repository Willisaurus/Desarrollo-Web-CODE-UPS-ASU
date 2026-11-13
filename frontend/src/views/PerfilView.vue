<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSesion } from '../composables/useSesion'
import { useTareas } from '../composables/useTareas'
import { crearComponenteAsincrono } from '../utils/componentesAsincronos'
import IndicadorCarga from '../components/IndicadorCarga.vue'
import MensajeEstado from '../components/MensajeEstado.vue'

const TarjetaUsuario = crearComponenteAsincrono(() => import('../components/TarjetaUsuario.vue'))
const ResumenTareas = crearComponenteAsincrono(() => import('../components/ResumenTareas.vue'))

const { usuario, verificar } = useSesion()
const usuarioId = computed(() => usuario.value ? usuario.value.id : '')
const { resumen, cargando, errorCarga, cargar } = useTareas(usuarioId)

onMounted(async () => {
  await verificar(true)
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
      <IndicadorCarga v-if="cargando" texto="Calculando resumen..." />
      <MensajeEstado v-else-if="errorCarga" :texto="errorCarga" tipo="error" />
      <ResumenTareas v-else :resumen="resumen" />
      <p class="texto-ayuda">
        <RouterLink to="/tareas">Ir al Dashboard de Tareas →</RouterLink>
      </p>
    </section>
  </main>
</template>
