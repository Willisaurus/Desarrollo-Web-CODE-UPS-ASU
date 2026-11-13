<script setup>
import { useConexion } from '../composables/useConexion'

const { enLinea } = useConexion()
</script>

<template>
  <p v-if="!enLinea" class="sin-conexion" role="status" aria-live="polite">
    Sin conexión a internet. Puedes ver las secciones ya cargadas, pero no consultar ni guardar tareas hasta recuperarla.
  </p>
</template>

<style scoped>
.sin-conexion {
  position: sticky;
  top: 0;
  z-index: 20;
  background-color: var(--rojo);
  color: var(--blanco);
  text-align: center;
  font-weight: bold;
  padding: 10px 15px;
}
</style>

