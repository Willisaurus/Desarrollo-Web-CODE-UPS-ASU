<script setup>
defineProps({
  texto: { type: String, default: '' },
  tipo: { type: String, default: 'exito', validator: valor => ['exito', 'error'].includes(valor) },
})
</script>

<template>
  <p v-if="texto" :class="['mensaje', tipo]" aria-live="polite">{{ texto }}</p>
</template>

<style scoped>
.mensaje {
  font-weight: bold;
  margin-top: 10px;
}

.exito {
  color: var(--verde);
}

.error {
  color: var(--rojo);
}
</style>

