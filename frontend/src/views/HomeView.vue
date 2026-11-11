<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { pedirApi, obtenerMensajeError, estadoSesion } from '../services/api'

const DOMINIOS_PERMITIDOS = ['@est.ups.edu.ec', '@ups.edu.ec']

const formulario = reactive({
  nombre: '',
  correo: '',
  password: '',
  area: '',
})

const mensaje = ref('')
const tipoMensaje = ref('')

function mostrarMensaje(texto, tipo) {
  mensaje.value = texto
  tipoMensaje.value = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito'
}

function limpiarFormulario() {
  formulario.nombre = ''
  formulario.correo = ''
  formulario.password = ''
  formulario.area = ''
  mensaje.value = ''
  tipoMensaje.value = ''
}

function validarRegistro() {
  if (formulario.nombre.trim() === '') {
    return 'Por favor, ingresa tu nombre completo.'
  }
  const correoLimpio = formulario.correo.trim().toLowerCase()
  if (!DOMINIOS_PERMITIDOS.some(dominio => correoLimpio.endsWith(dominio))) {
    return 'Debes ingresar un correo institucional válido (@est.ups.edu.ec o @ups.edu.ec).'
  }
  if (formulario.password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (formulario.area === '') {
    return 'Por favor, selecciona un área de interés de la lista.'
  }
  return ''
}

async function enviarRegistro() {
  const error = validarRegistro()
  if (error) {
    mostrarMensaje(error, 'error')
    return
  }

  const datos = {
    nombre: formulario.nombre.trim(),
    correo: formulario.correo.trim().toLowerCase(),
    password: formulario.password,
    area: formulario.area,
  }

  const respuesta = await pedirApi('POST', '/api/auth/registro', datos)

  if (!respuesta.ok) {
    mostrarMensaje(obtenerMensajeError(respuesta.cuerpo), 'error')
    return
  }

  const nombreRegistrado = datos.nombre
  limpiarFormulario()
  mostrarMensaje(`¡Registro exitoso, ${nombreRegistrado}! Ya puedes iniciar sesión.`, 'exito')
}
</script>

<template>
  <main>
    <section id="grupo-asu">
      <h2>1. ¿Qué es un Grupo ASU?</h2>
      <p>
        Las siglas <strong>ASU</strong> hacen referencia a Asociacionismo Salesiano Universitario,
        por lo cual estos grupos son espacios donde estudiantes y docentes se reúnen
        para realizar y generar proyectos para la comunidad universitaria en pro de un
        desarrollo comunitario sostenido y libre de fines de lucro.
      </p>
    </section>

    <section id="codeups">
      <h2>2. ¿Qué es CodeUPS?</h2>
      <p>
        Code UPS es un grupo ASU que tiene como objetivo principal fomentar el desarrollo de
        habilidades tecnológicas y la innovación en la comunidad universitaria. A través de
        talleres, proyectos y actividades colaborativas, buscamos capacitar a los estudiantes
        en áreas como desarrollo web, inteligencia artificial y vinculación comunitaria.
      </p>
      <figure class="contenedor-imagen">
        <img src="/logo.jpg" alt="Logo oficial de Code UPS" width="300" height="200">
        <figcaption>Comunidad de desarrollo estudiantil CodeUPS</figcaption>
      </figure>
    </section>

    <section id="lineas-trabajo">
      <h2>3. Líneas de Trabajo</h2>
      <p>Conoce nuestras principales áreas de trabajo</p>
      <ul class="tarjetas-contenedor">
        <li class="tarjeta">
          <h3>Desarrollo Web</h3>
          <p>Creación de sitios y aplicaciones web accesibles usando HTML5, CSS3, JavaScript y Vue.</p>
        </li>
        <li class="tarjeta">
          <h3>Inteligencia Artificial</h3>
          <p>Capacitación y concientización sobre el uso ético y responsable de la IA en flujos de trabajo.</p>
        </li>
        <li class="tarjeta">
          <h3>Vinculación</h3>
          <p>Campañas de alfabetización digital, soporte técnico y ayuda tecnológica en la comunidad.</p>
        </li>
      </ul>
    </section>

    <section id="mision-vision">
      <h2>4. Misión y Visión</h2>
      <p>
        La visión de CodeUPS es ser una organización estudiantil líder en el desarrollo de proyectos
        tecnológicos abiertos que impacten positivamente en la comunidad universitaria y la sociedad ecuatoriana.
      </p>
    </section>

    <section id="inscripcion">
      <h2>5. Formulario de Inscripción</h2>
      <form @submit.prevent="enviarRegistro" novalidate>
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

          <p v-if="mensaje" :class="tipoMensaje" aria-live="polite">{{ mensaje }}</p>

          <div class="grupo-botones">
            <button type="submit">Registrarme</button>
            <button type="button" @click="limpiarFormulario">Limpiar formulario</button>
          </div>
        </fieldset>
      </form>
      <p v-if="!estadoSesion.usuario" class="texto-ayuda">
        ¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión aquí</RouterLink>
      </p>
    </section>
  </main>
</template>
