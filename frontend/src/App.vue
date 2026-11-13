<script setup>
import { ref, nextTick } from 'vue'
import { RouterView, START_LOCATION, useRouter } from 'vue-router'
import AvisoConexion from './components/AvisoConexion.vue'
import BarraNavegacion from './components/BarraNavegacion.vue'
import PiePagina from './components/PiePagina.vue'

const router = useRouter()
const contenido = ref(null)

function enfocarContenido() {
  contenido.value?.focus()
}

router.afterEach((to, from) => {
  if (from !== START_LOCATION && to.path !== from.path) {
    nextTick(enfocarContenido)
  }
})
</script>

<template>
  <a class="saltar-contenido" href="#contenido" @click.prevent="enfocarContenido">
    Saltar al contenido principal
  </a>
  <AvisoConexion />
  <BarraNavegacion />
  <div id="contenido" ref="contenido" tabindex="-1" class="contenido">
    <RouterView />
  </div>
  <PiePagina />
</template>

<style scoped>
.saltar-contenido {
  position: absolute;
  left: 10px;
  top: -60px;
  z-index: 30;
  background-color: var(--amarillo);
  color: var(--azul);
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 0 0 5px 5px;
  transition: top 0.2s;
}

.saltar-contenido:focus {
  top: 0;
}

.contenido:focus {
  outline: none;
}
</style>
