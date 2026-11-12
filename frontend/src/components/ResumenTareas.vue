<script setup>
defineProps({
  resumen: { type: Object, required: true },
})
</script>

<template>
  <ul class="resumen">
    <li class="tarjeta">
      <h3>Total creadas</h3>
      <p>{{ resumen.total }} tareas</p>
    </li>
    <li class="tarjeta">
      <h3>Pendientes</h3>
      <p>{{ resumen.pendientes }} tareas</p>
    </li>
    <li class="tarjeta">
      <h3>Completadas</h3>
      <p>{{ resumen.completadas }} tareas ({{ resumen.enProgreso }} en progreso)</p>
    </li>
  </ul>
</template>

<style scoped>
.resumen {
  list-style-type: none;
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

@media (min-width: 768px) {
  .resumen {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

