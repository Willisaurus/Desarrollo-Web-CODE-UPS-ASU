<script setup>
defineProps({
  texto: { type: String, default: 'Cargando...' },
})
</script>

<template>
  <p class="indicador" role="status" aria-live="polite">
    <span class="rueda" aria-hidden="true"></span>
    {{ texto }}
  </p>
</template>

<style scoped>
.indicador {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  margin-top: 10px;
}

.rueda {
  width: 18px;
  height: 18px;
  border: 3px solid var(--gris-claro);
  border-top-color: var(--azul);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>

