<script setup>
defineProps({
  texto: { type: String, default: '' },
})
</script>

<template>
  <p v-if="texto" class="aviso" role="status" aria-live="polite">{{ texto }}</p>
</template>

<style scoped>
.aviso {
  position: sticky;
  top: 10px;
  z-index: 10;
  background-color: var(--amarillo);
  color: var(--azul);
  border-left: 5px solid var(--azul);
  padding: 10px 15px;
  margin-bottom: 20px;
  font-weight: bold;
}
</style>

