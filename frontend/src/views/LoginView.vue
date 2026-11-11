<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { pedirApi, obtenerMensajeError, estadoSesion } from '../services/api'

const router = useRouter()

const credenciales = reactive({
  correo: '',
  password: '',
})

const mensajeError = ref('')

async function iniciarSesion() {
  mensajeError.value = ''

  const datos = {
    correo: credenciales.correo.trim().toLowerCase(),
    password: credenciales.password,
  }

  if (datos.correo === '' || datos.password === '') {
    mensajeError.value = 'Ingresa tu correo y tu contraseña.'
    return
  }

  const respuesta = await pedirApi('POST', '/api/auth/login', datos)

  if (!respuesta.ok) {
    mensajeError.value = obtenerMensajeError(respuesta.cuerpo)
    return
  }

  estadoSesion.usuario = respuesta.cuerpo.datos
  estadoSesion.verificado = true
  router.push({ name: 'tareas' })
}
</script>

<template>
  <main class="contenedor-angosto">
    <section>
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="iniciarSesion" novalidate>
        <fieldset>
          <legend>Acceso para estudiantes</legend>

          <div class="campo-formulario">
            <label for="correo">Correo institucional:</label>
            <input
              id="correo"
              v-model="credenciales.correo"
              type="email"
              placeholder="usuario@est.ups.edu.ec"
              autocomplete="username"
              required
            >
          </div>

          <div class="campo-formulario">
            <label for="password">Contraseña:</label>
            <input
              id="password"
              v-model="credenciales.password"
              type="password"
              autocomplete="current-password"
              required
            >
          </div>

          <p v-if="mensajeError" class="mensaje-error" aria-live="polite">
            {{ mensajeError }}
          </p>

          <div class="grupo-botones">
            <button type="submit">Ingresar</button>
          </div>
        </fieldset>
      </form>
      <p class="texto-ayuda">
        ¿Aún no tienes cuenta? <RouterLink to="/#inscripcion">Regístrate aquí</RouterLink>
      </p>
    </section>
  </main>
</template>

