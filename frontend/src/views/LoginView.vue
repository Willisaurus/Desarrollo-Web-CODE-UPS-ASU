<script setup>
import { RouterLink, useRouter } from 'vue-router'
import FormularioLogin from '../components/FormularioLogin.vue'

const router = useRouter()

function irAlDashboard() {
  router.push({ name: 'tareas' })
}
</script>

<template>
  <main class="contenedor-angosto">
    <section>
      <h2>Iniciar sesión</h2>
      <FormularioLogin @sesion-iniciada="irAlDashboard" />
      <p class="texto-ayuda">
        ¿Aún no tienes cuenta? <RouterLink to="/#inscripcion">Regístrate aquí</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.contenedor-angosto {
  max-width: 520px;
  margin: 20px auto;
}
</style>
