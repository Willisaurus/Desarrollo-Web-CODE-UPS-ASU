<script setup>
import { formatearFecha } from '../utils/formato'

defineProps({
  tarea: { type: Object, required: true },
  esPropia: { type: Boolean, default: false },
})

defineEmits(['editar', 'eliminar'])

const CLASES_ESTADO = {
  'Pendiente': 'estado-pendiente',
  'En Progreso': 'estado-progreso',
  'Completada': 'estado-completada',
}
</script>

<template>
  <li class="tarjeta">
    <h3>{{ tarea.titulo }}</h3>
    <span class="estado" :class="CLASES_ESTADO[tarea.estado]">{{ tarea.estado }}</span>
    <p>{{ tarea.descripcion || 'Sin descripción' }}</p>
    <p>Área: {{ tarea.area }}</p>
    <p>Entrega: {{ formatearFecha(tarea.fechaEntrega) }}</p>
    <p class="autor">
      Creada por: {{ tarea.creadoPor ? tarea.creadoPor.nombre : 'Usuario eliminado' }}
    </p>

    <div v-if="esPropia" class="grupo-botones">
      <button type="button" @click="$emit('editar', tarea)">Editar</button>
      <button type="button" class="boton-peligro" @click="$emit('eliminar', tarea)">
        Eliminar
      </button>
    </div>
  </li>
</template>

<style scoped>
.tarjeta p {
  margin-top: 5px;
}

.estado {
  display: inline-block;
  padding: 2px 10px;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 3px;
}

.estado-pendiente {
  background-color: var(--amarillo);
  color: var(--azul);
}

.estado-progreso {
  background-color: var(--azul);
  color: var(--blanco);
}

.estado-completada {
  background-color: var(--verde);
  color: var(--blanco);
}

.autor {
  font-style: italic;
}

.boton-peligro {
  background-color: var(--rojo);
  border-color: var(--rojo);
}

.boton-peligro:hover {
  background-color: var(--amarillo);
  border-color: var(--amarillo);
  color: var(--azul);
}
</style>

