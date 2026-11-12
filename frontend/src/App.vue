<script setup>
import { RouterView } from 'vue-router'
import BarraNavegacion from './components/BarraNavegacion.vue'
import PiePagina from './components/PiePagina.vue'
</script>

<template>
  <BarraNavegacion />
  <RouterView />
  <PiePagina />
</template>
