<script setup>
import TarjetaTarea from './TarjetaTarea.vue'

const props = defineProps({
  tareas: { type: Array, required: true },
  usuarioId: { type: String, default: '' },
})

defineEmits(['editar', 'eliminar'])

function esPropia(tarea) {
  return tarea.creadoPor !== null && String(tarea.creadoPor._id) === props.usuarioId
}
</script>

<template>
  <p v-if="tareas.length === 0">Todavía no hay tareas registradas.</p>
  <ul v-else class="lista-tareas">
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
.lista-tareas {
  list-style-type: none;
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

@media (min-width: 768px) {
  .lista-tareas {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

