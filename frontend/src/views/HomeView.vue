<script setup>
import { RouterLink } from 'vue-router'
import { useSesion } from '../composables/useSesion'
import FormularioRegistro from '../components/FormularioRegistro.vue'

const { autenticado } = useSesion()
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
      <ul class="lineas">
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
      <FormularioRegistro />
      <p v-if="!autenticado" class="texto-ayuda">
        ¿Ya tienes cuenta? <RouterLink to="/login">Inicia sesión aquí</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.contenedor-imagen {
  margin-top: 15px;
  text-align: center;
}

.lineas {
  list-style-type: none;
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

@media (min-width: 768px) {
  .lineas {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
