<script setup>
import IndicadorCarga from './IndicadorCarga.vue'
import MensajeEstado from './MensajeEstado.vue'
import TarjetaTarea from './TarjetaTarea.vue'

const props = defineProps({
  tareas: { type: Array, required: true },
  usuarioId: { type: String, default: '' },
  cargando: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

defineEmits(['editar', 'eliminar'])

function esPropia(tarea) {
  return tarea.creadoPor !== null && String(tarea.creadoPor._id) === props.usuarioId
}
</script>

<template>
  <IndicadorCarga v-if="cargando && tareas.length === 0" texto="Cargando tareas..." />
  <MensajeEstado v-else-if="error && tareas.length === 0" :texto="error" tipo="error" />
  <p v-else-if="tareas.length === 0" class="vacio">Todavía no hay tareas registradas.</p>
  <ul v-else class="lista-tareas" :class="{ actualizando: cargando }" :aria-busy="cargando">
    <TarjetaTarea
      v-for="tarea in tareas"
      :key="tarea._id"
      :tarea="tarea"
      :es-propia="esPropia(tarea)"
      @editar="$emit('editar', $event)"
      @eliminar="$emit('eliminar', $event)"
    />
  </ul>
</template>

<style scoped>
.vacio {
  font-style: italic;
}

.lista-tareas {
  list-style-type: none;
  display: grid;
  gap: 15px;
  margin-top: 15px;
  transition: opacity 0.2s;
}

.actualizando {
  opacity: 0.6;
}

@media (min-width: 768px) {
  .lista-tareas {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
