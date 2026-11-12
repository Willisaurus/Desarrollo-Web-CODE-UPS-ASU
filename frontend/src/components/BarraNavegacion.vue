<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useSesion } from '../composables/useSesion'

const router = useRouter()
const { usuario, autenticado, cerrarSesion } = useSesion()

async function salir() {
  await cerrarSesion()
  router.push({ name: 'login' })
}
</script>

<template>
  <header>
    <div class="header-top">
      <h1><RouterLink to="/">CODE UPS</RouterLink></h1>
      <nav aria-label="Navegación principal">
        <ul>
          <li><RouterLink to="/">Inicio</RouterLink></li>
          <template v-if="autenticado">
            <li><RouterLink to="/tareas">Dashboard de Tareas</RouterLink></li>
            <li><RouterLink to="/perfil">Perfil ({{ usuario.nombre }})</RouterLink></li>
            <li><button type="button" class="boton-salir" @click="salir">Cerrar sesión</button></li>
          </template>
          <li v-else><RouterLink to="/login">Iniciar sesión</RouterLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: var(--azul);
  color: var(--blanco);
  padding: 15px 20px;
  border-bottom: 5px solid var(--amarillo);
}

.header-top {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

h1 {
  font-size: 1.5rem;
}

h1 a {
  color: var(--amarillo);
  text-decoration: none;
}

ul {
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

nav a {
  color: var(--blanco);
  text-decoration: none;
  font-weight: bold;
  padding: 6px 10px;
  border-radius: 4px;
}

nav a:hover,
nav a.router-link-exact-active {
  background-color: var(--amarillo);
  color: var(--azul);
}

.boton-salir {
  background-color: transparent;
  color: var(--amarillo);
  border-color: var(--amarillo);
  padding: 6px 12px;
}

.boton-salir:hover {
  background-color: var(--amarillo);
  border-color: var(--amarillo);
  color: var(--azul);
}
</style>

