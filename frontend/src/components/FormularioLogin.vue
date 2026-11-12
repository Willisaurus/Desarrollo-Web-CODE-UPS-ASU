<script setup>
import { reactive } from 'vue'
import { useSesion } from '../composables/useSesion'
import { useValidaciones } from '../composables/useValidaciones'
import { useMensaje } from '../composables/useMensaje'
import MensajeEstado from './MensajeEstado.vue'

const emit = defineEmits(['sesion-iniciada'])

const { iniciarSesion } = useSesion()
const { validarLogin } = useValidaciones()
const { texto, tipo, mostrar } = useMensaje()

const credenciales = reactive({
  correo: '',
  password: '',
})

async function enviar() {
  const error = validarLogin(credenciales)
  if (error) {
    mostrar(error, 'error')
    return
  }

  const resultado = await iniciarSesion({
    correo: credenciales.correo.trim().toLowerCase(),
    password: credenciales.password,
  })

  if (!resultado.ok) {
    mostrar(resultado.mensaje, 'error')
    return
  }

  emit('sesion-iniciada')
}
</script>

<template>
  <form novalidate @submit.prevent="enviar">
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

      <MensajeEstado :texto="texto" :tipo="tipo" />

      <div class="grupo-botones">
        <button type="submit">Ingresar</button>
      </div>
    </fieldset>
  </form>
</template>

