<script setup>
import { reactive, ref } from 'vue'
import { useSesion } from '../composables/useSesion'
import { useValidaciones } from '../composables/useValidaciones'
import { useMensaje } from '../composables/useMensaje'
import MensajeEstado from './MensajeEstado.vue'

const { registrar } = useSesion()
const { validarRegistro } = useValidaciones()
const { texto, tipo, mostrar, limpiar } = useMensaje()

const formulario = reactive({
  nombre: '',
  correo: '',
  password: '',
  area: '',
})

function limpiarFormulario() {
  formulario.nombre = ''
  formulario.correo = ''
  formulario.password = ''
  formulario.area = ''
  limpiar()
}

const enviando = ref(false)

async function enviar() {
  if (enviando.value) {
    return
  }

  const error = validarRegistro(formulario)
  if (error) {
    mostrar(error, 'error')
    return
  }

  const nombre = formulario.nombre.trim()
  enviando.value = true
  const resultado = await registrar({
    nombre,
    correo: formulario.correo.trim().toLowerCase(),
    password: formulario.password,
    area: formulario.area,
  })
  enviando.value = false

  if (!resultado.ok) {
    mostrar(resultado.mensaje, 'error')
    return
  }

  limpiarFormulario()
  mostrar(`¡Registro exitoso, ${nombre}! Ya puedes iniciar sesión.`)
}
</script>

<template>
  <form novalidate @submit.prevent="enviar">
    <fieldset>
      <legend>Datos del Estudiante</legend>

      <div class="campo-formulario">
        <label for="nombre">Nombre completo:</label>
        <input
          id="nombre"
          v-model="formulario.nombre"
          type="text"
          placeholder="Ej. Juan Pérez"
          autocomplete="name"
          required
        >
      </div>

      <div class="campo-formulario">
        <label for="correo">Correo institucional:</label>
        <input
          id="correo"
          v-model="formulario.correo"
          type="email"
          placeholder="usuario@est.ups.edu.ec"
          autocomplete="email"
          required
        >
      </div>

      <div class="campo-formulario">
        <label for="password">Contraseña:</label>
        <input
          id="password"
          v-model="formulario.password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          autocomplete="new-password"
          required
        >
      </div>

      <div class="campo-formulario">
        <label for="area">Área de interés:</label>
        <select id="area" v-model="formulario.area" required>
          <option value="">-- Selecciona un área --</option>
          <option value="Desarrollo Web">Desarrollo Web</option>
          <option value="Inteligencia Artificial">Inteligencia Artificial</option>
          <option value="Vinculación">Vinculación</option>
        </select>
      </div>

      <MensajeEstado :texto="texto" :tipo="tipo" />

      <div class="grupo-botones">
        <button type="submit" :disabled="enviando">
          {{ enviando ? 'Registrando...' : 'Registrarme' }}
        </button>
        <button type="button" :disabled="enviando" @click="limpiarFormulario">Limpiar formulario</button>
      </div>
    </fieldset>
  </form>
</template>

