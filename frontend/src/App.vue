<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { estadoSesion, pedirApi, limpiarSesionLocal } from './services/api'

const router = useRouter()

async function cerrarSesion() {
  await pedirApi('POST', '/api/auth/logout')
  limpiarSesionLocal()
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
          <template v-if="estadoSesion.usuario">
            <li><RouterLink to="/tareas">Dashboard de Tareas</RouterLink></li>
            <li><RouterLink to="/perfil">Perfil ({{ estadoSesion.usuario.nombre }})</RouterLink></li>
            <li>
              <button type="button" class="boton-secundario" @click="cerrarSesion">
                Cerrar sesión
              </button>
            </li>
          </template>
          <template v-else>
            <li><RouterLink to="/login">Iniciar sesión</RouterLink></li>
          </template>
        </ul>
      </nav>
    </div>
  </header>

  <RouterView />

  <footer>
    <address>Contacto: codeups@ups.edu.ec</address>
    <p>&copy; 2026 CODE UPS - Universidad Politécnica Salesiana.</p>
  </footer>
</template>
